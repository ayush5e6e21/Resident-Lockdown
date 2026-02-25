import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { User, Activity, Trophy, Users } from 'lucide-react';
import bgContainment from '../../../images/bg-containment.jpg';

export function LobbyScreen() {
  const { player, leaderboard } = useGame();

  if (!player) return null;

  const playerRank = leaderboard.findIndex(p => p.id === player.id) + 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.2] mix-blend-luminosity"
        style={{ backgroundImage: `url(${bgContainment})` }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 60%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="panel h-full">
              <div className="panel-header flex items-center gap-2 text-blood">
                <User className="w-4 h-4" />
                SUBJECT PROFILE
              </div>

              <div className="p-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-blood bg-blood-dim flex items-center justify-center glow-blood shadow-inner">
                    <User className="w-7 h-7 md:w-10 md:h-10 text-blood" />
                  </div>
                  <div>
                    <h2 className="font-orbitron text-xl sm:text-2xl md:text-3xl font-bold text-text-bright text-glow-blood">
                      {player.name}
                    </h2>
                    <p className="font-mono text-sm text-text-muted mt-1">
                      ID: {player.id.slice(0, 12).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 bg-blood/20 text-blood text-xs font-mono font-bold tracking-widest border border-blood/50">
                        STATUS: ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-deep rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-border-rust shadow-inner">
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-blood mx-auto mb-1 md:mb-2 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
                    <p className="font-mono text-xs text-text-muted mb-1 tracking-widest">INFECTION</p>
                    <p className="font-orbitron text-lg sm:text-xl md:text-2xl font-bold text-blood">{player.infectionLevel}%</p>
                  </div>
                  <div className="bg-deep rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-border-rust shadow-inner">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-gold mx-auto mb-1 md:mb-2 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                    <p className="font-mono text-xs text-text-muted mb-1 tracking-widest">SCORE</p>
                    <p className="font-orbitron text-lg sm:text-xl md:text-2xl font-bold text-gold">{player.score}</p>
                  </div>
                  <div className="bg-deep rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-border-rust shadow-inner">
                    <Users className="w-6 h-6 text-text-dim mx-auto mb-2" />
                    <p className="font-mono text-xs text-text-muted mb-1 tracking-widest">RANK</p>
                    <p className="font-orbitron text-lg sm:text-xl md:text-2xl font-bold text-text-bright">#{playerRank}</p>
                  </div>
                </div>

                {/* Start Status */}
                <div className="bg-blood/10 border border-blood/30 rounded p-4 text-center flex flex-col items-center justify-center">
                  <Activity className="w-5 h-5 text-blood animate-pulse mb-2" />
                  <p className="font-mono text-sm tracking-widest text-blood">
                    WAITING FOR HOST TO INITIATE SIMULATION...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="panel h-full">
              <div className="panel-header flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blood" />
                  PLAYERS CONNECTED
                </span>
                <span className="font-mono text-xs text-text-dim flex items-center">
                  TOTAL: {leaderboard.length}
                  <span className="inline-block w-2 h-2 rounded-full bg-blood animate-pulse glow-blood ml-2" />
                </span>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`leaderboard-item ${entry.id === player.id ? 'current-player' : ''} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blood glow-blood animate-pulse" />
                        <span className="font-mono text-sm truncate text-text-bright">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-orbitron text-xs tracking-widest text-text-dim uppercase">
                        {entry.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
