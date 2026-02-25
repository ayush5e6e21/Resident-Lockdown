import { GameProvider, useGame } from '@/context/GameContext';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { RegisterScreen } from '@/components/screens/RegisterScreen';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { Level1Screen } from '@/components/screens/Level1Screen';
import { TransitionScreen } from '@/components/screens/TransitionScreen';
import { Level2Screen } from '@/components/screens/Level2Screen';
import { EliminatedScreen } from '@/components/screens/EliminatedScreen';
import { VictoryScreen } from '@/components/screens/VictoryScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { CursorTrail } from '@/components/effects/CursorTrail';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

function GameContent() {
  const { screen, setScreen, antiCheatWarning } = useGame();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle click on landing to go to register (blocked for admin)
  const handleLandingClick = () => {
    if (isAdmin) return; // Admin cannot register as a player
    if (screen === 'landing') {
      setScreen('register');
    }
  };

  // Secret hotkey to access admin panel (Alt + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsAdminOpen((prev: boolean) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="min-h-screen hex-bg relative"
      onClick={handleLandingClick}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Main content */}
      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <LandingScreen />
            </motion.div>
          )}

          {screen === 'register' && !isAdmin && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterScreen />
            </motion.div>
          )}

          {screen === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <LobbyScreen />
            </motion.div>
          )}

          {screen === 'level1' && (
            <motion.div
              key="level1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Level1Screen />
            </motion.div>
          )}

          {screen === 'transition' && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <TransitionScreen />
            </motion.div>
          )}

          {screen === 'level2' && (
            <motion.div
              key="level2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Level2Screen />
            </motion.div>
          )}

          {screen === 'eliminated' && (
            <motion.div
              key="eliminated"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <EliminatedScreen />
            </motion.div>
          )}

          {screen === 'victory' && (
            <motion.div
              key="victory"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <VictoryScreen />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Overlay */}
        <AnimatePresence>
          {isAdminOpen && (
            <motion.div
              key="admin-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-background"
            >
              <AdminScreen
                onClose={() => setIsAdminOpen(false)}
                onAdminAuth={() => setIsAdmin(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anti-Cheat Warning Overlay */}
        <AnimatePresence>
          {antiCheatWarning && (
            <motion.div
              key="anticheat-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.8, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -20 }}
                className={`pointer-events-auto max-w-sm mx-4 p-4 sm:p-6 border-2 text-center ${antiCheatWarning.type === 'penalty'
                    ? 'bg-blood-dark/95 border-blood'
                    : 'bg-void-black/95 border-amber'
                  }`}
              >
                <AlertTriangle className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 ${antiCheatWarning.type === 'penalty' ? 'text-blood' : 'text-amber'
                  }`} />
                <h3 className={`font-orbitron text-base sm:text-lg font-bold mb-2 ${antiCheatWarning.type === 'penalty' ? 'text-blood' : 'text-amber'
                  }`}>
                  {antiCheatWarning.type === 'penalty' ? '⚠ PENALTY APPLIED' : '⚠ ANTI-CHEAT WARNING'}
                </h3>
                <p className="font-mono text-xs sm:text-sm text-text-bright">
                  {antiCheatWarning.message}
                </p>
                {antiCheatWarning.type === 'warning' && (
                  <div className="mt-3 flex justify-center gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border ${i <= antiCheatWarning.offenseCount
                            ? 'bg-amber border-amber'
                            : 'border-text-dim bg-transparent'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cursor trail effect */}
      <CursorTrail />

      {/* Footer */}
      <footer className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-50 font-mono text-[10px] sm:text-xs text-muted">
        <p>RESIDENT LOCKDOWN v2.4.1</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
