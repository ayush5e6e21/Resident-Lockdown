import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve built frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

// ==================== GAME STATE ====================
const gameState = {
  isActive: false,
  currentLevel: 0,
  level1Timer: 30,
  level2Timer: 20,
  eliminationPercentage: 50,
  players: new Map(),
  eliminatedPlayers: [],
  questions: {
    level1: [],
    level2: []
  },
  currentQuestion: null,
  questionIndex: 0,
  leaderboard: [],
  systemMessages: []
};

// ==================== DEFAULT QUESTIONS ====================
const defaultLevel1Questions = [
  {
    id: 1,
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    options: ["A ghost", "An echo", "A shadow", "A thought"],
    correct: 1,
    explanation: "An echo speaks without a mouth and has no physical body."
  },
  {
    id: 2,
    question: "A man is looking at a photograph. Someone asks, 'Whose picture is that?' He replies: 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the photograph?",
    options: ["The man himself", "His father", "His son", "His uncle"],
    correct: 2,
    explanation: "'My father's son' = himself (he has no brothers). So 'that man's father is me' — the photo is of his son."
  },
  {
    id: 3,
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    options: ["A planet", "A map", "A painting", "A dream"],
    correct: 1,
    explanation: "A map has representations of cities, mountains, and water — but none of the real things."
  },
  {
    id: 4,
    question: "What number comes next? 1, 11, 21, 1211, 111221, ?",
    options: ["312211", "122211", "212221", "331221"],
    correct: 0,
    explanation: "Look-and-say sequence: each term describes the previous. 111221 = 'three 1s, two 2s, one 1' = 312211."
  },
  {
    id: 5,
    question: "You're in a dark room with a candle, a wood stove, and a gas lamp. You only have one match. What do you light first?",
    options: ["The candle", "The wood stove", "The gas lamp", "The match"],
    correct: 3,
    explanation: "You must light the match first before you can light anything else!"
  },
  {
    id: 6,
    question: "A farmer has 17 sheep. All but 9 die. How many sheep are left?",
    options: ["8", "9", "17", "0"],
    correct: 1,
    explanation: "'All but 9 die' means 9 survive. The answer is 9."
  },
  {
    id: 7,
    question: "What disappears as soon as you say its name?",
    options: ["A secret", "Silence", "Darkness", "A whisper"],
    correct: 1,
    explanation: "The moment you say 'silence', it is broken — it disappears."
  },
  {
    id: 8,
    question: "If you have a bowl with six apples and you take away four, how many do you have?",
    options: ["Two", "Four", "Six", "Zero"],
    correct: 1,
    explanation: "You took four apples, so YOU have four apples."
  },
  {
    id: 9,
    question: "A bat and a ball together cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: ["$0.10", "$0.05", "$0.15", "$0.01"],
    correct: 1,
    explanation: "If ball = $0.05, then bat = $1.05. Total = $1.10. Most people instinctively say $0.10, but that's wrong!"
  },
  {
    id: 10,
    question: "Three doctors said Robert is their brother. Robert says he has no brothers. Who is lying?",
    options: ["Robert is lying", "The doctors are lying", "Nobody is lying", "One doctor is lying"],
    correct: 2,
    explanation: "Nobody is lying — the three doctors are Robert's sisters!"
  }
];

