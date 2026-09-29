const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { readDb, writeDb, hashPassword, verifyPassword } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware / Token simulator
function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const db = readDb();
  // Simple token format: user_{id}
  const user = db.users.find(u => `token_${u.id}` === token);
  return user || null;
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & CREDENTIALS API
// -------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, role } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Missing required fields (email, password, fullName)" });
  }

  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const { hash, salt } = hashPassword(password);
  const newUser = {
    id: `u-${Date.now()}`,
    email,
    fullName,
    role: role === 'moderator' ? 'moderator' : (role === 'admin' ? 'admin' : 'user'),
    points: 100, // Welcome bonus
    streak: 1,
    badges: ["Heritage Explorer Novice"],
    exploredCount: 0,
    masteredCount: 0,
    contributionsCount: 0,
    hash,
    salt
  };

  db.users.push(newUser);
  writeDb(db);

  const token = `token_${newUser.id}`;
  const { hash: h, salt: s, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.hash, user.salt)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = `token_${user.id}`;
  const { hash: h, salt: s, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { hash: h, salt: s, ...safeUser } = user;
  res.json({ user: safeUser });
});

// -------------------------------------------------------------
// 2. CULTURAL HUB & DISCOVERY API (Radius & Category Filtering)
// -------------------------------------------------------------
app.get('/api/heritage', (req, res) => {
  const { city = 'bhopal', radius = '5', category } = req.query;
  const db = readDb();
  
  let items = db.heritageItems.filter(item => item.cityId.toLowerCase() === city.toLowerCase());
  
  if (radius !== 'all') {
    const numRadius = parseFloat(radius);
    if (!isNaN(numRadius)) {
      items = items.filter(item => item.distanceKm <= numRadius);
    }
  }

  if (category && category !== 'all') {
    items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    city,
    radius: radius === 'all' ? 'All City' : `${radius} km`,
    totalFound: items.length,
    items
  });
});

// -------------------------------------------------------------
// 3. AI CULTURAL TRIP PLANNER API
// -------------------------------------------------------------
app.post('/api/planner/generate', (req, res) => {
  const { city = 'bhopal', duration = '1d', budget = 2500, transport = 'walking', interests = [] } = req.body;
  const numBudget = Number(budget) || 2500;

  // Curate structured cultural route based on budget and duration
  const itinerary = {
    title: duration === '6h' ? "Half-Day Sovereign Begums & Craft Trail" : "1-Day Living Heritage of Old Bhopal",
    city: city.toUpperCase(),
    duration,
    transportMode: transport,
    budgetAllocated: `₹${numBudget}`,
    estimatedCost: numBudget < 2000 ? `₹${Math.min(numBudget, 1200)} – ₹${Math.min(numBudget, 1600)}` : `₹1,800 – ₹2,200`,
    totalWalkingDistance: transport === 'walking' ? "5.4 km" : "9.8 km (with E-Rickshaw)",
    stops: [
      {
        time: "09:30 AM",
        name: "Gohar Mahal & Begum Lakefront",
        category: "history",
        cost: "₹50 entry",
        whyVisit: "Direct architectural testament to Qudsia Begum (first female ruler of Bhopal in 1819). Examines Indo-Saracenic vaulted corridors.",
        nearbyPractitioner: "Old boatmen oral lore circle at VIP Ghat"
      },
      {
        time: "12:15 PM",
        name: "Zari Zardozi Atelier of Master Shakir (Chowk)",
        category: "craft",
        cost: "Free observation / ₹400 workshop pass",
        whyVisit: "Witness genuine metallic wire stitching on heavy velvet. Only 14 master ateliers remain active.",
        preservationAlert: "Cultural Survival Score is 32/100 (At-Risk). Visiting provides direct patron livelihood."
      },
      {
        time: "02:30 PM",
        name: "Historic Sulemani Chai & Gosht Pilaf Tasting",
        category: "food",
        cost: "₹180 per person",
        whyVisit: "Taste pink spiced tea brewed in a century-old brass samovar using a recipe passed down across 4 generations.",
        nearbyPractitioner: "Haji Bhai's 70-year-old tea shop"
      },
      {
        time: "05:00 PM",
        name: "Dhrupad Sansthan Gurukul Acoustic Session",
        category: "music",
        cost: "₹300 donation pass",
        whyVisit: "Listen to the resonance of Rudra Veena and Pakhawaj in one of India's few surviving residential oral gurukuls.",
        audioGuideAvailable: true
      }
    ]
  };

  res.json({ itinerary });
});

// -------------------------------------------------------------
// 4. TRADITIONS & CULTURAL SURVIVAL SCORE API
// -------------------------------------------------------------
app.get('/api/traditions', (req, res) => {
  const db = readDb();
  res.json(db.traditions);
});

app.get('/api/traditions/:id', (req, res) => {
  const db = readDb();
  const tradition = db.traditions.find(t => t.id === req.params.id) || db.traditions[0];
  res.json(tradition);
});

