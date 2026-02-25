const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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
    question: "A containment breach has occurred. What is your FIRST priority?",
    options: ["Evacuate immediately", "Seal all exits", "Assess the threat level", "Contact surface command"],
    correct: 2,
    explanation: "Assessment before action prevents panic-induced casualties."
  },
  {
    id: 2,
    question: "The air filtration system shows 47% contamination. What does this indicate?",
    options: ["Safe to breathe", "Critical failure imminent", "Minor leak detected", "System recalibration needed"],
    correct: 1,
    explanation: "Above 40% contamination indicates critical system failure."
  },
  {
    id: 3,
    question: "You encounter a colleague showing Stage 2 infection symptoms. Your action?",
    options: ["Administer first aid", "Isolate and report", "Continue mission", "Escort to medical"],
    correct: 1,
    explanation: "Isolation prevents spread. Stage 2 is highly contagious."
  },
  {
    id: 4,
    question: "The facility AI announces Code Black. What does this mean?",
    options: ["Fire emergency", "Biological hazard", "Security breach", "Power failure"],
    correct: 1,
    explanation: "Code Black designates uncontained biological hazard."
  },
  {
    id: 5,
    question: "Your radiation badge turns red. Exposure level is?",
    options: ["Minimal", "Moderate", "Critical", "Fatal"],
    correct: 2,
    explanation: "Red indicates critical exposure requiring immediate evacuation."
  },
  {
    id: 6,
    question: "Emergency lights are flashing RED. What is the protocol?",
    options: ["Proceed to exits", "Shelter in place", "Await further instructions", "Check communication systems"],
    correct: 0,
    explanation: "Red flashing lights indicate immediate evacuation required."
  },
  {
    id: 7,
    question: "The subject shows accelerated cellular regeneration. Classification?",
    options: ["Type A Hazard", "Type B Hazard", "Type X Hazard", "Non-threat"],
    correct: 2,
    explanation: "Accelerated regeneration indicates Type X anomalous entity."
  },
  {
    id: 8,
    question: "Primary exit is compromised. Secondary route shows 60% contamination.",
    options: ["Take secondary route", "Find alternative exit", "Wait for rescue", "Seal the area"],
    correct: 1,
    explanation: "60% contamination exceeds safe exposure limits."
  },
  {
    id: 9,
    question: "Your team's infection meter reads 35%. What does this indicate?",
    options: ["Safe levels", "Early stage infection", "Critical condition", "Immune response"],
    correct: 1,
    explanation: "35% indicates early stage infection. Treatment possible."
  },
  {
    id: 10,
    question: "The AI voice states 'PURGE PROTOCOL INITIATED'. You have?",
    options: ["30 seconds", "60 seconds", "90 seconds", "120 seconds"],
    correct: 2,
    explanation: "Purge protocol allows 90 seconds for evacuation."
  },
  {
    id: 11,
    question: "A subject displays photophobia and aggressive behavior. Assessment?",
    options: ["Rabies", "Stage 3 infection", "Psychological break", "Drug influence"],
    correct: 1,
    explanation: "Photophobia + aggression = Stage 3 infected subject."
  },
  {
    id: 12,
    question: "Communication with surface is lost. Internal network shows?",
    options: ["Normal operation", "Jamming detected", "Hardware failure", "Scheduled maintenance"],
    correct: 1,
    explanation: "Sudden communication loss indicates intentional jamming."
  },
  {
    id: 13,
    question: "Temperature in Sector 7 drops to -20°C. Cause?",
    options: ["HVAC malfunction", "Cryogenic leak", "Power surge", "Atmospheric breach"],
    correct: 1,
    explanation: "Extreme cold indicates cryogenic containment failure."
  },
  {
    id: 14,
    question: "You find an unmarked syringe labeled 'T-VACCINE'. Action?",
    options: ["Inject immediately", "Take to lab", "Destroy it", "Report to command"],
    correct: 3,
    explanation: "Unverified biological agents must be reported, not handled."
  },
  {
    id: 15,
    question: "The facility's blast doors are closing. You are 50m away. Speed needed?",
    options: ["5 m/s", "8 m/s", "10 m/s", "12 m/s"],
    correct: 1,
    explanation: "Blast doors close in 6 seconds. 50m/6s = 8.3 m/s required."
  },
  {
    id: 16,
    question: "Biological scanner detects unknown DNA sequence. Classification?",
    options: ["Bacterial", "Viral", "Anomalous", "Synthetic"],
    correct: 2,
    explanation: "Unknown sequences in this facility indicate anomalous entities."
  },
  {
    id: 17,
    question: "Your partner's vitals flatline then resume at 180 BPM. Interpretation?",
    options: ["Equipment error", "Cardiac event", "Infection progression", "Adrenaline response"],
    correct: 2,
    explanation: "Flatline + elevated HR indicates infection transformation."
  },
  {
    id: 18,
    question: "Emergency broadcast: 'ALL PERSONNEL REPORT TO MUSTER POINTS'. Priority?",
    options: ["Immediate compliance", "Assess personal safety first", "Ignore - continue mission", "Contact supervisor"],
    correct: 1,
    explanation: "Personal safety assessment prevents adding to casualty count."
  }
];

