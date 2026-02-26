import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, Users, Database, Server, Terminal, Play, RotateCcw, ArrowLeft, Zap, Trash2, Plus, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

function QuestionBankUI({ socket, serverData }: { socket: Socket | null; serverData: any }) {
    const [selectedLevel, setSelectedLevel] = useState<1 | 2>(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedQ, setExpandedQ] = useState<string | number | null>(null);
    const [newQ, setNewQ] = useState({ question: '', options: ['', '', '', ''], correct: 0, explanation: '', timer: 30 });

    const questions = selectedLevel === 1
        ? (serverData?.questions?.level1 || [])
        : (serverData?.questions?.level2 || []);

    const handleAdd = () => {
        if (!socket || !newQ.question.trim() || newQ.options.some(o => !o.trim())) return;
        socket.emit('adminAddQuestion', { ...newQ, level: selectedLevel });
        setNewQ({ question: '', options: ['', '', '', ''], correct: 0, explanation: '', timer: 30 });
        setShowAddForm(false);
        setTimeout(() => socket.emit('adminGetData'), 500);
    };

    const handleDelete = (id: string | number) => {
        if (!socket || !window.confirm('Delete this question?')) return;
        socket.emit('adminDeleteQuestion', { id, level: selectedLevel });
        setTimeout(() => socket.emit('adminGetData'), 500);
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Level Tabs */}
            <div className="flex gap-2 mb-4">
                {[1, 2].map(lvl => (
                    <button key={lvl} onClick={() => { setSelectedLevel(lvl as 1 | 2); setExpandedQ(null); }}
                        className={`flex-1 py-2 font-mono text-sm border transition-colors ${selectedLevel === lvl ? 'bg-blood/20 border-blood text-white' : 'border-border-gray text-text-dim hover:border-blood'}`}>
                        LEVEL {lvl} ({lvl === 1 ? serverData?.questions?.level1?.length || 0 : serverData?.questions?.level2?.length || 0})
                    </button>
                ))}
            </div>

            {/* Questions List */}
            <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4">
                {questions.length === 0 && (
                    <div className="text-center p-8 text-text-muted font-mono text-sm">NO QUESTIONS FOR LEVEL {selectedLevel}</div>
                )}
                {questions.map((q: any, idx: number) => (
                    <div key={q.id} className="bg-deep border border-border-gray">
                        <div className="p-3 flex items-start justify-between gap-2 cursor-pointer" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                            <div className="flex-1 min-w-0">
                                <span className="font-mono text-xs text-text-muted mr-2">Q{idx + 1}</span>
                                <span className="font-mono text-sm text-text-bright">{q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                    className="p-1 text-text-dim hover:text-blood transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {expandedQ === q.id ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
                            </div>
                        </div>
                        {expandedQ === q.id && (
                            <div className="px-3 pb-3 border-t border-border-gray pt-2 space-y-1">
                                <p className="font-mono text-xs text-text-bright mb-2">{q.question}</p>
                                {q.options?.map((opt: string, oi: number) => (
                                    <div key={oi} className={`flex items-center gap-2 font-mono text-xs px-2 py-1 ${oi === q.correct ? 'text-toxic bg-toxic/10 border border-toxic/30' : 'text-text-dim'}`}>
                                        {oi === q.correct && <Check className="w-3 h-3" />}
                                        <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                                    </div>
                                ))}
                                {q.explanation && <p className="font-mono text-xs text-text-muted mt-2 italic">💡 {q.explanation}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Button / Form */}
            {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)}
                    className="w-full py-2 border border-dashed border-border-rust text-text-dim hover:border-blood hover:text-white transition-colors font-mono text-sm flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> ADD QUESTION TO LEVEL {selectedLevel}
                </button>
            ) : (
                <div className="border border-blood/30 bg-deep p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-mono text-sm text-blood font-bold">NEW QUESTION — LEVEL {selectedLevel}</h4>
                        <button onClick={() => setShowAddForm(false)} className="text-text-dim hover:text-white text-xs font-mono">CANCEL</button>
                    </div>
                    <textarea value={newQ.question} onChange={e => setNewQ({ ...newQ, question: e.target.value })}
                        className="w-full bg-void-black border border-border-rust text-text-bright px-3 py-2 rounded font-mono text-sm focus:border-blood focus:outline-none resize-none h-16"
                        placeholder="Enter question text..." />
                    {newQ.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                            <button onClick={() => setNewQ({ ...newQ, correct: oi })}
                                className={`w-7 h-7 shrink-0 border font-mono text-xs flex items-center justify-center ${newQ.correct === oi ? 'bg-toxic/20 border-toxic text-toxic' : 'border-border-gray text-text-dim hover:border-blood'}`}>
                                {String.fromCharCode(65 + oi)}
                            </button>
                            <input value={opt} onChange={e => { const opts = [...newQ.options]; opts[oi] = e.target.value; setNewQ({ ...newQ, options: opts }); }}
                                className="flex-1 bg-void-black border border-border-rust text-text-bright px-3 py-1.5 rounded font-mono text-sm focus:border-blood focus:outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        </div>
                    ))}
                    <input value={newQ.explanation} onChange={e => setNewQ({ ...newQ, explanation: e.target.value })}
                        className="w-full bg-void-black border border-border-rust text-text-bright px-3 py-1.5 rounded font-mono text-sm focus:border-blood focus:outline-none"
                        placeholder="Explanation (optional)" />
                    <button onClick={handleAdd} disabled={!newQ.question.trim() || newQ.options.some(o => !o.trim())}
                        className="w-full py-2 bg-blood/20 border border-blood text-blood hover:bg-blood hover:text-white transition-colors font-mono text-sm tracking-widest disabled:opacity-30 disabled:cursor-not-allowed">
                        SUBMIT QUESTION
                    </button>
                </div>
            )}
        </div>
    );
}