// -------------------------------------------------------------
// 5. DAILY CULTURAL QUIZ & STREAK API
// -------------------------------------------------------------
app.get('/api/quiz/daily', (req, res) => {
  const db = readDb();
  res.json(db.dailyQuiz);
});

app.post('/api/quiz/submit', (req, res) => {
  const { selectedIndex } = req.body;
  const db = readDb();
  const quiz = db.dailyQuiz;
  const isCorrect = quiz.options[selectedIndex] && quiz.options[selectedIndex].isCorrect;

  let pointsAwarded = 0;
  const user = getAuthUser(req);
  if (user) {
    if (isCorrect) {
      pointsAwarded = 25;
      user.points += pointsAwarded;
      user.streak += 1;
      writeDb(db);
    }
  }

  res.json({
    isCorrect,
    explanation: quiz.explanation,
    pointsAwarded,
    newTotalPoints: user ? user.points : null,
    currentStreak: user ? user.streak : null
  });
});

// -------------------------------------------------------------
// 6. PRESERVATION & AI VERIFICATION PIPELINE API
// -------------------------------------------------------------
app.get('/api/preserve/submissions', (req, res) => {
  const db = readDb();
  res.json(db.submissions);
});

app.post('/api/preserve/submit', (req, res) => {
  const { traditionName, location, practitionerCount, description } = req.body;
  if (!traditionName || !description) {
    return res.status(400).json({ error: "Tradition name and description are required" });
  }

  const user = getAuthUser(req);
  const db = readDb();

  // Simulated AI Verification Pipeline
  const newSubmission = {
    id: `sub-${Date.now()}`,
    submittedBy: user ? user.fullName : "Guest Contributor",
    traditionName,
    location: location || "Central India",
    practitionerCount: parseInt(practitionerCount, 10) || 5,
    description,
    status: "under_review",
    aiExtraction: {
      dialect: "Central Indic Folk Sub-dialect",
      era: "Late Medieval Oral Transmission",
      metricEstimate: Math.floor(Math.random() * 25) + 20
    },
    aiDuplicateCheck: {
      similarity: (Math.random() * 0.15 + 0.05).toFixed(2),
      isUnique: true,
      archiveMatches: "No collision in IGNCA or National Folklore Archives"
    },
    createdAt: new Date().toISOString()
  };

  db.submissions.unshift(newSubmission);
  if (user) {
    user.points += 50; // Award points for meaningful contribution
    user.contributionsCount += 1;
  }
  writeDb(db);

  res.status(201).json({
    message: "Submission passed AI screening and is queued for Regional Moderator verification",
    submission: newSubmission
  });
});

app.post('/api/preserve/verify/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return res.status(403).json({ error: "Access denied. Only Regional Cultural Moderators or Admins can verify submissions." });
  }

  const { status, citationNotes } = req.body;
  const db = readDb();
  const sub = db.submissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: "Submission not found" });

  sub.status = status || "approved";
  sub.verifiedBy = user.fullName;
  sub.citationNotes = citationNotes || "Verified with local oral archive reference.";
  writeDb(db);

  res.json({ message: "Verification status updated successfully", submission: sub });
});

// -------------------------------------------------------------
// 7. HERITAGE PASSPORT API
// -------------------------------------------------------------
app.get('/api/passport', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Log in to view your Heritage Passport" });
  }

  res.json({
    passport: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      points: user.points,
      streak: user.streak,
      badges: user.badges,
      placesExplored: user.exploredCount,
      traditionsMastered: user.masteredCount,
      verifiedContributions: user.contributionsCount,
      quizAccuracy: "88%",
      culturalRank: `#${Math.max(1, 20 - Math.floor(user.points / 200))} Regional Custodian`
    }
  });
});

// -------------------------------------------------------------
// 8. DOCUMENTATION DOWNLOAD API
// -------------------------------------------------------------
const DOCS_DIR = path.join(__dirname, 'docs');

app.get('/api/docs/list', (req, res) => {
  if (!fs.existsSync(DOCS_DIR)) return res.json([]);
  const files = fs.readdirSync(DOCS_DIR).map(filename => {
    const stats = fs.statSync(path.join(DOCS_DIR, filename));
    return {
      filename,
      sizeBytes: stats.size,
      updatedAt: stats.mtime
    };
  });
  res.json(files);
});

app.get('/api/docs/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.download(filePath, filename);
});

app.get('/api/docs/download-all', (req, res) => {
  res.attachment('HERITA_COMPLETE_DOCUMENTATION_BUNDLE_SIH2026.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', err => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);
  archive.directory(DOCS_DIR, false);
  archive.finalize();
});

// Fallback to client
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server with fallback port scanning
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🏛️  HERITA Full-Stack Server Running on http://localhost:${port}`);
    console.log(`📚 Documentation Download API ready at /api/docs/download-all`);
    console.log(`👤 Seed Credentials ready for User, Moderator, and Admin`);
    console.log(`=======================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(PORT);