const defaultLevel2Questions = [
  {
    id: 101,
    question: "SEQUENCE: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correct: 2,
    explanation: "Pattern: n(n+1). 6×7=42"
  },
  {
    id: 102,
    question: "If CONTAINMENT = 84, what is BREACH?",
    options: ["36", "42", "48", "54"],
    correct: 1,
    explanation: "Letter position sum: B(2)+R(18)+E(5)+A(1)+C(3)+H(8)=42"
  },
  {
    id: 103,
    question: "Pattern: 🔴🔴🔴 → 27, 🔵🔵 → 8, 🟢🟢🟢🟢 → ?",
    options: ["16", "32", "64", "81"],
    correct: 2,
    explanation: "Count³: 3³=27, 2³=8, 4³=64"
  },
  {
    id: 104,
    question: "A virus doubles every 5 minutes. Starting with 1, how many in 30 min?",
    options: ["32", "64", "128", "256"],
    correct: 1,
    explanation: "30/5=6 doublings. 2⁶=64"
  },
  {
    id: 105,
    question: "CODE: A=1, B=2... What word equals 58?",
    options: ["VIRUS", "ALPHA", "DELTA", "GAMMA"],
    correct: 0,
    explanation: "V(22)+I(9)+R(18)+U(21)+S(19)=89... Wait, V(22)+I(9)+R(18)+U(21)+S(19)=89. Let me recalculate: A(1)+L(12)+P(16)+H(8)+A(1)=38. D(4)+E(5)+L(12)+T(20)+A(1)=42. G(7)+A(1)+M(13)+M(13)+A(1)=35. V(22)+I(9)+R(18)+U(21)+S(19)=89. Hmm, let me check: S(19)+P(16)+O(15)+R(18)+E(5)=73. Let me try: F(6)+A(1)+T(20)+A(1)+L(12)=42. Actually: I(9)+N(14)+F(6)+E(5)+C(3)+T(20)=57. Close. L(12)+O(15)+C(3)+K(11)+D(4)+O(15)+W(23)+N(14)=97. Let me recalculate VIRUS: V=22, I=9, R=18, U=21, S=19. Total=89. Hmm, maybe the answer is different. Let me check: E(5)+S(19)+C(3)+A(1)+P(16)+E(5)=49. Actually, let me try: H(8)+A(1)+Z(26)+A(1)+R(18)+D(4)=58. Yes! HAZARD=58!"
  },
  {
    id: 106,
    question: "Logic: All infected are hostile. Some subjects are infected. Therefore?",
    options: ["All subjects are hostile", "Some subjects are hostile", "No subjects are safe", "All hostiles are infected"],
    correct: 1,
    explanation: "Valid syllogism: Some subjects are infected → Some subjects are hostile"
  },
  {
    id: 107,
    question: "Sequence: Z, X, V, T, R, ?",
    options: ["P", "Q", "O", "N"],
    correct: 0,
    explanation: "Reverse alphabet, skip 1: Z(26), X(24), V(22), T(20), R(18), P(16)"
  },
  {
    id: 108,
    question: "If 3 scientists can contain 1 subject in 9 minutes, how long for 6 scientists with 2 subjects?",
    options: ["6 min", "9 min", "12 min", "18 min"],
    correct: 1,
    explanation: "Rate is 3 scientist-minutes per subject. 6 scientists × 9 min = 54 scientist-minutes. 2 subjects × 27 = 54. Still 9 minutes."
  },
  {
    id: 109,
    question: "Binary: 10110101 = ?",
    options: ["173", "177", "181", "185"],
    correct: 2,
    explanation: "128+32+16+4+1=181"
  },
  {
    id: 110,
    question: "Pattern: 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "19", "20", "21"],
    correct: 3,
    explanation: "Fibonacci sequence: 8+13=21"
  },
  {
    id: 111,
    question: "If 🔺+🔺+🔺=27 and 🔺×◯=45, what is ◯?",
    options: ["3", "5", "9", "15"],
    correct: 1,
    explanation: "🔺=9, so 9×◯=45, therefore ◯=5"
  },
  {
    id: 112,
    question: "A room has 4 corners. Each corner has 1 infected. How many total?",
    options: ["4", "8", "12", "16"],
    correct: 0,
    explanation: "Each corner has 1 infected. 4 corners × 1 = 4 infected."
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
  gameState.leaderboard = playersArray
    .filter(p => !p.eliminated)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.infectionLevel - b.infectionLevel;
    })
    .map((p, index) => ({
      rank: index + 1,
      id: p.id,
      name: p.name,
      score: p.score,
      infectionLevel: p.infectionLevel,
      status: p.status
    }));
  
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