export function AdminScreen({ onClose, onAdminAuth }: { onClose: () => void; onAdminAuth: () => void }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [activeTab, setActiveTab] = useState<'dashboard' | 'questions'>('dashboard');
    const [isQuestionBankAuth, setIsQuestionBankAuth] = useState(false);
    const [qbPassword, setQbPassword] = useState('');

    const [socket, setSocket] = useState<Socket | null>(null);
    const [serverData, setServerData] = useState<any>(null);

    useEffect(() => {
        // Connect to server when authenticated
        if (isAuthenticated) {
            const serverUrl = import.meta.env.DEV ? 'http://localhost:3001' : undefined;
            const newSocket = io(serverUrl as any);
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('adminGetData');
            });

            newSocket.on('adminData', (data) => {
                setServerData(data);
            });

            newSocket.on('gameState', () => {
                newSocket.emit('adminGetData');
            });

            newSocket.on('leaderboardUpdate', () => {
                newSocket.emit('adminGetData');
            });

            newSocket.on('playerCompleted', () => {
                newSocket.emit('adminGetData');
            });

            const interval = setInterval(() => {
                newSocket.emit('adminGetData');
            }, 2000);

            return () => {
                clearInterval(interval);
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'joker') {
            setIsAuthenticated(true);
            onAdminAuth();
        } else {
            alert('ACCESS DENIED');
            setPassword('');
        }
    };

    const handleQBLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (qbPassword === 'jarvis') {
            setIsQuestionBankAuth(true);
        } else {
            alert('ACCESS DENIED');
            setQbPassword('');
        }
    };

    const startGame = () => {
        if (socket) socket.emit('adminStartGame');
    };

    const resetGame = () => {
        if (socket && window.confirm('Are you sure you want to reset the entire simulation?')) {
            socket.emit('adminResetGame');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
                <div className="absolute inset-0 hex-bg opacity-50 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="panel max-w-md w-full relative z-10"
                >
                    <div className="panel-header flex items-center gap-2 border-b border-blood/30">
                        <Shield className="w-5 h-5 text-blood" />
                        SYSTEM OVERRIDE
                    </div>
                    <form onSubmit={handleLogin} className="p-8">
                        <div className="text-center mb-8">
                            <Lock className="w-12 h-12 text-blood mx-auto mb-4 animate-pulse" />
                            <h2 className="font-orbitron text-2xl font-bold text-text-bright tracking-widest">
                                ADMINISTRATION
                            </h2>
                            <p className="font-mono text-sm text-text-dim mt-2">
                                ENTER CLEARANCE CODE
                            </p>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-deep border border-border-rust text-text-bright px-4 py-3 rounded font-mono text-center tracking-widest mb-6 focus:border-blood focus:outline-none"
                            placeholder="•••••"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="btn-primary w-full tracking-[0.2em]"
                        >
                            AUTHENTICATE
                        </button>
                    </form>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-dim hover:text-white transition-colors"
                        title="Exit Admin Panel"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-background relative overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-border-rust relative z-10">
                <div className="flex items-center gap-4">
                    <Terminal className="w-8 h-8 text-blood" />
                    <div>
                        <h1 className="font-orbitron text-2xl font-black text-text-bright">OVERSEER TERMINAL</h1>
                        <div className="flex items-center gap-2 font-mono text-xs text-text-dim">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            CONNECTED TO MAINFRAME
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-mono text-sm border border-border-gray text-text-dim hover:border-blood hover:text-white transition-colors flex items-center gap-2 mr-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        EXIT ADMIN
                    </button>

                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 font-mono text-sm border transition-colors ${activeTab === 'dashboard' ? 'bg-blood/20 border-blood text-white' : 'border-border-gray text-text-dim hover:border-blood hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4 inline mr-2" />
                        ROOM CONTROL
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 font-mono text-sm border transition-colors ${activeTab === 'questions' ? 'bg-blood/20 border-blood text-white' : 'border-border-gray text-text-dim hover:border-blood hover:text-white'}`}
                    >
                        <Database className="w-4 h-4 inline mr-2" />
                        QUESTION BANK
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {activeTab === 'dashboard' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* System Status */}
                        <div className="panel lg:col-span-2">
                            <div className="panel-header gap-2 text-blood">
                                <Server className="w-4 h-4" />
                                SIMULATION CONTROL
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <div className="bg-deep p-4 border border-border-rust text-center">
                                        <p className="font-mono text-xs text-text-muted mb-1">SUBJECTS</p>
                                        <p className="font-orbitron text-3xl font-bold text-text-bright">
                                            {serverData?.players?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-deep p-4 border border-border-rust text-center">
                                        <p className="font-mono text-xs text-text-muted mb-1">COMPLETED</p>
                                        <p className="font-orbitron text-3xl font-bold text-toxic">
                                            {serverData?.players?.filter((p: any) => p.completed).length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-deep p-4 border border-border-rust text-center">
                                        <p className="font-mono text-xs text-text-muted mb-1">ELIMINATED</p>
                                        <p className="font-orbitron text-3xl font-bold text-blood">
                                            {serverData?.players?.filter((p: any) => p.eliminated).length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-deep p-4 border border-border-rust text-center">
                                        <p className="font-mono text-xs text-text-muted mb-1">LEVEL</p>
                                        <p className="font-orbitron text-xl font-bold text-gold mt-2">
                                            {serverData?.settings?.currentLevel || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 flex-wrap">
                                    {!serverData?.settings?.isActive && !serverData?.settings?.level1Ended && (
                                        <>
                                            <button onClick={startGame} className="flex-1 btn-primary bg-green-900 border-green-500 hover:bg-green-700">
                                                <Play className="w-4 h-4 inline mr-2" />
                                                INITIATE SIMULATION
                                            </button>
                                            <button
                                                onClick={() => { if (socket) socket.emit('adminAddBots', { count: 15 }); }}
                                                className="flex-1 btn-primary bg-blue-900 border-blue-500 hover:bg-blue-700"
                                            >
                                                <Users className="w-4 h-4 inline mr-2" />
                                                ADD 15 BOTS
                                            </button>
                                        </>
                                    )}
                                    {serverData?.settings?.level1Ended && serverData?.settings?.currentLevel === 1 && (
                                        <button
                                            onClick={() => { if (socket) socket.emit('adminStartLevel2'); }}
                                            className="flex-1 btn-primary bg-gold/20 border-gold text-gold hover:bg-gold hover:text-void-black"
                                        >
                                            <Zap className="w-4 h-4 inline mr-2" />
                                            START LEVEL 2
                                        </button>
                                    )}
                                    {serverData?.settings?.isActive && (
                                        <button
                                            onClick={() => {
                                                if (socket && window.confirm('Force end current level and trigger shortlisting? Players who haven\'t finished will be ranked with their current score.')) {
                                                    socket.emit('adminForceEndLevel');
                                                }
                                            }}
                                            className="flex-1 btn-primary bg-amber-900/50 border-amber-500 text-amber-400 hover:bg-amber-700 hover:text-white"
                                        >
                                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                                            FORCE END LEVEL
                                        </button>
                                    )}
                                    <button onClick={resetGame} className="flex-1 btn-primary tracking-widest">
                                        <RotateCcw className="w-4 h-4 inline mr-2" />
                                        PURGE & RESET
                                    </button>
                                </div>

                                {/* Game Info */}
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="bg-deep p-3 border border-border-gray">
                                        <p className="font-mono text-xs text-text-muted mb-1">L1 QUESTIONS</p>
                                        <p className="font-orbitron text-lg text-text-bright">
                                            {serverData?.questions?.level1?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-deep p-3 border border-border-gray">
                                        <p className="font-mono text-xs text-text-muted mb-1">L2 QUESTIONS</p>
                                        <p className="font-orbitron text-lg text-text-bright">
                                            {serverData?.questions?.level2?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-deep p-3 border border-border-gray">
                                        <p className="font-mono text-xs text-text-muted mb-2">L1 TIMER (sec)</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={5} max={120}
                                                defaultValue={serverData?.settings?.level1Timer || 30}
                                                className="w-16 bg-void-black border border-border-rust text-gold font-orbitron text-center py-1 focus:border-gold focus:outline-none"
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (socket && val >= 5 && val <= 120) {
                                                        socket.emit('adminUpdateSettings', { level1Timer: val });
                                                    }
                                                }}
                                            />
                                            <span className="font-mono text-xs text-text-dim">s</span>
                                        </div>
                                    </div>
                                    <div className="bg-deep p-3 border border-border-gray">
                                        <p className="font-mono text-xs text-text-muted mb-2">L2 TIMER (sec)</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={5} max={120}
                                                defaultValue={serverData?.settings?.level2Timer || 20}
                                                className="w-16 bg-void-black border border-border-rust text-gold font-orbitron text-center py-1 focus:border-gold focus:outline-none"
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (socket && val >= 5 && val <= 120) {
                                                        socket.emit('adminUpdateSettings', { level2Timer: val });
                                                    }
                                                }}
                                            />
                                            <span className="font-mono text-xs text-text-dim">s</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 border border-border-gray bg-deep text-xs font-mono text-text-dim space-y-1">
                                    <p className="text-text-muted font-bold mb-1">SCORING RULES:</p>
                                    <p>• L1 Correct = <span className="text-toxic">+50</span> | L2 Correct = <span className="text-toxic">+100</span></p>
                                    <p>• Wrong = <span className="text-blood">+15% infection (L1)</span> / <span className="text-blood">+25% (L2)</span></p>
                                    <p>• Infection ≥ 100% = <span className="text-blood">ELIMINATED</span></p>
                                    <p>• Top 10 advance to L2 | Top 5 after L2 = <span className="text-gold">CHAMPIONS</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Subject Roster - Live Status */}
                        <div className="panel">
                            <div className="panel-header gap-2 text-blood">
                                <Users className="w-4 h-4" />
                                LIVE STATUS
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto space-y-2">
                                {serverData?.players
                                    ?.sort((a: any, b: any) => {
                                        // Sort: completed first (by order), then active, then eliminated
                                        if (a.completed && !b.completed) return -1;
                                        if (!a.completed && b.completed) return 1;
                                        if (a.completed && b.completed) return a.completionOrder - b.completionOrder;
                                        if (a.eliminated && !b.eliminated) return 1;
                                        if (!a.eliminated && b.eliminated) return -1;
                                        return b.score - a.score;
                                    })
                                    .map((p: any) => (
                                        <div key={p.id} className={`p-3 bg-deep border text-sm font-mono ${p.eliminated ? 'border-blood/30 opacity-60' : p.completed ? 'border-toxic/30' : 'border-border-gray'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-text-bright font-bold">{p.name}</span>
                                                <span className={`px-2 py-0.5 text-xs border ${p.eliminated ? 'text-blood border-blood bg-blood/10' :
                                                    p.completed ? 'text-toxic border-toxic bg-toxic/10' :
                                                        'text-gold border-gold bg-gold/10'
                                                    }`}>
                                                    {p.eliminated ? 'ELIMINATED' : p.completed ? `FINISHED #${p.completionOrder}` : `Q${p.questionIndex + 1} IN PROGRESS`}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-text-dim">
                                                <span>Score: <span className="text-toxic">{p.score}</span></span>
                                                <span>✓ <span className="text-toxic">{p.correctAnswers}</span></span>
                                                <span>✗ <span className="text-blood">{p.wrongAnswers}</span></span>
                                                <span>Inf: <span className={p.infectionLevel >= 70 ? 'text-blood' : 'text-text-bright'}>{p.infectionLevel}%</span></span>
                                            </div>
                                        </div>
                                    ))}
                                {(!serverData?.players || serverData.players.length === 0) && (
                                    <div className="text-center p-8 text-text-muted font-mono text-sm">
                                        NO SUBJECTS CONNECTED
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="panel max-w-3xl mx-auto">
                        {!isQuestionBankAuth ? (
                            <form onSubmit={handleQBLogin} className="p-12 text-center">
                                <Lock className="w-12 h-12 text-blood mx-auto mb-4" />
                                <h3 className="font-orbitron text-xl mb-4 text-text-bright">RESTRICTED DIRECTORY</h3>
                                <input
                                    type="password"
                                    value={qbPassword}
                                    onChange={(e) => setQbPassword(e.target.value)}
                                    className="bg-deep border border-border-rust text-text-bright px-4 py-2 rounded font-mono text-center tracking-widest mb-4 focus:border-blood focus:outline-none block mx-auto"
                                    placeholder="FILE PASSWORD"
                                    autoFocus
                                />
                                <button type="submit" className="px-6 py-2 bg-blood/20 border border-blood text-blood hover:bg-blood hover:text-white transition-colors font-mono text-sm tracking-widest">
                                    ACCESS RECORDS
                                </button>
                            </form>
                        ) : (
                            <div className="p-0">
                                <div className="panel-header gap-2 flex justify-between items-center">
                                    <span>
                                        <Database className="w-4 h-4 inline mr-2" />
                                        QUESTION MASTER LIST
                                    </span>
                                    <button onClick={() => setActiveTab('dashboard')} className="text-xs px-2 py-1 border border-border-rust hover:border-blood transition-colors">
                                        BACK TO CONTROL
                                    </button>
                                </div>
                                <QuestionBankUI socket={socket} serverData={serverData} />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