const defaultLevel2Questions = [
  {
    id: 101,
    question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
    options: ["0°", "7.5°", "15°", "22.5°"],
    correct: 1,
    explanation: "At 3:15, minute hand is at 90°. Hour hand has moved 7.5° past the 3 (90° + 7.5° = 97.5°). Angle = 97.5° - 90° = 7.5°."
  },
  {
    id: 102,
    question: "If you write all numbers from 1 to 100, how many times does the digit '9' appear?",
    options: ["10", "11", "19", "20"],
    correct: 3,
    explanation: "9,19,29,39,49,59,69,79,89 (9 times in units) + 90,91,92,93,94,95,96,97,98,99 (10 times in tens) + 99 has two 9s. Total = 20."
  },
  {
    id: 103,
    question: "A snail climbs 3 meters during the day but slides back 2 meters at night. How many days to climb a 10-meter wall?",
    options: ["10 days", "8 days", "7 days", "9 days"],
    correct: 1,
    explanation: "After 7 days: 7 net meters. Day 8: climbs 3m to reach 10m — it's out before night! Answer: 8 days."
  },
  {
    id: 104,
    question: "You have 8 identical-looking balls. One is heavier. Using a balance scale, what is the MINIMUM number of weighings to find the heavy ball?",
    options: ["1", "2", "3", "4"],
    correct: 1,
    explanation: "Split into groups of 3-3-2. Weigh 3 vs 3. If equal, weigh the remaining 2. If unequal, weigh 2 of the heavier group. 2 weighings max."
  },
  {
    id: 105,
    question: "In a room of 23 people, what is the approximate probability that two share a birthday?",
    options: ["About 10%", "About 25%", "About 50%", "About 75%"],
    correct: 2,
    explanation: "The Birthday Paradox: with just 23 people, there's a ~50.7% chance of a shared birthday. Counter-intuitive but mathematically proven!"
  }
];

// Initialize default questions
gameState.questions.level1 = [...defaultLevel1Questions];
gameState.questions.level2 = [...defaultLevel2Questions];

// ==================== UTILITY FUNCTIONS ====================
function generatePlayerId() {
  return uuidv4();
}

function updateLeaderboard() {
  const playersArray = Array.from(gameState.players.values());

  // Active players ranked by score, tiebreaker by completionTime
  const activePlayers = playersArray
    .filter(p => !p.eliminated)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker: earlier completion time wins
      const aTime = a.completionTime || Infinity;
      const bTime = b.completionTime || Infinity;
      return aTime - bTime;
    })
    .map((p, index) => ({
      rank: index + 1,
      id: p.id,
      name: p.name,
      score: p.score,
      infectionLevel: p.infectionLevel,
      status: p.completed ? 'COMPLETED' : p.status,
      correctAnswers: p.correctAnswers,
      wrongAnswers: p.wrongAnswers,
      completed: p.completed,
      completionOrder: p.completionOrder
    }));

  // Eliminated players appended at the end
  const eliminatedPlayers = playersArray
    .filter(p => p.eliminated)
    .map(p => ({
      rank: 0,
      id: p.id,
      name: p.name,
      score: p.score,
      infectionLevel: p.infectionLevel,
      status: 'ELIMINATED',
      correctAnswers: p.correctAnswers,
      wrongAnswers: p.wrongAnswers,
      completed: false,
      completionOrder: 0
    }));

  gameState.leaderboard = [...activePlayers, ...eliminatedPlayers];

  io.emit('leaderboardUpdate', gameState.leaderboard);
}

function addSystemMessage(message, type = 'info') {
  const msg = {
    id: uuidv4(),
    text: message,
    type,
    timestamp: Date.now()
  };
  gameState.systemMessages.unshift(msg);
  if (gameState.systemMessages.length > 20) {
    gameState.systemMessages.pop();
  }
  io.emit('systemMessage', msg);
}

function eliminatePlayer(playerId, reason = 'Infection critical') {
  const player = gameState.players.get(playerId);
  if (player && !player.eliminated) {
    player.eliminated = true;
    player.status = 'ELIMINATED';
    player.eliminationReason = reason;
    player.eliminationTime = Date.now();
    gameState.eliminatedPlayers.push(player);

    addSystemMessage(`SUBJECT ${player.name} HAS BEEN TERMINATED. REASON: ${reason}`, 'elimination');

    const socket = io.sockets.sockets.get(player.socketId);
    if (socket) {
      socket.emit('eliminated', { reason, eliminationTime: Date.now() });
    }

    updateLeaderboard();
  }
}

// checkLevelProgression removed — now handled by per-player flow