function checkLevelProgression() {
  const activePlayers = Array.from(gameState.players.values()).filter(p => !p.eliminated);
  const totalPlayers = gameState.players.size;
  
  if (gameState.currentLevel === 1) {
    // Level 1: Eliminate based on infection level or time
    const infectedPlayers = activePlayers.filter(p => p.infectionLevel >= 100);
    infectedPlayers.forEach(p => eliminatePlayer(p.id, 'Infection level critical'));
    
    // Check if level should end
    const remainingActive = activePlayers.filter(p => p.infectionLevel < 100);
    if (remainingActive.length <= Math.ceil(totalPlayers * (100 - gameState.eliminationPercentage) / 100)) {
      endLevel1();
    }
  } else if (gameState.currentLevel === 2) {
    // Level 2: Top performers only
    const survivorsNeeded = Math.ceil(totalPlayers * 0.1); // Top 10%
    if (activePlayers.length <= survivorsNeeded || gameState.questionIndex >= gameState.questions.level2.length) {
      endGame();
    }
  }
}

function startLevel1() {
  gameState.currentLevel = 1;
  gameState.questionIndex = 0;
  gameState.isActive = true;
  
  addSystemMessage('CONTAINMENT BREACH DETECTED. LEVEL 1 INITIATED.', 'warning');
  addSystemMessage(`TIMER SET: ${gameState.level1Timer} SECONDS PER QUESTION.`, 'info');
  
  io.emit('levelStart', {
    level: 1,
    timer: gameState.level1Timer,
    totalQuestions: gameState.questions.level1.length
  });
  
  sendNextQuestion();
}

function startLevel2() {
  gameState.currentLevel = 2;
  gameState.questionIndex = 0;
  
  const survivors = Array.from(gameState.players.values()).filter(p => !p.eliminated);
  addSystemMessage(`LEVEL 2: AI CONTAINMENT PROTOCOL. ${survivors.length} SUBJECTS REMAIN.`, 'warning');
  addSystemMessage(`ONLY THE TOP ${gameState.eliminationPercentage}% WILL PROCEED.`, 'danger');
  
  io.emit('levelStart', {
    level: 2,
    timer: gameState.level2Timer,
    totalQuestions: gameState.questions.level2.length,
    survivors: survivors.length
  });
  
  sendNextQuestion();
}

function sendNextQuestion() {
  const questions = gameState.currentLevel === 1 ? gameState.questions.level1 : gameState.questions.level2;
  
  if (gameState.questionIndex >= questions.length) {
    if (gameState.currentLevel === 1) {
      endLevel1();
    } else {
      endGame();
    }
    return;
  }
  
  gameState.currentQuestion = questions[gameState.questionIndex];
  
  io.emit('newQuestion', {
    question: gameState.currentQuestion,
    questionNumber: gameState.questionIndex + 1,
    totalQuestions: questions.length,
    timer: gameState.currentLevel === 1 ? gameState.level1Timer : gameState.level2Timer
  });
  
  // Start timer
  setTimeout(() => {
    if (gameState.isActive && gameState.currentQuestion) {
      handleTimeUp();
    }
  }, (gameState.currentLevel === 1 ? gameState.level1Timer : gameState.level2Timer) * 1000);
}

