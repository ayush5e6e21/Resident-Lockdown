import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Cpu, Activity, CheckCircle, XCircle, AlertTriangle, Zap, Trophy, ChevronRight } from 'lucide-react';

export function Level2Screen() {
  const {
    player,
    leaderboard,
    getCurrentQuestion,
    submitAnswer,
    lastAnswer,
    totalQuestions,
    currentQuestionIndex,
    hasCompletedQuestions,
    nextQuestion,
    questionTimer
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentQuestion = getCurrentQuestion();

  // Reset state + start visual timer when a new question arrives
  useEffect(() => {
    // Reset answer state for the new question
    setSelectedAnswer(null);
    setHasAnswered(false);

    if (!currentQuestion) return;

    setTimeLeft(questionTimer);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion?.id, questionTimer]);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    submitAnswer(index);
  };

  const isSpectator = !player;

  // Show waiting state when player has completed all questions
  if (hasCompletedQuestions && !isSpectator) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
            <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-gold mb-2">LEVEL 2 COMPLETE</h1>
            <p className="font-mono text-text-dim">AWAITING FINAL RESULTS...</p>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4"
            >
              <Activity className="w-6 h-6 text-toxic mx-auto" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="panel"
          >
            <div className="panel-header flex items-center justify-between">
              <span>FINAL RANKINGS</span>
              <span className="w-2 h-2 rounded-full bg-toxic animate-pulse" />
            </div>
            <div className="p-4 space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`leaderboard-item ${player && entry.id === player.id ? 'current-player' : ''} ${entry.status === 'ELIMINATED' ? 'opacity-50 grayscale' : ''}`}
                >
                  <span className={`font-orbitron font-bold w-5 ${entry.rank === 1 ? 'text-gold' : entry.rank === 2 ? 'text-silver' : 'text-text-dim'}`}>
                    {entry.status === 'ELIMINATED' ? '💀' : entry.rank}
                  </span>
                  <span className={`flex-1 font-mono text-sm truncate ${entry.status === 'ELIMINATED' ? 'text-blood line-through' : 'text-text-bright'}`}>
                    {entry.name}
                    {entry.completed && <span className="text-xs text-toxic ml-2">✓ DONE</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-orbitron text-sm ${entry.status === 'ELIMINATED' ? 'text-blood' : 'text-toxic'}`}>
                      {entry.status === 'ELIMINATED' ? 'FLATLINED' : entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 border-2 border-blood border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / Math.max(1, totalQuestions)) * 100;

  return (
    <div className={`min-h-screen p-4 md:p-6 ${timeLeft <= 5 ? 'warning-active' : ''}`}>
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <div className="panel">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Level Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm border-2 border-blood bg-blood-dim flex items-center justify-center glow-blood shadow-inner">
                <Cpu className="w-6 h-6 text-blood drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              </div>
              <div>
                <p className="font-orbitron text-md font-bold text-blood tracking-widest text-glow-blood">LEVEL 2</p>
                <p className="font-mono text-sm text-text-muted tracking-widest">AI CONTAINMENT PROTOCOL</p>
              </div>
            </div>

            {/* Timer */}
            <div className={`text-center ${timeLeft <= 5 ? 'text-blood' : 'text-text-bright'}`}>
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-5 h-5 text-blood" />
                <span className={`countdown-display ${timeLeft <= 5 ? 'critical' : ''}`}>
                  {timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="font-mono text-xs text-text-dim tracking-widest">SYSTEM UPTIME</p>
            </div>

            {/* Progress */}
            <div className="text-right min-w-[80px] sm:min-w-[120px]">
              {currentQuestionIndex + 1}<span className="text-text-dim">/{totalQuestions}</span>
              <div className="w-20 sm:w-28 h-2 bg-deep rounded-full overflow-hidden mt-1 border border-border-gray ml-auto">
                <motion.div
                  className="h-full bg-blood"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infection Meter or Spectator Badge */}
          {isSpectator ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel border-2 border-amber/50 bg-amber/5"
            >
              <div className="p-4 text-center">
                <p className="font-orbitron text-xl text-amber flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  SPECTATOR MODE ACTIVE
                </p>
                <p className="font-mono text-xs text-amber mt-2">OBSERVING SUBJECT RESPONSES</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel"
            >
              <div className="panel-header flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  INFECTION LEVEL
                </span>
                <span className={`font-orbitron ${player.infectionLevel > 70 ? 'text-blood' :
                  player.infectionLevel > 40 ? 'text-amber' :
                    'text-toxic'
                  }`}>
                  {player.infectionLevel}%
                </span>
              </div>
              <div className="p-4">
                <div className="infection-bar">
                  <motion.div
                    className="infection-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${player.infectionLevel}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: player.infectionLevel > 70
                        ? 'linear-gradient(90deg, #dc2626, #7f1d1d)'
                        : player.infectionLevel > 40
                          ? 'linear-gradient(90deg, #22c55e, #f59e0b)'
                          : 'linear-gradient(90deg, #14532d, #22c55e)'
                    }}
                  />
                </div>
                {player.infectionLevel > 70 && (
                  <p className="mt-2 text-center text-blood font-mono text-sm flex items-center justify-center gap-2 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    CRITICAL INFECTION LEVEL
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="panel"
            >
              <div className="panel-header flex items-center justify-between">
                <span>AI QUERY #{currentQuestionIndex + 1}</span>
                <span className="font-mono text-xs text-text-dim">DIFFICULTY: ADAPTIVE</span>
              </div>
              <div className="p-6">
                <h3 className="font-rajdhani text-xl md:text-2xl text-text-bright mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={hasAnswered || isSpectator}
                      className={`option-card w-full ${isSpectator && index === currentQuestion.correct ? 'correct' :
                        hasAnswered && index === currentQuestion.correct ? 'correct' :
                          hasAnswered && index === selectedAnswer && index !== currentQuestion.correct ? 'wrong' :
                            ''
                        }`}
                      whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                      whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <span className="font-mono text-blood mr-4 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {(isSpectator || hasAnswered) && index === currentQuestion.correct && (
                        <CheckCircle className="w-5 h-5 text-toxic" />
                      )}
                      {hasAnswered && index === selectedAnswer && index !== currentQuestion.correct && (
                        <XCircle className="w-5 h-5 text-blood" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Answer Result */}
          {!isSpectator && (
            <AnimatePresence>
              {lastAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`panel border-l-4 ${lastAnswer.correct ? 'border-l-toxic' : 'border-l-blood'}`}
                >
                  <div className={`p-4 flex items-start gap-4 ${lastAnswer.correct ? 'bg-toxic/5' : 'bg-blood/5'}`}>
                    {lastAnswer.correct ? (
                      <CheckCircle className="w-6 h-6 text-toxic flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-blood flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className={`font-orbitron font-bold mb-2 ${lastAnswer.correct ? 'text-toxic' : 'text-blood'}`}>
                        {lastAnswer.correct ? 'CORRECT - AI IMPRESSED' : 'INCORRECT - AI DISAPPOINTED'}
                      </p>
                      <p className="font-rajdhani text-text-bright">
                        {lastAnswer.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border-gray">
                    <motion.button
                      onClick={nextQuestion}
                      className="w-full py-3 bg-blood/10 border border-blood text-blood hover:bg-blood hover:text-white transition-colors font-orbitron text-sm tracking-widest flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      NEXT QUERY
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar - Leaderboard */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="panel lg:sticky lg:top-6"
          >
            <div className="panel-header flex items-center justify-between">
              <span>LIVE RANKINGS</span>
              <span className="w-2 h-2 rounded-full bg-toxic animate-pulse" />
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-2">
                <AnimatePresence>
                  {leaderboard.slice(0, 8).map((entry) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      key={entry.id}
                      className={`leaderboard-item ${player && entry.id === player.id ? 'current-player' : ''} ${entry.status === 'ELIMINATED' ? 'opacity-50 grayscale' : ''}`}
                    >
                      <span className={`font-orbitron font-bold w-5 ${entry.rank === 1 ? 'text-gold' :
                        entry.rank === 2 ? 'text-silver' :
                          entry.rank === 3 ? 'text-bronze' :
                            entry.status === 'ELIMINATED' ? 'text-blood' :
                              'text-text-dim'
                        }`}>
                        {entry.status === 'ELIMINATED' ? '💀' : entry.rank}
                      </span>
                      <span className={`flex-1 font-mono text-sm truncate ${entry.status === 'ELIMINATED' ? 'text-blood line-through decoration-blood' : 'text-text-bright'}`}>
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {isSpectator && (
                          <>
                            <span className="font-mono text-xs text-toxic" title="Correct">
                              ✓{entry.correctAnswers}
                            </span>
                            <span className="font-mono text-xs text-blood" title="Wrong">
                              ✗{entry.wrongAnswers}
                            </span>
                          </>
                        )}
                        <span className={`font-orbitron text-sm ${entry.status === 'ELIMINATED' ? 'text-blood' : 'text-toxic'}`}>
                          {entry.status === 'ELIMINATED' ? 'FLATLINED' : entry.score}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Cutoff line */}
              {leaderboard.length > 3 && (
                <div className="mt-4 pt-4 border-t border-border-gray">
                  <p className="font-mono text-xs text-text-dim text-center">
                    TOP {Math.ceil(leaderboard.length * 0.3)} ADVANCE
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
