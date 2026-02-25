import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Users, AlertTriangle, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

export function TransitionScreen() {
    const { leaderboard, player, isSurvivor, survivors } = useGame();

    const eliminated = leaderboard.filter(p => p.status === 'ELIMINATED');
    const isSpectator = !player;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effect */}
            <motion.div
                className="absolute inset-0 bg-blood/5"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                className="relative z-10 w-full max-w-4xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Personal Status Banner (for players) */}
                {!isSpectator && (
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`text-center mb-6 p-6 border-2 ${isSurvivor
                            ? 'border-toxic/60 bg-toxic/5'
                            : 'border-blood/60 bg-blood/5'
                            }`}
                    >
                        {isSurvivor ? (
                            <>
                                <ShieldCheck className="w-12 h-12 text-toxic mx-auto mb-3" />
                                <h2 className="font-orbitron text-3xl font-black text-toxic mb-2">
                                    YOU SURVIVED
                                </h2>
                                <p className="font-mono text-text-dim flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    WAITING FOR HOST TO START LEVEL 2...
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-12 h-12 text-blood mx-auto mb-3" />
                                <h2 className="font-orbitron text-3xl font-black text-blood mb-2">
                                    ELIMINATED
                                </h2>
                                <p className="font-mono text-text-dim">
                                    YOU DID NOT MAKE THE TOP 10. BETTER LUCK NEXT TIME.
                                </p>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <ShieldAlert className="w-16 h-16 text-blood mx-auto mb-4 animate-pulse" />
                        <h1 className="font-orbitron text-4xl md:text-5xl font-black text-text-bright tracking-widest mb-2">
                            SHORTLIST COMPILED
                        </h1>
                        <p className="font-mono text-lg text-amber tracking-widest">
                            LEVEL 1 PROTOCOL COMPLETE — TOP 10 ADVANCE
                        </p>
                    </motion.div>
                </div>

                {/* Status Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Survivors Panel */}
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="panel border-2 border-toxic/40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-toxic" />
                        <div className="panel-header text-toxic gap-2 border-b border-toxic/20">
                            <Users className="w-5 h-5" />
                            <span>SURVIVORS ADVANCING ({survivors.length})</span>
                        </div>
                        <div className="p-4 bg-deep min-h-[300px] max-h-[500px] overflow-y-auto space-y-2">
                            {survivors.length > 0 ? (
                                survivors.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.1 }}
                                        className={`flex justify-between items-center bg-background border p-3 ${player && p.id === player.id
                                                ? 'border-toxic bg-toxic/10'
                                                : 'border-border-gray'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-orbitron text-sm text-toxic font-bold">#{idx + 1}</span>
                                            <span className="font-mono text-text-bright">
                                                {p.name}
                                                {player && p.id === player.id && (
                                                    <span className="text-xs text-toxic ml-2">(YOU)</span>
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-orbitron text-toxic score-text glow-toxic">
                                            {p.score}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center text-text-dim font-mono py-8">
                                    NO SUBJECTS SURVIVED
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Eliminated Panel */}
                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="panel border-2 border-blood/40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-blood" />
                        <div className="panel-header text-blood gap-2 border-b border-blood/20">
                            <AlertTriangle className="w-5 h-5" />
                            <span>ELIMINATED ({eliminated.length})</span>
                        </div>
                        <div className="p-4 bg-deep min-h-[300px] max-h-[500px] overflow-y-auto space-y-2">
                            {eliminated.length > 0 ? (
                                eliminated.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.05 }}
                                        className="flex justify-between items-center bg-background border border-blood/20 p-3 opacity-60 grayscale"
                                    >
                                        <span className="font-mono text-blood line-through decoration-blood">
                                            {p.name}
                                        </span>
                                        <span className="font-orbitron text-blood">
                                            FLATLINED
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center text-text-dim font-mono py-8">
                                    NO CASUALTIES RECORDED
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Footer info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-block border border-border-rust bg-deep/50 px-6 py-3">
                        <p className="font-mono text-sm text-text-muted flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-toxic animate-pulse" />
                            AWAITING HOST TO INITIATE LEVEL 2...
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