function startLevel1() {
  gameState.currentLevel = 1;
  gameState.questionIndex = 0;
  gameState.isActive = true;
  gameState.level1Ended = false;

  addSystemMessage('CONTAINMENT BREACH DETECTED. LEVEL 1 INITIATED.', 'warning');
  addSystemMessage(`TIMER SET: ${gameState.level1Timer} SECONDS PER QUESTION.`, 'info');

  // Reset per-player question state
  gameState.players.forEach(player => {
    player.questionIndex = 0;
    player.completed = false;
    player.completionTime = null;
    player.completionOrder = 0;
  });

  io.emit('levelStart', {
    level: 1,
    timer: gameState.level1Timer,
    totalQuestions: gameState.questions.level1.length
  });

  io.emit('gameState', {
    isActive: gameState.isActive,
    currentLevel: gameState.currentLevel,
    leaderboard: gameState.leaderboard,
    systemMessages: gameState.systemMessages.slice(0, 5)
  });

  // Send first question to each player individually
  gameState.players.forEach(player => {
    if (!player.eliminated) {
      sendNextQuestionToPlayer(player);
    }
  });
}

function startLevel2() {
  gameState.currentLevel = 2;
  gameState.questionIndex = 0;
  gameState.isActive = true;

  const survivors = Array.from(gameState.players.values()).filter(p => !p.eliminated);
  addSystemMessage(`LEVEL 2: AI CONTAINMENT PROTOCOL. ${survivors.length} SUBJECTS REMAIN.`, 'warning');

  // Reset per-player question state for level 2
  survivors.forEach(player => {
    player.questionIndex = 0;
    player.completed = false;
    player.completionTime = null;
    player.completionOrder = 0;
    player.answeredCurrent = false;
  });

  io.emit('levelStart', {
    level: 2,
    timer: gameState.level2Timer,
    totalQuestions: gameState.questions.level2.length,
    survivors: survivors.length
  });

  io.emit('gameState', {
    isActive: gameState.isActive,
    currentLevel: gameState.currentLevel,
    leaderboard: gameState.leaderboard,
    systemMessages: gameState.systemMessages.slice(0, 5)
  });

  // Send first question to each surviving player
  survivors.forEach(player => {
    sendNextQuestionToPlayer(player);
  });
}

function sendNextQuestionToPlayer(player) {
  const questions = gameState.currentLevel === 1 ? gameState.questions.level1 : gameState.questions.level2;
  const timer = gameState.currentLevel === 1 ? gameState.level1Timer : gameState.level2Timer;

  if (player.questionIndex >= questions.length) {
    // Player has completed all questions
    if (!player.completed) {
      player.completed = true;
      player.completionTime = Date.now();

      // Calculate completion order
      const completedCount = Array.from(gameState.players.values()).filter(p => p.completed).length;
      player.completionOrder = completedCount;

      addSystemMessage(`${player.name} HAS COMPLETED ALL QUERIES. (FINISH #${completedCount})`, 'success');

      // Notify all clients about this player completing
      io.emit('playerCompleted', {
        playerId: player.id,
        name: player.name,
        completionOrder: completedCount,
        score: player.score
      });

      // Tell this specific player they're done (only real players have sockets)
      if (player.socketId) {
        const sock = io.sockets.sockets.get(player.socketId);
        if (sock) {
          sock.emit('allQuestionsCompleted');
        }
      }

      updateLeaderboard();
      checkAllPlayersCompleted();
    }
    return;
  }

  const question = questions[player.questionIndex];
  player.answeredCurrent = false;

  // Send question to real player via socket
  if (player.socketId) {
    const sock = io.sockets.sockets.get(player.socketId);
    if (sock) {
      sock.emit('newQuestion', {
        question: question,
        questionNumber: player.questionIndex + 1,
        totalQuestions: questions.length,
        timer: timer
      });
    }
  }

  // Bot auto-answer: answer after 1-3 seconds with 60% chance of being correct
  if (player.isBot) {
    const botDelay = 1000 + Math.random() * 2000; // 1-3 seconds
    const currentIdx = player.questionIndex;
    setTimeout(() => {
      if (!gameState.isActive || player.eliminated || player.completed || player.questionIndex !== currentIdx) return;

      player.answeredCurrent = true;
      const isCorrect = Math.random() < 0.6; // 60% correct

      if (isCorrect) {
        player.score += gameState.currentLevel === 1 ? 50 : 100;
        player.correctAnswers++;
        player.infectionLevel = Math.max(0, player.infectionLevel - 5);
      } else {
        player.wrongAnswers++;
        player.infectionLevel += gameState.currentLevel === 1 ? 15 : 25;
        if (player.infectionLevel >= 100) {
          eliminatePlayer(player.id, 'Infection level critical');
          updateLeaderboard();
          return;
        }
      }

      updateLeaderboard();
      player.questionIndex++;

      // Auto-advance bot to next question
      setTimeout(() => {
        if (!player.eliminated && !player.completed) {
          sendNextQuestionToPlayer(player);
        }
      }, 500);
    }, botDelay);
    return; // Don't set the per-player timeout for bots
  }

  // Per-player timer (real players only)
  const currentQuestionIdx = player.questionIndex;
  setTimeout(() => {
    if (gameState.isActive && !player.eliminated && !player.answeredCurrent && player.questionIndex === currentQuestionIdx) {
      // Time's up for this player on this question
      player.wrongAnswers++;
      player.infectionLevel += 20;
      if (player.infectionLevel >= 100) {
        eliminatePlayer(player.id, 'Failed to respond in time');
      } else {
        player.questionIndex++;
        sendNextQuestionToPlayer(player);
      }
      updateLeaderboard();
    }
  }, timer * 1000);
}

