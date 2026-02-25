import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Trophy, Crown, RotateCcw, Activity, Target, Star } from 'lucide-react';

export function VictoryScreen() {
  const { player, leaderboard, resetGame } = useGame();

  if (!player && leaderboard.length === 0) return null;

  const isSpectator = !player;
  const displayPlayer = player || leaderboard[0]; // If spectator, focus on the top champion
  const playerRank = leaderboard.findIndex(p => p.id === displayPlayer?.id) + 1;
  const isTop5 = playerRank <= 5 && displayPlayer?.status !== 'ELIMINATED';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Gold glow overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 50%)'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Confetti effect (simplified) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#fbbf24', '#22c55e', '#dc2626'][i % 3],
              left: `${Math.random() * 100}%`,
              top: -10
            }}
            animate={{
              y: ['0vh', '100vh'],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isTop5 ? (
              <Crown className="w-32 h-32 text-gold mx-auto" />
            ) : (
              <Trophy className="w-32 h-32 text-gold mx-auto" />
            )}
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-5xl md:text-6xl font-black text-gold mb-4">
            {isSpectator ? 'SIMULATION COMPLETE' : (isTop5 ? 'CHAMPION' : 'SURVIVOR')}
          </h1>
          <p className="font-mono text-xl text-toxic">
            {isSpectator ? `TOP CHAMPION: ${displayPlayer?.name || 'UNKNOWN'}` : 'YOU HAVE PROVEN WORTHY OF CONTAINMENT'}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="panel border-gold/30">
            <div className="p-4 text-center">
              <Star className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">RANK</p>
              <p className={`font-orbitron text-3xl ${isTop5 ? 'text-gold' : 'text-text-bright'}`}>#{playerRank}</p>
            </div>
          </div>
          <div className="panel border-gold/30">
            <div className="p-4 text-center">
              <Target className="w-5 h-5 text-toxic mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">SCORE</p>
              <p className="font-orbitron text-3xl text-toxic">{displayPlayer?.score || 0}</p>
            </div>
          </div>
          <div className="panel border-gold/30">
            <div className="p-4 text-center">
              <Activity className="w-5 h-5 text-blood mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">INFECTION</p>
              <p className="font-orbitron text-3xl text-toxic">{displayPlayer?.infectionLevel || 0}%</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="panel mb-8"
        >
          <div className="panel-header text-gold">PERFORMANCE SUMMARY</div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-mono text-xs text-text-dim">CORRECT ANSWERS</p>
                <p className="font-orbitron text-2xl text-toxic">{displayPlayer?.correctAnswers || 0}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-text-dim">WRONG ANSWERS</p>
                <p className="font-orbitron text-2xl text-blood">{displayPlayer?.wrongAnswers || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        {!isSpectator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              onClick={resetGame}
              className="btn-primary flex items-center gap-2 bg-gold/10 border-gold text-gold hover:bg-gold hover:text-void-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
              PLAY AGAIN
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
