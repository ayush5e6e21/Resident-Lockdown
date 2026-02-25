import { motion } from 'framer-motion';
import { Biohazard, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import bgContainment from '../../../images/bg-containment.jpg';

const terminalLines = [
  { text: "✓ FACILITY SYSTEMS ONLINE", className: "text-text-muted" },
  { text: "✓ CONTAINMENT PROTOCOLS ACTIVE", className: "text-text-muted" },
  { text: "⚠ BIOHAZARD DETECTED IN SECTOR 4", className: "text-blood font-bold" },
  { text: "> AWAITING SUBJECT REGISTRATION...", className: "text-text-dim" },
  { text: "SYSTEM READY FOR TRIALS", className: "text-blood mt-4 font-bold" }
];

function TypewriterLines({ lines }: { lines: { text: string; className: string }[] }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const currentFullText = lines[currentLineIndex].text;
    let i = 0;
    setDisplayedText('');

    const intervalId = setInterval(() => {
      setDisplayedText(currentFullText.substring(0, i + 1));
      i++;
      if (i > currentFullText.length) {
        clearInterval(intervalId);
        setTimeout(() => setCurrentLineIndex((prev) => prev + 1), 600);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [currentLineIndex, lines]);

  return (
    <>
      {lines.map((line, idx) => {
        if (idx < currentLineIndex) {
          const isLastLineTotal = idx === lines.length - 1;
          const animateClass = line.text.includes("BIOHAZARD DETECTED") ? " animate-pulse" : "";
          return (
            <p key={idx} className={`${line.className}${animateClass} ${isLastLineTotal ? 'typing-cursor' : ''}`}>
              {line.text}
            </p>
          );
        }
        if (idx === currentLineIndex) {
          const animateClass = line.text.includes("BIOHAZARD DETECTED") ? " animate-pulse" : "";
          return (
            <p key={idx} className={`${line.className}${animateClass} typing-cursor`}>
              {displayedText}
            </p>
          );
        }
        return null;
      })}
    </>
  );
}

export function LandingScreen() {
  const [showIntro, setShowIntro] = useState(true);
  const introText = "WELCOME TO THE LOCKDOWN";

  useEffect(() => {
    if (!showIntro) return;

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500); // 4.5 second total wait 

    return () => clearTimeout(timer);
  }, [showIntro]);

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="font-mono text-white text-lg md:text-2xl tracking-[0.3em] font-light flex items-center relative z-10" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.5)' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12 // Slower, readable typing
                }
              }
            }}
          >
            {introText.split('').map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, display: 'none' },
                  visible: { opacity: 1, display: 'inline' }
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="inline-block w-[4px] h-5 md:h-7 bg-white ml-2"
            style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, ease: "easeInOut" }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.4]"
        style={{ backgroundImage: `url(${bgContainment})` }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Rotating biohazard symbol */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <Biohazard className="w-[700px] h-[700px] text-blood" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Biohazard className="w-24 h-24 text-blood mx-auto" />
            </motion.div>
            <motion.div
              className="absolute inset-0 blur-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Biohazard className="w-24 h-24 text-blood mx-auto" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 1.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, delay: 0.4, ease: "easeOut" }}
          className="mb-4"
        >
          <h1 className="font-orbitron text-7xl md:text-8xl font-black tracking-tight" style={{ textShadow: '0 0 20px rgba(185, 28, 28, 0.8)' }}>
            <span className="glitch-text text-blood" data-text="RESIDENT">
              RESIDENT
            </span>
          </h1>
          <h1 className="font-orbitron text-7xl md:text-8xl font-black tracking-tight -mt-2">
            <span className="text-text-bright drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              LOCKDOWN
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-mono text-blood text-sm tracking-[0.4em] mb-12 font-bold"
        >
          BIOHAZARD CONTAINMENT SIMULATION v2.4.1
        </motion.p>

        {/* Boot sequence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="panel max-w-md mx-auto mb-10"
        >
          <div className="panel-header flex items-center gap-2 border-b-blood">
            <AlertTriangle className="w-5 h-5 text-blood" />
            UMBRELLA CORP. SYSTEM STATUS
          </div>
          <div className="p-5 font-mono text-sm text-left space-y-2">
            <TypewriterLines lines={terminalLines} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-6 mb-8 relative inline-block group"
        >
          {/* Glowing pulse behind button */}
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-blood/30 blur-xl rounded-sm z-0"
          />
          <motion.button
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 font-mono text-white bg-blood/10 border border-blood px-8 py-3 rounded-sm hover:bg-blood hover:text-white transition-all duration-300 tracking-[0.2em] text-xs md:text-sm font-bold uppercase cursor-pointer"
            style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5)', boxShadow: '0 0 15px rgba(220, 38, 38, 0.4) inset' }}
          >
            [ INITIALIZE PROTOCOL: CLICK TO CONTINUE ]
          </motion.button>
        </motion.div>

        {/* Warning */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 font-mono text-xs text-text-dim max-w-sm mx-auto"
        >
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          WARNING: This simulation contains intense psychological elements.
          Not recommended for those with heart conditions.
        </motion.p>
      </div>
    </motion.div>
  );
}
