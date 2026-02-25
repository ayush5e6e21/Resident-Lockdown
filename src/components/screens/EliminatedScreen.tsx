import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Skull, RotateCcw, Activity, Trophy } from 'lucide-react';

export function EliminatedScreen() {
  const { player, leaderboard, resetGame } = useGame();

  if (!player) return null;

  const playerRank = leaderboard.findIndex(p => p.id === player.id) + 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Red pulse overlay */}
      <motion.div
        className="absolute inset-0 bg-blood/5"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 60%)'
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Skull Icon */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Skull className="w-20 h-20 md:w-32 md:h-32 text-blood mx-auto" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-blood mb-3 md:mb-4">
            TERMINATED
          </h1>
          <p className="font-mono text-base sm:text-lg md:text-xl text-text-dim">
            SUBJECT {player.name} HAS BEEN ELIMINATED
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <div className="panel">
            <div className="p-4 text-center">
              <Trophy className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">RANK</p>
              <p className="font-orbitron text-xl sm:text-2xl md:text-3xl text-blood">#{playerRank}</p>
            </div>
          </div>
          <div className="panel">
            <div className="p-4 text-center">
              <Trophy className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">SCORE</p>
              <p className="font-orbitron text-xl sm:text-2xl md:text-3xl text-toxic">{player.score}</p>
            </div>
          </div>
          <div className="panel">
            <div className="p-4 text-center">
              <Activity className="w-5 h-5 text-blood mx-auto mb-2" />
              <p className="font-mono text-xs text-text-dim mb-1">INFECTION</p>
              <p className="font-orbitron text-xl sm:text-2xl md:text-3xl text-blood">{player.infectionLevel}%</p>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-mono text-text-dim mb-8"
        >
          YOUR PARTICIPATION IN THE SIMULATION HAS CONCLUDED.
          <br />
          THANK YOU FOR YOUR SERVICE TO THE FACILITY.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-4"
        >
          <motion.button
            onClick={resetGame}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            TRY AGAIN
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