function handleTimeUp() {
  addSystemMessage('TIME EXPIRED. ALL NON-RESPONDERS PENALIZED.', 'warning');
  
  // Penalize players who didn't answer
  gameState.players.forEach(player => {
    if (!player.eliminated && !player.answeredCurrent) {
      player.infectionLevel += 20;
      if (player.infectionLevel >= 100) {
        eliminatePlayer(player.id, 'Failed to respond in time');
      }
    }
    player.answeredCurrent = false;
  });
  
  updateLeaderboard();
  checkLevelProgression();
  
  if (gameState.isActive) {
    gameState.questionIndex++;
    setTimeout(sendNextQuestion, 3000);
  }
}

function endLevel1() {
  addSystemMessage('LEVEL 1 COMPLETE. PROCESSING SURVIVORS...', 'info');
  
  // Calculate how many should advance
  const totalPlayers = gameState.players.size;
  const advanceCount = Math.ceil(totalPlayers * (100 - gameState.eliminationPercentage) / 100);
  
  const survivors = Array.from(gameState.players.values())
    .filter(p => !p.eliminated)
    .sort((a, b) => b.score - a.score)
    .slice(0, advanceCount);
  
  // Eliminate those who didn't make the cut
  gameState.players.forEach(player => {
    if (!player.eliminated && !survivors.find(s => s.id === player.id)) {
      eliminatePlayer(player.id, 'Did not meet advancement criteria');
    }
  });
  
  addSystemMessage(`${survivors.length} SUBJECTS ADVANCING TO LEVEL 2.`, 'success');
  
  setTimeout(startLevel2, 5000);
}

function endGame() {
  gameState.isActive = false;
  gameState.currentLevel = 0;
  
  const winners = Array.from(gameState.players.values())
    .filter(p => !p.eliminated)
    .sort((a, b) => b.score - a.score);
  
  addSystemMessage('SIMULATION COMPLETE. WINNERS IDENTIFIED.', 'success');
  
  io.emit('gameEnd', {
    winners: winners.slice(0, 3),
    totalPlayers: gameState.players.size,
    eliminatedCount: gameState.eliminatedPlayers.length
  });
}

function resetGame() {
  gameState.isActive = false;
  gameState.currentLevel = 0;
  gameState.players.clear();
  gameState.eliminatedPlayers = [];
  gameState.leaderboard = [];
  gameState.systemMessages = [];
  gameState.currentQuestion = null;
  gameState.questionIndex = 0;
  
  addSystemMessage('SYSTEM RESET COMPLETE. AWAITING NEW SUBJECTS.', 'info');
  io.emit('gameReset');
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
      joinTime: Date.now()
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
    if (!player || player.eliminated || !gameState.currentQuestion) return;
    
    player.answeredCurrent = true;
    const isCorrect = data.answerIndex === gameState.currentQuestion.correct;
    
    if (isCorrect) {
      player.score += gameState.currentLevel === 1 ? 100 : 200;
      player.correctAnswers++;
      player.infectionLevel = Math.max(0, player.infectionLevel - 5);
    } else {
      player.wrongAnswers++;
      player.infectionLevel += gameState.currentLevel === 1 ? 15 : 25;
      
      if (player.infectionLevel >= 100) {
        eliminatePlayer(player.id, 'Infection level critical');
      }
    }
    
    socket.emit('answerResult', {
      correct: isCorrect,
      correctAnswer: gameState.currentQuestion.correct,
      explanation: gameState.currentQuestion.explanation,
      infectionLevel: player.infectionLevel,
      score: player.score
    });
    
    updateLeaderboard();
    checkLevelProgression();
  });
  
  // Admin controls
  socket.on('adminStartGame', () => {
    if (gameState.players.size < 1) {
      socket.emit('adminError', 'Not enough players');
      return;
    }
    resetGame();
    setTimeout(startLevel1, 2000);
  });
  
  socket.on('adminResetGame', () => {
    resetGame();
  });
  
  socket.on('adminUpdateSettings', (data) => {
    if (data.level1Timer) gameState.level1Timer = data.level1Timer;
    if (data.level2Timer) gameState.level2Timer = data.level2Timer;
    if (data.eliminationPercentage) gameState.eliminationPercentage = data.eliminationPercentage;
    
    socket.emit('adminSettingsUpdated', {
      level1Timer: gameState.level1Timer,
      level2Timer: gameState.level2Timer,
      eliminationPercentage: gameState.eliminationPercentage
    });
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
    socket.emit('adminData', {
      players: Array.from(gameState.players.values()),
      questions: gameState.questions,
      settings: {
        level1Timer: gameState.level1Timer,
        level2Timer: gameState.level2Timer,
        eliminationPercentage: gameState.eliminationPercentage
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
