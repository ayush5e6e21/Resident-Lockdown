import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Trophy, Crown, RotateCcw, Activity, Target, Star, Medal, Shield } from 'lucide-react';

export function VictoryScreen() {
  const { player, leaderboard, resetGame } = useGame();

  if (!player && leaderboard.length === 0) return null;

  const isSpectator = !player;
  const displayPlayer = player || leaderboard[0];
  const playerRank = leaderboard.findIndex(p => p.id === displayPlayer?.id) + 1;
  const isTop5 = playerRank <= 5 && displayPlayer?.status !== 'ELIMINATED';

  // Top 5 champions from leaderboard
  const champions = leaderboard
    .filter(p => p.status !== 'ELIMINATED')
    .slice(0, 5);

  const rankColors = ['text-gold', 'text-silver', 'text-bronze', 'text-text-bright', 'text-text-muted'];
  const rankBorders = ['border-gold/50 bg-gold/5', 'border-silver/40 bg-silver/5', 'border-bronze/40 bg-bronze/5', 'border-border-gray', 'border-border-gray'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Gold glow overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 50%)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{ background: ['#fbbf24', '#22c55e', '#dc2626'][i % 3], left: `${Math.random() * 100}%`, top: -10 }}
            animate={{ y: ['0vh', '100vh'], rotate: [0, 360] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }}
          />
        ))}
      </div>

      <motion.div className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6 sm:mb-8">
          <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Crown className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gold mx-auto" />
          </motion.div>
          <h1 className="font-orbitron text-2xl sm:text-3xl md:text-5xl font-black text-gold mt-3 mb-2">
            {isSpectator ? 'SIMULATION COMPLETE' : (isTop5 ? 'CHAMPION' : 'SURVIVOR')}
          </h1>
          <p className="font-mono text-sm sm:text-base text-toxic">
            {isSpectator ? 'THE LOCKDOWN HAS ENDED' : 'YOU HAVE PROVEN WORTHY OF CONTAINMENT'}
          </p>
        </motion.div>

        {/* Champions Podium */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="panel border-gold/30 mb-6">
          <div className="panel-header text-gold gap-2">
            <Trophy className="w-4 h-4" />
            TOP 5 CHAMPIONS
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {champions.length > 0 ? champions.map((c, idx) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.15 }}
                className={`flex items-center gap-3 p-3 border ${rankBorders[idx]} ${player && c.id === player.id ? 'ring-1 ring-gold' : ''}`}>
                {/* Rank */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 ${idx === 0 ? 'bg-gold/20' : idx === 1 ? 'bg-silver/10' : idx === 2 ? 'bg-bronze/10' : 'bg-deep'} border ${idx < 3 ? rankBorders[idx].split(' ')[0] : 'border-border-gray'}`}>
                  {idx === 0 ? <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gold" /> :
                    idx === 1 ? <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-silver" /> :
                      idx === 2 ? <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-bronze" /> :
                        <span className={`font-orbitron text-sm font-bold ${rankColors[idx]}`}>#{idx + 1}</span>}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-mono text-sm sm:text-base font-bold ${rankColors[idx]} truncate`}>
                    {c.name}
                    {player && c.id === player.id && <span className="text-xs text-gold ml-2">(YOU)</span>}
                  </p>
                  <p className="font-mono text-xs text-text-dim">
                    ✓{c.correctAnswers} ✗{c.wrongAnswers} • INF {c.infectionLevel}%
                  </p>
                </div>
                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`font-orbitron text-lg sm:text-xl font-bold ${rankColors[idx]}`}>{c.score}</p>
                  <p className="font-mono text-[10px] text-text-dim">PTS</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center p-6 text-text-dim font-mono">NO CHAMPIONS</div>
            )}
          </div>
        </motion.div>

        {/* Your Stats (for players) */}
        {!isSpectator && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
            {[
              { icon: Star, label: 'RANK', value: `#${playerRank}`, color: isTop5 ? 'text-gold' : 'text-text-bright' },
              { icon: Target, label: 'SCORE', value: displayPlayer?.score || 0, color: 'text-toxic' },
              { icon: Shield, label: 'CORRECT', value: displayPlayer?.correctAnswers || 0, color: 'text-toxic' },
              { icon: Activity, label: 'WRONG', value: displayPlayer?.wrongAnswers || 0, color: 'text-blood' },
            ].map((stat, i) => (
              <div key={i} className="panel border-gold/20 p-3 text-center">
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className="font-mono text-[10px] text-text-dim">{stat.label}</p>
                <p className={`font-orbitron text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Play Again */}
        {!isSpectator && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center">
            <motion.button onClick={resetGame}
              className="btn-primary flex items-center gap-2 mx-auto bg-gold/10 border-gold text-gold hover:bg-gold hover:text-void-black"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <RotateCcw className="w-5 h-5" /> PLAY AGAIN
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