function checkAllPlayersCompleted() {
  const activePlayers = Array.from(gameState.players.values()).filter(p => !p.eliminated);
  const allCompleted = activePlayers.every(p => p.completed);

  if (allCompleted) {
    if (gameState.currentLevel === 1) {
      endLevel1();
    } else {
      endGame();
    }
  }
}

function endLevel1() {
  if (gameState.level1Ended) return; // prevent double-call
  gameState.level1Ended = true;

  addSystemMessage('LEVEL 1 COMPLETE. PROCESSING SURVIVORS...', 'info');

  // Top 10 advance
  const advanceCount = 10;

  // Sort by score, then by completion time (earlier = better)
  const rankedPlayers = Array.from(gameState.players.values())
    .filter(p => !p.eliminated)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker: earlier completion time wins
      const aTime = a.completionTime || Infinity;
      const bTime = b.completionTime || Infinity;
      return aTime - bTime;
    });

  const survivors = rankedPlayers.slice(0, advanceCount);

  // Eliminate those who didn't make the cut
  gameState.players.forEach(player => {
    if (!player.eliminated && !survivors.find(s => s.id === player.id)) {
      eliminatePlayer(player.id, 'Did not make top 10');
    }
  });

  updateLeaderboard();
  addSystemMessage(`${survivors.length} SUBJECTS SHORTLISTED FOR LEVEL 2.`, 'success');

  // Emit transition event with survivor names - admin will manually start Level 2
  io.emit('level1Complete', {
    survivors: survivors.map(s => ({ id: s.id, name: s.name, score: s.score }))
  });

  // Emit updated game state for admin
  io.emit('gameState', {
    isActive: gameState.isActive,
    currentLevel: gameState.currentLevel,
    leaderboard: gameState.leaderboard,
    systemMessages: gameState.systemMessages.slice(0, 5),
    level1Ended: true
  });
}

function endGame() {
  gameState.isActive = false;

  const winners = Array.from(gameState.players.values())
    .filter(p => !p.eliminated)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = a.completionTime || Infinity;
      const bTime = b.completionTime || Infinity;
      return aTime - bTime;
    });

  addSystemMessage('SIMULATION COMPLETE. CHAMPIONS IDENTIFIED.', 'success');

  // Mark players outside top 5 as eliminated
  winners.slice(5).forEach(p => {
    eliminatePlayer(p.id, 'Did not make top 5 champions');
  });
  updateLeaderboard();

  // Re-fetch winners after elimination
  const finalWinners = Array.from(gameState.players.values())
    .filter(p => !p.eliminated)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = a.completionTime || Infinity;
      const bTime = b.completionTime || Infinity;
      return aTime - bTime;
    });

  io.emit('gameEnd', {
    winners: finalWinners.slice(0, 5),
    champion: finalWinners[0] || null,
    totalPlayers: gameState.players.size,
    eliminatedCount: gameState.eliminatedPlayers.length
  });
}

