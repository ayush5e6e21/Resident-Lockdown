export interface Player {
  id: string;
  name: string;
  score: number;
  infectionLevel: number;
  eliminated: boolean;
  status: 'ACTIVE' | 'ELIMINATED';
  correctAnswers: number;
  wrongAnswers: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  infectionLevel: number;
  status: string;
  correctAnswers: number;
  wrongAnswers: number;
  completed: boolean;
  completionOrder: number;
}

export type GameScreen = 'landing' | 'register' | 'lobby' | 'level1' | 'transition' | 'level2' | 'eliminated' | 'victory' | 'admin';

export interface GameState {
  screen: GameScreen;
  currentLevel: number;
  player: Player | null;
  currentQuestionIndex: number;
  leaderboard: LeaderboardEntry[];
  lastAnswer: {
    correct: boolean;
    explanation: string;
  } | null;
}
