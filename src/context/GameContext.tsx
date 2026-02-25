import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, Question, LeaderboardEntry, GameScreen } from '@/types/game';

// Context Provider

interface GameContextType {
  screen: GameScreen;
  player: Player | null;
  currentLevel: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  leaderboard: LeaderboardEntry[];
  lastAnswer: { correct: boolean; explanation: string; correctIndex?: number } | null;
  currentQuestion: Question | null;
  hasCompletedQuestions: boolean;
  survivors: { id: string; name: string; score: number }[];
  isSurvivor: boolean;
  setScreen: (screen: GameScreen) => void;
  registerPlayer: (name: string) => void;
  startGame: () => void;
  submitAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
  getCurrentQuestion: () => Question | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [screen, setScreen] = useState<GameScreen>('landing');
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; explanation: string; correctIndex?: number } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [hasCompletedQuestions, setHasCompletedQuestions] = useState(false);
  const [survivors, setSurvivors] = useState<{ id: string; name: string; score: number }[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('gameState', (state) => {
      setLeaderboard(state.leaderboard || []);
      setCurrentLevel(state.currentLevel);
      if (state.isActive && state.currentLevel > 0) {
        // Don't override eliminated players' screen
        setPlayer(prev => {
          if (prev && prev.eliminated) return prev;
          return prev;
        });
        // Only change screen if player is not eliminated
        setScreen(prev => {
          if (prev === 'eliminated') return prev;
          return `level${state.currentLevel}` as GameScreen;
        });
      }
    });

    newSocket.on('registered', (data) => {
      setPlayer(data.player);
      setScreen('lobby');
    });

    newSocket.on('answerResult', (data) => {
      setLastAnswer({
        correct: data.correct,
        explanation: data.explanation,
        correctIndex: data.correctAnswer
      });
      setPlayer(prev => prev ? {
        ...prev,
        infectionLevel: data.infectionLevel,
        score: data.score
      } : null);
    });

    newSocket.on('leaderboardUpdate', (board) => {
      setLeaderboard(board);
    });

    newSocket.on('eliminated', () => {
      setPlayer(prev => prev ? { ...prev, eliminated: true, status: 'ELIMINATED' } : null);
      setScreen('eliminated');
    });

    newSocket.on('levelStart', (data) => {
      setCurrentLevel(data.level);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestionIndex(0);
      setLastAnswer(null);
      setHasCompletedQuestions(false);
      // Don't send eliminated players to a new level
      setScreen(prev => {
        if (prev === 'eliminated') return prev;
        return `level${data.level}` as GameScreen;
      });
    });

    newSocket.on('level1Complete', (data) => {
      // Store survivors list
      if (data && data.survivors) {
        setSurvivors(data.survivors);
      }
      // Don't send eliminated players to transition
      setScreen(prev => {
        if (prev === 'eliminated') return prev;
        return 'transition';
      });
    });

    newSocket.on('newQuestion', (data) => {
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionNumber - 1);
      setTotalQuestions(data.totalQuestions);
      setLastAnswer(null); // Reset answer state for new question
    });

    newSocket.on('gameEnd', () => {
      setScreen(prev => {
        if (prev === 'eliminated') return prev;
        return 'victory';
      });
    });

    newSocket.on('allQuestionsCompleted', () => {
      setHasCompletedQuestions(true);
    });

    newSocket.on('playerCompleted', () => {
      // Leaderboard will auto-update via leaderboardUpdate event
    });

    newSocket.on('gameReset', () => {
      setScreen('landing');
      setPlayer(null);
      setCurrentLevel(0);
      setCurrentQuestionIndex(0);
      setLeaderboard([]);
      setLastAnswer(null);
      setCurrentQuestion(null);
      setHasCompletedQuestions(false);
      setSurvivors([]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const registerPlayer = useCallback((name: string) => {
    if (socket) {
      socket.emit('registerPlayer', { name: name.trim() });
    }
  }, [socket]);

  const startGame = useCallback(() => {
    // Players cannot start the game; Admin does.
  }, []);

  const submitAnswer = useCallback((answerIndex: number) => {
    if (socket) {
      socket.emit('submitAnswer', { answerIndex });
    }
  }, [socket]);

  const nextQuestion = useCallback(() => {
    // Players no longer manually control next question pacing; server does it on time expiry.
  }, []);

  const resetGame = useCallback(() => {
    setScreen('landing');
  }, []);

  const getCurrentQuestion = useCallback(() => {
    return currentQuestion;
  }, [currentQuestion]);

  return (
    <GameContext.Provider value={{
      screen,
      player,
      currentLevel,
      currentQuestionIndex,
      totalQuestions,
      leaderboard,
      lastAnswer,
      currentQuestion,
      hasCompletedQuestions,
      survivors,
      isSurvivor: !!(player && survivors.find(s => s.id === player.id)),
      setScreen,
      registerPlayer,
      startGame,
      submitAnswer,
      nextQuestion,
      resetGame,
      getCurrentQuestion
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