function resetGame() {
  gameState.isActive = false;
  gameState.currentLevel = 0;
  gameState.level1Ended = false;
  gameState.players.clear();
  gameState.eliminatedPlayers = [];
  gameState.leaderboard = [];
  gameState.systemMessages = [];
  gameState.currentQuestion = null;
  gameState.questionIndex = 0;

  addSystemMessage('SYSTEM RESET COMPLETE. AWAITING NEW SUBJECTS.', 'info');
  io.emit('gameReset');
  io.emit('leaderboardUpdate', []);
}

// ==================== SOCKET.IO HANDLERS ====================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current game state
  socket.emit('gameState', {
    isActive: gameState.isActive,
    currentLevel: gameState.currentLevel,
    leaderboard: gameState.leaderboard,
    systemMessages: gameState.systemMessages.slice(0, 5)
  });

  // Player registration
  socket.on('registerPlayer', (data) => {
    const playerId = generatePlayerId();
    const player = {
      id: playerId,
      socketId: socket.id,
      name: data.name || `SUBJECT-${Math.floor(Math.random() * 9999)}`,
      score: 0,
      infectionLevel: 0,
      eliminated: false,
      status: 'ACTIVE',
      answeredCurrent: false,
      correctAnswers: 0,
      wrongAnswers: 0,
      joinTime: Date.now(),
      questionIndex: 0,
      completed: false,
      completionTime: null,
      completionOrder: 0,
      tabSwitchCount: 0
    };

    gameState.players.set(playerId, player);
    socket.playerId = playerId;

    socket.emit('registered', { playerId, player });
    addSystemMessage(`${player.name} HAS ENTERED THE FACILITY.`, 'info');
    updateLeaderboard();
  });

  // Answer submission
  socket.on('submitAnswer', (data) => {
    const player = gameState.players.get(socket.playerId);
    if (!player || player.eliminated || player.completed || player.answeredCurrent) return;

    const questions = gameState.currentLevel === 1 ? gameState.questions.level1 : gameState.questions.level2;
    const currentQuestion = questions[player.questionIndex];
    if (!currentQuestion) return;

    player.answeredCurrent = true;
    const isCorrect = data.answerIndex === currentQuestion.correct;

    if (isCorrect) {
      player.score += gameState.currentLevel === 1 ? 50 : 100;
      player.correctAnswers++;
      player.infectionLevel = Math.max(0, player.infectionLevel - 5);
    } else {
      player.wrongAnswers++;
      player.infectionLevel += gameState.currentLevel === 1 ? 15 : 25;

      if (player.infectionLevel >= 100) {
        eliminatePlayer(player.id, 'Infection level critical');
        updateLeaderboard();
        return;
      }
    }

    socket.emit('answerResult', {
      correct: isCorrect,
      correctAnswer: currentQuestion.correct,
      explanation: currentQuestion.explanation,
      infectionLevel: player.infectionLevel,
      score: player.score
    });

    updateLeaderboard();

    // Auto-advance to next question for this player
    player.questionIndex++;
    setTimeout(() => {
      if (!player.eliminated && !player.completed) {
        sendNextQuestionToPlayer(player);
      }
    }, 2000); // 2s delay to read the answer result
  });

  // Admin controls
  socket.on('adminStartGame', () => {
    if (gameState.players.size < 1) {
      socket.emit('adminError', 'Not enough players');
      return;
    }

    // Soft reset: clear stats but keep players
    gameState.isActive = false;
    gameState.currentLevel = 0;
    gameState.eliminatedPlayers = [];
    gameState.systemMessages = [];
    gameState.currentQuestion = null;
    gameState.questionIndex = 0;

    gameState.players.forEach(player => {
      player.score = 0;
      player.infectionLevel = 0;
      player.eliminated = false;
      player.status = 'ACTIVE';
      player.answeredCurrent = false;
      player.correctAnswers = 0;
      player.wrongAnswers = 0;
      player.questionIndex = 0;
      player.completed = false;
      player.completionTime = null;
      player.completionOrder = 0;
      player.tabSwitchCount = 0;
    });

    updateLeaderboard();
    addSystemMessage('CONTAINMENT BREACH IMMINENT. INITIATING SIMULATION...', 'info');

    // Broadcast fresh admin data immediately so admin panel shows clean state
    io.emit('adminData', {
      players: Array.from(gameState.players.values()).map(p => ({
        id: p.id, name: p.name, score: p.score, infectionLevel: p.infectionLevel,
        status: p.status, correctAnswers: p.correctAnswers, wrongAnswers: p.wrongAnswers,
        eliminated: p.eliminated, completed: p.completed, completionOrder: p.completionOrder,
        questionIndex: p.questionIndex
      })),
      questions: gameState.questions,
      settings: {
        level1Timer: gameState.level1Timer, level2Timer: gameState.level2Timer,
        eliminationPercentage: gameState.eliminationPercentage,
        currentLevel: gameState.currentLevel, isActive: gameState.isActive,
        level1Ended: gameState.level1Ended || false
      }
    });

    // Start Level 1 immediately — no delay
    startLevel1();
  });

  socket.on('adminResetGame', () => {
    resetGame();
  });

  socket.on('adminUpdateSettings', (data) => {
    if (data.level1Timer && data.level1Timer >= 5 && data.level1Timer <= 120) {
      gameState.level1Timer = data.level1Timer;
    }
    if (data.level2Timer && data.level2Timer >= 5 && data.level2Timer <= 120) {
      gameState.level2Timer = data.level2Timer;
    }
    addSystemMessage(`SETTINGS UPDATED: L1=${gameState.level1Timer}s, L2=${gameState.level2Timer}s`, 'info');
    socket.emit('adminData', {
      players: Array.from(gameState.players.values()).map(p => ({
        id: p.id, name: p.name, score: p.score, infectionLevel: p.infectionLevel,
        status: p.status, correctAnswers: p.correctAnswers, wrongAnswers: p.wrongAnswers,
        eliminated: p.eliminated, completed: p.completed, completionOrder: p.completionOrder,
        questionIndex: p.questionIndex
      })),
      questions: gameState.questions,
      settings: {
        level1Timer: gameState.level1Timer, level2Timer: gameState.level2Timer,
        eliminationPercentage: gameState.eliminationPercentage,
        currentLevel: gameState.currentLevel, isActive: gameState.isActive,
        level1Ended: gameState.level1Ended || false
      }
    });
  });

  socket.on('adminStartLevel2', () => {
    if (!gameState.level1Ended) {
      socket.emit('adminError', 'Level 1 has not ended yet');
      return;
    }
    const survivors = Array.from(gameState.players.values()).filter(p => !p.eliminated);
    if (survivors.length < 1) {
      socket.emit('adminError', 'No survivors to start Level 2');
      return;
    }
    startLevel2();
  });

  // ---- BOT SYSTEM ----
  socket.on('adminAddBots', (data) => {
    const botCount = data?.count || 15;
    const botNames = [
      'NEXUS-7', 'CIPHER-X', 'VORTEX-3', 'PHANTOM-9', 'BLAZE-12',
      'SPECTRE-4', 'NEON-11', 'ROGUE-6', 'NOVA-8', 'STORM-2',
      'APEX-14', 'ECHO-5', 'TITAN-1', 'PULSE-10', 'DRIFT-13',
      'ZERO-15', 'FLUX-16', 'OMEGA-17', 'SPARK-18', 'BLADE-19'
    ];

    for (let i = 0; i < botCount; i++) {
      const botId = `bot-${uuidv4().slice(0, 8)}`;
      const bot = {
        id: botId,
        socketId: null, // bots have no socket
        name: botNames[i] || `BOT-${i + 1}`,
        score: 0,
        infectionLevel: 0,
        eliminated: false,
        status: 'ACTIVE',
        answeredCurrent: false,
        correctAnswers: 0,
        wrongAnswers: 0,
        joinTime: Date.now(),
        questionIndex: 0,
        completed: false,
        completionTime: null,
        completionOrder: 0,
        isBot: true
      };
      gameState.players.set(botId, bot);
      addSystemMessage(`${bot.name} HAS ENTERED THE FACILITY.`, 'info');
    }
    updateLeaderboard();
    addSystemMessage(`${botCount} TEST SUBJECTS DEPLOYED.`, 'success');
  });


  socket.on('adminAddQuestion', (data) => {
    const question = {
      id: uuidv4(),
      ...data
    };

    if (data.level === 1) {
      gameState.questions.level1.push(question);
    } else {
      gameState.questions.level2.push(question);
    }

    socket.emit('adminQuestionAdded', question);
  });

  socket.on('adminDeleteQuestion', (data) => {
    if (data.level === 1) {
      gameState.questions.level1 = gameState.questions.level1.filter(q => q.id !== data.id);
    } else {
      gameState.questions.level2 = gameState.questions.level2.filter(q => q.id !== data.id);
    }
    socket.emit('adminQuestionDeleted', data);
  });

  socket.on('adminGetData', () => {
    const playersArray = Array.from(gameState.players.values());
    socket.emit('adminData', {
      players: playersArray.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        infectionLevel: p.infectionLevel,
        status: p.status,
        correctAnswers: p.correctAnswers,
        wrongAnswers: p.wrongAnswers,
        eliminated: p.eliminated,
        completed: p.completed,
        completionOrder: p.completionOrder,
        questionIndex: p.questionIndex
      })),
      questions: gameState.questions,
      settings: {
        level1Timer: gameState.level1Timer,
        level2Timer: gameState.level2Timer,
        eliminationPercentage: gameState.eliminationPercentage,
        currentLevel: gameState.currentLevel,
        isActive: gameState.isActive,
        level1Ended: gameState.level1Ended || false
      }
    });
  });

  socket.on('adminExportCSV', () => {
    const csvData = Array.from(gameState.players.values()).map(p => ({
      Name: p.name,
      Score: p.score,
      InfectionLevel: p.infectionLevel,
      Status: p.status,
      CorrectAnswers: p.correctAnswers,
      WrongAnswers: p.wrongAnswers,
      Eliminated: p.eliminated,
      EliminationReason: p.eliminationReason || 'N/A'
    }));

    socket.emit('adminExportData', csvData);
  });

  // ---- ANTI-CHEAT: TAB SWITCH DETECTION ----
  socket.on('tabSwitch', () => {
    const player = gameState.players.get(socket.playerId);
    if (!player || player.eliminated || !gameState.isActive || gameState.currentLevel === 0) return;

    player.tabSwitchCount = (player.tabSwitchCount || 0) + 1;
    const count = player.tabSwitchCount;

    if (count <= 3) {
      // Warn the player
      socket.emit('antiCheatWarning', {
        offenseCount: count,
        maxWarnings: 3,
        message: count === 3
          ? 'FINAL WARNING: Next tab switch will result in point deductions!'
          : `WARNING ${count}/3: Tab switching detected. Stay in the game!`
      });
      addSystemMessage(`⚠ ${player.name} switched tabs (${count}/3 warnings)`, 'warning');
    } else {
      // Deduct points after 3rd offense
      const penalty = -50;
      player.score += penalty;
      socket.emit('antiCheatPenalty', {
        offenseCount: count,
        penalty: penalty,
        newScore: player.score,
        message: `PENALTY: ${penalty} points! Tab switching is not allowed.`
      });
      addSystemMessage(`🚨 ${player.name} penalized ${penalty} pts for tab switching (offense #${count})`, 'elimination');

      // Check if player should be eliminated (score too low)
      if (player.score <= -10) {
        eliminatePlayer(player.id, 'Excessive tab switching - anti-cheat violation');
      }

      updateLeaderboard();
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.playerId) {
      const player = gameState.players.get(socket.playerId);
      if (player && !player.eliminated) {
        player.status = 'DISCONNECTED';
        updateLeaderboard();
      }
    }
  });
});

// ==================== HTTP ROUTES ====================
app.get('/api/status', (req, res) => {
  res.json({
    isActive: gameState.isActive,
    currentLevel: gameState.currentLevel,
    playerCount: gameState.players.size,
    activePlayers: Array.from(gameState.players.values()).filter(p => !p.eliminated).length
  });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(gameState.leaderboard);
});

// Catch-all: serve frontend for any non-API route (SPA support)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           RESIDENT LOCKDOWN SERVER v1.0.0                  ║
║                                                            ║
║   Biohazard Containment Simulation System                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Server running on port ${PORT}
Waiting for connections...
  `);
});
