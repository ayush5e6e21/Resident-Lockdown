import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { User, ArrowRight, AlertTriangle } from 'lucide-react';
import bgContainment from '../../../images/bg-containment.jpg';

export function RegisterScreen() {
  const { registerPlayer } = useGame();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (name.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        registerPlayer(name.trim());
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.2] mix-blend-luminosity"
        style={{ backgroundImage: `url(${bgContainment})` }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 60%)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border border-blood bg-blood/10 mb-3 md:mb-4"
          >
            <User className="w-6 h-6 md:w-8 md:h-8 text-blood" />
          </motion.div>
          <h2 className="font-orbitron text-xl sm:text-2xl md:text-3xl font-bold text-text-bright mb-2">
            SUBJECT REGISTRATION
          </h2>
          <p className="font-mono text-sm text-text-dim">
            ENTER YOUR DESIGNATION TO PROCEED
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel"
        >
          <div className="panel-header flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blood" />
            IDENTIFICATION REQUIRED
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block font-mono text-sm text-text-dim mb-2">
                DESIGNATION CODE
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="e.g., SUBJECT-1337"
                className="w-full bg-deep border border-border-gray text-text-bright px-3 py-2.5 sm:px-4 sm:py-3 rounded font-mono text-base md:text-lg focus:border-blood focus:outline-none transition-colors"
                autoFocus
              />
              <p className="mt-2 font-mono text-xs text-text-dim">
                Max 20 characters. Alphanumeric only.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={name.trim() ? { scale: 1.02 } : {}}
              whileTap={name.trim() ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>
                  <span>REGISTER</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center font-mono text-xs text-text-dim"
        >
          By registering, you consent to biological monitoring and
          accept all risks associated with containment procedures.
        </motion.p>
      </motion.div>
    </div>
  );
}
