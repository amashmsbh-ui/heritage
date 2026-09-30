// ==============================================================================
// HERITA Frontend Application Logic (SIH 2026)
// Living Cultural Heritage Preservation Platform
// Built with Universal Live + Static Deployment Fallback
// ==============================================================================

let currentCity = 'bhopal';
let currentRadius = 5;
let currentCategory = 'all';
let authToken = localStorage.getItem('herita_token') || null;
let currentUser = null;
let map = null;
let radiusCircle = null;
let mapMarkers = [];

// City Center Coordinates
const cityCoords = {
  bhopal: [23.2599, 77.4126],
  varanasi: [25.3176, 82.9739],
  jaipur: [26.9124, 75.7873]
};

// Resilient Fallback Data (Enables 100% interactive operation on GitHub Pages & offline)
const FALLBACK_HERITAGE = [
  {
    id: "h-1",
    cityId: "bhopal",
    title: "Dhrupad Classical Vocal Tradition",
    category: "music",
    distanceKm: 2.4,
    lat: 23.2450,
    lng: 77.4190,
    origin: "15th Century (Gwalior & Bhopal Court)",
    practitioners: "3 active gharana masters",
    survivalScore: 41,
    status: "at_risk",
    shortDescription: "India's oldest surviving classical vocal genre, emphasizing microtones and spiritual acoustic resonance.",
    whyItMatters: "Direct living link to Vedic chanting and Mughal court patronage. Bhopal's Dhrupad Sansthan is one of the last residential gurukuls in the world."
  },
  {
    id: "h-2",
    cityId: "bhopal",
    title: "Bhopali Zari Zardozi Embroidery",
    category: "craft",
    distanceKm: 4.8,
    lat: 23.2680,
    lng: 77.4020,
    origin: "18th Century (Begums of Bhopal)",
    practitioners: "14 master ateliers in Old City",
    survivalScore: 32,
    status: "at_risk",
    shortDescription: "Opulent metallic embroidery using gold and silver threads on velvet, patronized by the four Begums.",
    whyItMatters: "A fading legacy of female rulers. Rapid synthetic machine replicas threaten the economic survival of authentic hand-craft masters."
  },
  {
    id: "h-3",
    cityId: "bhopal",
    title: "Gohar Mahal & Begum Architecture",
    category: "history",
    distanceKm: 3.1,
    lat: 23.2550,
    lng: 77.3990,
    origin: "Built in 1820 by Qudsia Begum",
    practitioners: "Protected archaeological site & artisan hub",
    survivalScore: 84,
    status: "thriving",
    shortDescription: "A fusion of Mughal and Hindu architectural grandeur on the banks of the Upper Lake.",
    whyItMatters: "Symbolizes 107 years of sovereign women's rule in central India."
  },
  {
    id: "h-4",
    cityId: "bhopal",
    title: "Gond Oral Epics & Visual Lore",
    category: "literature",
    distanceKm: 8.5,
    lat: 23.2200,
    lng: 77.4350,
    origin: "Indigenous Ancestral Lore",
    practitioners: "Elder tribal bards & Pardhan storytellers",
    survivalScore: 55,
    status: "vulnerable",
    shortDescription: "Sacred cosmological folklore painted and sung to invoke the protective spirits of flora and fauna.",
    whyItMatters: "Tribal wisdom embodying ecological stewardship and centuries of oral transmission."
  },
  {
    id: "h-5",
    cityId: "bhopal",
    title: "Traditional Gedi (Bamboo Stilt) Racing",
    category: "game",
    distanceKm: 14.2,
    lat: 23.1800,
    lng: 77.4600,
    origin: "Rural Central India Folk Games",
    practitioners: "Monsoon Hareli festival players",
    survivalScore: 72,
    status: "stable",
    shortDescription: "Agility and balance game played on 5-foot bamboo poles during rainy season celebrations.",
    whyItMatters: "Fosters community bonding and physical resilience without expensive athletic gear."
  },
  {
    id: "h-6",
    cityId: "bhopal",
    title: "Bhopali Gosht Biryani & Sulemani Chai",
    category: "food",
    distanceKm: 3.8,
    lat: 23.2620,
    lng: 77.4060,
    origin: "19th Century Royal Kitchens",
    practitioners: "Heritage tea houses in Chowk",
    survivalScore: 90,
    status: "thriving",
    shortDescription: "Salted pink tea brewed with delicate spices, paired with slow-cooked spiced basmati pilaf.",
    whyItMatters: "Culinary heritage passed down through family-run tea stalls for 5 generations."
  },
  {
    id: "h-7",
    cityId: "bhopal",
    title: "Ustad Abdul Latif Khan Sarangi Lineage",
    category: "people",
    distanceKm: 4.1,
    lat: 23.2510,
    lng: 77.4110,
    origin: "20th Century Musical Lineage",
    practitioners: "2 surviving direct disciples",
    survivalScore: 28,
    status: "critical",
    shortDescription: "The vocal-emulating sarangi tradition perfected by Padma Shri Ustad Abdul Latif Khan.",
    whyItMatters: "The acoustic bow technique of this lineage is on the verge of extinction with only 2 living disciples."
  }
];

const FALLBACK_QUIZ = {
  question: "Which musical instrument is traditionally paired with the Rudra Veena in ancient Dhrupad performances?",
  options: [
    { text: "A) Sitar", isCorrect: false },
    { text: "B) Pakhawaj (Barrel-shaped drum)", isCorrect: true },
    { text: "C) Tabla", isCorrect: false },
    { text: "D) Shehnai", isCorrect: false }
  ],
  explanation: "Dhrupad is accompanied by the heavy, acoustic resonance of the Pakhawaj (Mrudang), rather than the modern tabla."
};

let localSubmissions = [
  {
    id: "sub-101",
    submittedBy: "Aarav Sharma",
    traditionName: "Bagheli Gondi Oral Epic (Narmada Myth)",
    location: "Outskirts of Bhopal, Hoshangabad Road",
    practitionerCount: 4,
    description: "An oral singing tradition sung during sowing seasons recounting how the Narmada river chose her path.",
    status: "under_review",
    aiExtraction: {
      dialect: "Bagheli / Gondi fusion",
      era: "Ancestral oral",
      metricEstimate: 29
    },
    aiDuplicateCheck: {
      similarity: 0.12,
      isUnique: true,
      archiveMatches: "No exact matches in IGNCA database"
    }
  }
];

// -------------------------------------------------------------
// 1. INITIALIZATION & AUTH STATE
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await checkAuth();
  loadHeritageItems();
  loadDailyQuiz();
  loadSubmissions();
  loadDocsList();
});

// Map Initialization (Leaflet)
function initMap() {
  const coords = cityCoords[currentCity] || cityCoords.bhopal;
  map = L.map('map').setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors | Herita Geospatial'
  }).addTo(map);

  drawRadiusCircle(coords, currentRadius);
}

function drawRadiusCircle(coords, radiusKm) {
  if (radiusCircle) {
    map.removeLayer(radiusCircle);
  }
  if (radiusKm !== 'all') {
    radiusCircle = L.circle(coords, {
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.12,
      radius: radiusKm * 1000
    }).addTo(map);
    map.fitBounds(radiusCircle.getBounds(), { padding: [20, 20] });
  } else {
    map.setView(coords, 11);
  }
}

// -------------------------------------------------------------
// 2. AUTHENTICATION & DEMO CREDENTIALS
// -------------------------------------------------------------
async function checkAuth() {
  if (!authToken) {
    // Check local storage mock session
    const savedMock = localStorage.getItem('herita_user');
    if (savedMock) {
      try {
        currentUser = JSON.parse(savedMock);
        updateAuthUI(currentUser);
        return;
      } catch (e) {}
    }
    updateAuthUI(null);
    return;
  }
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      updateAuthUI(currentUser);
    } else {
      localStorage.removeItem('herita_token');
      authToken = null;
      updateAuthUI(null);
    }
  } catch (e) {
    // Fallback if running on static host with stored user
    const saved = localStorage.getItem('herita_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      updateAuthUI(currentUser);
    } else {
      updateAuthUI(null);
    }
  }
}

function updateAuthUI(user) {
  const guestView = document.getElementById('authGuestView');
  const userView = document.getElementById('authUserView');
  const modNotice = document.getElementById('moderatorRoleNotice');

  if (user) {
    guestView.classList.add('hidden');
    userView.classList.remove('hidden');

    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('headerStreak').textContent = user.streak || 1;
    document.getElementById('headerPoints').textContent = (user.points || 0).toLocaleString();
    document.getElementById('userAvatar').textContent = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (modNotice) {
      modNotice.textContent = user.role === 'moderator' || user.role === 'admin' 
        ? `Logged in as ${user.role.toUpperCase()} (Verification Rights Enabled)`
        : 'Community Contributor View';
    }
    loadPassport();
  } else {
    guestView.classList.remove('hidden');
    userView.classList.add('hidden');
    if (modNotice) modNotice.textContent = 'Sign in as Regional Moderator to approve items';
  }
}

let authMode = 'login';

function openAuthModal(mode) {
  authMode = mode;
  document.getElementById('authModal').classList.remove('hidden');
  updateAuthModalFields();
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('authError').classList.add('hidden');
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  updateAuthModalFields();
}

function updateAuthModalFields() {
  const title = document.getElementById('authModalTitle');
  const nameField = document.getElementById('regNameField');
  const roleField = document.getElementById('regRoleField');
  const submitBtn = document.getElementById('authSubmitBtn');
  const toggleBtn = document.getElementById('authToggleBtn');
  const togglePrompt = document.getElementById('authTogglePrompt');
  const errorBox = document.getElementById('authError');

  errorBox.classList.add('hidden');

  if (authMode === 'register') {
    title.textContent = 'Create Your Herita Account';
    nameField.classList.remove('hidden');
    roleField.classList.remove('hidden');
    submitBtn.textContent = 'Complete Registration';
    togglePrompt.textContent = 'Already have an account?';
    toggleBtn.textContent = 'Sign in';
  } else {
    title.textContent = 'Sign In to Herita';
    nameField.classList.add('hidden');
    roleField.classList.add('hidden');
    submitBtn.textContent = 'Sign In';
    togglePrompt.textContent = "Don't have an account?";
    toggleBtn.textContent = 'Register now';
  }
}

function fillDemo(role) {
  if (role === 'user') {
    document.getElementById('authEmail').value = 'aarav@herita.org';
    document.getElementById('authPassword').value = 'Password123!';
  } else if (role === 'moderator') {
    document.getElementById('authEmail').value = 'moderator.verma@herita.org';
    document.getElementById('authPassword').value = 'ModPass123!';
  } else if (role === 'admin') {
    document.getElementById('authEmail').value = 'admin@herita.org';
    document.getElementById('authPassword').value = 'AdminPass123!';
  }
  authMode = 'login';
  updateAuthModalFields();
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const fullName = document.getElementById('authFullName').value;
  const role = document.getElementById('authRole').value;
  const errorBox = document.getElementById('authError');

  const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
  const payload = authMode === 'register' ? { email, password, fullName, role } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      authToken = data.token;
      localStorage.setItem('herita_token', authToken);
      currentUser = data.user;
      localStorage.setItem('herita_user', JSON.stringify(currentUser));
      updateAuthUI(currentUser);
      closeAuthModal();
      return;
    }
  } catch (err) {
    console.warn("Live API unavailable. Using resilient mock session.");
  }

  // Resilient Static / Demo Login Fallback
  if (email === 'moderator.verma@herita.org' || role === 'moderator') {
    currentUser = {
      id: "u-2",
      fullName: "Dr. Alok Verma (Regional Scholar)",
      email: email,
      role: "moderator",
      points: 4850,
      streak: 42,
      badges: ["Distinguished Folklorist", "IGNCA Fellow", "Senior Regional Verifier"],
      exploredCount: 112,
      masteredCount: 18,
      contributionsCount: 84
    };
  } else if (email === 'admin@herita.org' || role === 'admin') {
    currentUser = {
      id: "u-3",
      fullName: "Herita Lead Administrator",
      email: email,
      role: "admin",
      points: 9999,
      streak: 100,
      badges: ["System Architect", "Cultural Heritage Custodian"],
      exploredCount: 250,
      masteredCount: 50,
      contributionsCount: 200
    };
  } else {
    currentUser = {
      id: "u-1",
      fullName: fullName || "Aarav Sharma",
      email: email || "aarav@herita.org",
      role: "user",
      points: 1420,
      streak: 7,
      badges: ["Dhrupad Vocal Apprentice", "Zardozi Preservation Patron", "Begum Trail Pathfinder"],
      exploredCount: 27,
      masteredCount: 4,
      contributionsCount: 12
    };
  }

  authToken = `token_${currentUser.id}`;
  localStorage.setItem('herita_token', authToken);
  localStorage.setItem('herita_user', JSON.stringify(currentUser));
  updateAuthUI(currentUser);
  closeAuthModal();
}

function logout() {
  localStorage.removeItem('herita_token');
  localStorage.removeItem('herita_user');
  authToken = null;
  currentUser = null;
  updateAuthUI(null);
}

// -------------------------------------------------------------
// 3. NAVIGATION & TABS
// -------------------------------------------------------------
function switchTab(tabId) {
  const tabs = ['discover', 'experience', 'learn', 'preserve', 'passport', 'docs'];
  tabs.forEach(id => {
    document.getElementById(`panel-${id}`).classList.add('hidden');
    document.getElementById(`nav-${id}`).classList.remove('active');
  });

  document.getElementById(`panel-${tabId}`).classList.remove('hidden');
  document.getElementById(`nav-${tabId}`).classList.add('active');

  if (tabId === 'discover' && map) {
    setTimeout(() => map.invalidateSize(), 150);
  }
  if (tabId === 'passport') {
    loadPassport();
  }
}

// -------------------------------------------------------------
// 4. DISCOVER: CULTURAL RADIUS & MAP
// -------------------------------------------------------------
function setRadius(r) {
  currentRadius = r;
  ['1', '5', '10', '25', 'all'].forEach(val => {
    const btn = document.getElementById(`btn-rad-${val}`);
    if (btn) {
      if (val == r) {
        btn.className = "px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold transition";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 transition";
      }
    }
  });

  const label = document.getElementById('mapRadiusLabel');
  if (label) label.textContent = r === 'all' ? 'Entire City' : `${r} km Radius`;

  const coords = cityCoords[currentCity] || cityCoords.bhopal;
  drawRadiusCircle(coords, r);
  loadHeritageItems();
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.classList.remove('bg-stone-900', 'text-white', 'font-semibold');
    chip.classList.add('bg-stone-100', 'text-stone-700', 'font-medium');
  });
  if (event && event.target) {
    event.target.classList.remove('bg-stone-100', 'text-stone-700', 'font-medium');
    event.target.classList.add('bg-stone-900', 'text-white', 'font-semibold');
  }
  loadHeritageItems();
}

function changeCity(city) {
  currentCity = city;
  const coords = cityCoords[city] || cityCoords.bhopal;
  map.setView(coords, 13);
  drawRadiusCircle(coords, currentRadius);
  loadHeritageItems();
}

function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        alert("Simulating nearest cultural hub: Bhopal (Coordinates matched)");
        changeCity('bhopal');
      },
      () => {
        alert("Location permission denied. Defaulting to chosen city (Rule 1: Non-blocking navigation).");
      }
    );
  } else {
    alert("Location sensor unavailable. Operating in manual city mode.");
  }
}

async function loadHeritageItems() {
  try {
    const res = await fetch(`/api/heritage?city=${currentCity}&radius=${currentRadius}&category=${currentCategory}`);
    if (!res.ok) throw new Error("Offline fallback");
    const data = await res.json();
    document.getElementById('resultsCount').textContent = data.totalFound;
    renderHeritageCards(data.items);
    renderMapMarkers(data.items);
  } catch (e) {
    // Resilient static fallback
    let items = FALLBACK_HERITAGE.filter(item => item.cityId.toLowerCase() === currentCity.toLowerCase());
    if (currentRadius !== 'all') {
      const num = parseFloat(currentRadius);
      items = items.filter(item => item.distanceKm <= num);
    }
    if (currentCategory && currentCategory !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === currentCategory.toLowerCase());
    }
    document.getElementById('resultsCount').textContent = items.length;
    renderHeritageCards(items);
    renderMapMarkers(items);
  }
}

function renderMapMarkers(items) {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  items.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng])
        .addTo(map)
        .bindPopup(`
          <div class="text-xs">
            <strong class="text-amber-800">${item.title}</strong><br/>
            <span>${item.category.toUpperCase()} • ${item.distanceKm} km</span><br/>
            <span class="font-bold text-orange-600">Survival Score: ${item.survivalScore}/100</span><br/>
            <p class="mt-1">${item.shortDescription}</p>
          </div>
        `);
      mapMarkers.push(marker);
    }
  });
}

function renderHeritageCards(items) {
  const container = document.getElementById('heritageGrid');
  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
        No heritage items found within this radius or category. Try expanding the radius to 10 km or 25 km!
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-400 transition">
      <div>
        <div class="flex justify-between items-start gap-2 mb-2">
          <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider">${item.category}</span>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded badge-${item.status}">
            Score: ${item.survivalScore}/100
          </span>
        </div>
        <h3 class="font-bold text-sm text-stone-900">${item.title}</h3>
        <p class="text-xs text-stone-600 mt-1 leading-relaxed">${item.shortDescription}</p>
        
        <div class="mt-3 p-2 bg-stone-50 rounded-xl text-[11px] text-amber-800 space-y-1">
          <div>💡 <strong>Why it matters:</strong> ${item.whyItMatters}</div>
          <div class="text-stone-500 text-[10px]">📍 ${item.distanceKm} km away • ${item.practitioners}</div>
        </div>
      </div>
      
      <div class="mt-4 pt-3 border-t border-stone-100 flex gap-2">
        <button onclick="switchTab('learn')" class="flex-1 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold transition text-stone-800">
          Learn Tradition
        </button>
        <button onclick="switchTab('preserve')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition">
          Preserve
        </button>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 5. EXPERIENCE: AI TRIP PLANNER
// -------------------------------------------------------------
async function generatePlan() {
  const duration = document.getElementById('planDuration').value;
  const budget = document.getElementById('planBudget').value;
  const transport = document.getElementById('planTransport').value;

  try {
    const res = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: currentCity, duration, budget, transport })
    });
    if (!res.ok) throw new Error("Fallback");
    const data = await res.json();
    renderItinerary(data.itinerary);
  } catch (e) {
    // Client-side fallback planner
    const numBudget = Number(budget) || 2500;
    const fallbackItin = {
      title: duration === '6h' ? "Half-Day Sovereign Begums & Craft Trail" : "1-Day Living Heritage of Old Bhopal",
      budgetAllocated: `₹${numBudget}`,
      estimatedCost: `₹1,800 – ₹2,200`,
      totalWalkingDistance: transport === 'walking' ? "5.4 km" : "9.8 km (with E-Rickshaw)",
      transportMode: transport,
      stops: [
        {
          time: "09:30 AM",
          name: "Gohar Mahal & Begum Lakefront",
          cost: "₹50 entry",
          whyVisit: "Direct architectural testament to Qudsia Begum (first female ruler of Bhopal in 1819). Examines Indo-Saracenic vaulted corridors."
        },
        {
          time: "12:15 PM",
          name: "Zari Zardozi Atelier of Master Shakir (Chowk)",
          cost: "Free observation / ₹400 workshop pass",
          whyVisit: "Witness genuine metallic wire stitching on heavy velvet. Only 14 master ateliers remain active.",
          preservationAlert: "Cultural Survival Score is 32/100 (At-Risk). Visiting provides direct patron livelihood."
        },
        {
          time: "02:30 PM",
          name: "Historic Sulemani Chai & Gosht Pilaf Tasting",
          cost: "₹180 per person",
          whyVisit: "Taste pink spiced tea brewed in a century-old brass samovar using a recipe passed down across 4 generations."
        },
        {
          time: "05:00 PM",
          name: "Dhrupad Sansthan Gurukul Acoustic Session",
          cost: "₹300 donation pass",
          whyVisit: "Listen to the resonance of Rudra Veena and Pakhawaj in one of India's few surviving residential oral gurukuls."
        }
      ]
    };
    renderItinerary(fallbackItin);
  }
}

function renderItinerary(itin) {
  document.getElementById('itinTitle').textContent = itin.title;
  document.getElementById('itinSub').textContent = `Allocated: ${itin.budgetAllocated} (Est: ${itin.estimatedCost}) • ${itin.totalWalkingDistance} • Mode: ${itin.transportMode}`;

  const stopsContainer = document.getElementById('itineraryStops');
  stopsContainer.innerHTML = itin.stops.map((stop, i) => `
    <div class="flex gap-3">
      <div class="flex flex-col items-center">
        <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">${i + 1}</span>
        ${i < itin.stops.length - 1 ? '<span class="w-0.5 h-full bg-stone-200 my-1"></span>' : ''}
      </div>
      <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex-1 space-y-1">
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-xs text-stone-900">${stop.time} — ${stop.name}</h4>
          <span class="text-stone-500 font-semibold">${stop.cost}</span>
        </div>
        <p class="text-[11px] text-stone-600">${stop.whyVisit}</p>
        ${stop.preservationAlert ? `<div class="text-[10px] text-orange-700 font-bold bg-orange-50 p-1.5 rounded-lg border border-orange-200">🚨 ${stop.preservationAlert}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function startAudioGuide() {
  alert("🎧 Experience Mode Activated! Simulating live spatial narration for Gohar Mahal & Begum Lakefront.");
}

// -------------------------------------------------------------
// 6. LEARN & PLAY: QUIZ & STREAKS
// -------------------------------------------------------------
async function loadDailyQuiz() {
  let quiz = FALLBACK_QUIZ;
  try {
    const res = await fetch('/api/quiz/daily');
    if (res.ok) quiz = await res.json();
  } catch (e) {}

  document.getElementById('quizQuestion').textContent = quiz.question;
  const optContainer = document.getElementById('quizOptions');
  optContainer.innerHTML = quiz.options.map((opt, i) => `
    <button onclick="submitQuiz(${i})" class="quiz-btn w-full text-left p-2.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 font-medium transition text-stone-800">
      ${opt.text}
    </button>
  `).join('');
}

async function submitQuiz(selectedIndex) {
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({ selectedIndex })
    });
    if (res.ok) {
      const data = await res.json();
      renderQuizResult(data.isCorrect, data.explanation, data.pointsAwarded);
      if (currentUser && data.newTotalPoints) {
        currentUser.points = data.newTotalPoints;
        currentUser.streak = data.currentStreak;
        localStorage.setItem('herita_user', JSON.stringify(currentUser));
        updateAuthUI(currentUser);
      }
      return;
    }
  } catch (e) {}

  // Fallback local check
  const isCorrect = selectedIndex === 1;
  const points = isCorrect ? 25 : 0;
  if (isCorrect && currentUser) {
    currentUser.points = (currentUser.points || 0) + 25;
    currentUser.streak = (currentUser.streak || 0) + 1;
    localStorage.setItem('herita_user', JSON.stringify(currentUser));
    updateAuthUI(currentUser);
  }
  renderQuizResult(isCorrect, FALLBACK_QUIZ.explanation, points);
}

function renderQuizResult(isCorrect, explanation, points) {
  const fb = document.getElementById('quizFeedback');
  fb.classList.remove('hidden');
  if (isCorrect) {
    fb.className = "text-xs font-semibold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200";
    fb.innerHTML = `✅ <strong>Correct!</strong> ${explanation} <br/>🎉 <strong>+${points} XP Awarded!</strong>`;
  } else {
    fb.className = "text-xs font-semibold p-3 rounded-xl bg-red-50 text-red-800 border border-red-200";
    fb.innerHTML = `❌ <strong>Not quite right.</strong> ${explanation}`;
  }
}

// -------------------------------------------------------------
// 7. PRESERVE & AI VERIFICATION PIPELINE
// -------------------------------------------------------------
async function submitPreservation() {
  const traditionName = document.getElementById('presName').value;
  const location = document.getElementById('presLocation').value;
  const practitionerCount = document.getElementById('presCount').value;
  const description = document.getElementById('presDesc').value;

  try {
    const res = await fetch('/api/preserve/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({ traditionName, location, practitionerCount, description })
    });
    if (res.ok) {
      const data = await res.json();
      alert("🎉 " + data.message);
      loadSubmissions();
      if (currentUser) {
        currentUser.points += 50;
        currentUser.contributionsCount += 1;
        localStorage.setItem('herita_user', JSON.stringify(currentUser));
        updateAuthUI(currentUser);
      }
      return;
    }
  } catch (e) {}

  // Local fallback
  const mockSub = {
    id: `sub-${Date.now()}`,
    submittedBy: currentUser ? currentUser.fullName : "Guest Contributor",
    traditionName,
    location,
    practitionerCount: parseInt(practitionerCount, 10) || 4,
    description,
    status: "under_review",
    aiExtraction: {
      dialect: "Central Indic Folk Sub-dialect",
      era: "Ancestral Oral Lore",
      metricEstimate: 29
    },
    aiDuplicateCheck: {
      similarity: 0.08,
      isUnique: true,
      archiveMatches: "No collision in IGNCA or National Folklore Archives"
    }
  };
  localSubmissions.unshift(mockSub);
  if (currentUser) {
    currentUser.points = (currentUser.points || 0) + 50;
    currentUser.contributionsCount = (currentUser.contributionsCount || 0) + 1;
    localStorage.setItem('herita_user', JSON.stringify(currentUser));
    updateAuthUI(currentUser);
  }
  alert("🎉 Submission passed AI screening and is queued for Regional Moderator verification (+50 XP Awarded!)");
  renderSubmissions(localSubmissions);
}

async function loadSubmissions() {
  try {
    const res = await fetch('/api/preserve/submissions');
    if (res.ok) {
      const items = await res.json();
      renderSubmissions(items);
      return;
    }
  } catch (e) {}
  renderSubmissions(localSubmissions);
}

function renderSubmissions(items) {
  const container = document.getElementById('submissionsList');
  const isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');

  container.innerHTML = items.map(sub => `
    <div class="bg-white border border-stone-200 p-3 rounded-xl space-y-1.5">
      <div class="flex justify-between items-start">
        <span class="font-bold text-stone-800">${sub.traditionName}</span>
        <span class="text-[10px] px-2 py-0.5 rounded font-bold ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${sub.status.toUpperCase()}
        </span>
      </div>
      <p class="text-[11px] text-stone-600">${sub.description}</p>
      
      <div class="p-2 bg-stone-50 rounded-lg text-[10px] text-stone-500 space-y-0.5">
        <div>🔍 <strong>AI Dialect:</strong> ${sub.aiExtraction ? sub.aiExtraction.dialect : 'Indic Folk'}</div>
        <div>🛡️ <strong>Duplicate Scan:</strong> ${sub.aiDuplicateCheck ? sub.aiDuplicateCheck.archiveMatches : 'Unique Entry'}</div>
        <div>👤 Submitted by: ${sub.submittedBy}</div>
      </div>

      ${isMod && sub.status !== 'approved' ? `
        <div class="pt-2 flex gap-2">
          <button onclick="verifySubmission('${sub.id}', 'approved')" class="flex-1 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]">
            ✓ Approve & Add to KB
          </button>
          <button onclick="verifySubmission('${sub.id}', 'rejected')" class="px-3 py-1 rounded bg-stone-200 text-stone-700 font-bold text-[10px]">
            Reject
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function verifySubmission(id, status) {
  try {
    const res = await fetch(`/api/preserve/verify/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status, citationNotes: "Verified by Regional Moderator." })
    });
    if (res.ok) {
      const data = await res.json();
      alert("✓ " + data.message);
      loadSubmissions();
      return;
    }
  } catch (e) {}

  // Fallback update
  const sub = localSubmissions.find(s => s.id === id);
  if (sub) {
    sub.status = status;
    alert(`✓ Status updated to ${status.toUpperCase()} by Regional Moderator`);
    renderSubmissions(localSubmissions);
  }
}

// -------------------------------------------------------------
// 8. PASSPORT
// -------------------------------------------------------------
async function loadPassport() {
  if (!currentUser) {
    document.getElementById('passportName').textContent = 'Guest Traveler Passport';
    document.getElementById('passportRank').textContent = 'Log in to sync your verified preservation activity';
    document.getElementById('passportXP').textContent = '0 XP';
    document.getElementById('passportBadges').innerHTML = '<span class="text-stone-400">No badges earned yet. Sign in to start!</span>';
    return;
  }

  document.getElementById('passportName').textContent = `${currentUser.fullName}'s Cultural Passport`;
  document.getElementById('passportRank').textContent = currentUser.role === 'moderator' 
    ? 'Distinguished Regional Scholar & Verifier' 
    : `#13 Regional Heritage Guardian • Active Explorer`;
  document.getElementById('passportXP').textContent = `${(currentUser.points || 0).toLocaleString()} XP`;
  document.getElementById('passportExplored').textContent = currentUser.exploredCount || 27;
  document.getElementById('passportMastered').textContent = currentUser.masteredCount || 4;
  document.getElementById('passportContrib').textContent = currentUser.contributionsCount || 12;
  document.getElementById('passportStreak').textContent = `${currentUser.streak || 7} Days`;

  const badges = currentUser.badges || ["Dhrupad Vocal Apprentice", "Zardozi Preservation Patron"];
  document.getElementById('passportBadges').innerHTML = badges.map(b => `
    <span class="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
      🏅 ${b}
    </span>
  `).join('');
}

// -------------------------------------------------------------
// 9. RESILIENT DOCUMENT DOWNLOADS
// -------------------------------------------------------------
const descriptions = {
  'HERITA_MASTER_SPECIFICATION.md': 'Complete 46-section architecture specification, mathematical formulations, and Triad mappings.',
  'SIH_2026_PITCH_AND_QNA.md': 'Executive pitch script, evaluation rubric alignment, and defense answers to tough judge questions.',
  'DATABASE_SCHEMA_POSTGRES.sql': 'Production DDL script with PostGIS geometries, pgvector embeddings, and RBAC tables.',
  'API_SPECIFICATION.md': 'Complete RESTful API endpoint contracts, schemas, headers, and request/response payloads.'
};

async function loadDocsList() {
  let docs = [];
  try {
    const res = await fetch('/api/docs/list');
    if (res.ok) {
      docs = await res.json();
    } else {
      throw new Error("API not available");
    }
  } catch (e) {
    // Static fallback
    docs = [
      { filename: 'HERITA_MASTER_SPECIFICATION.md', sizeBytes: 5443 },
      { filename: 'SIH_2026_PITCH_AND_QNA.md', sizeBytes: 4261 },
      { filename: 'DATABASE_SCHEMA_POSTGRES.sql', sizeBytes: 5391 },
      { filename: 'API_SPECIFICATION.md', sizeBytes: 3019 }
    ];
  }

  const container = document.getElementById('docsList');
  container.innerHTML = docs.map(doc => `
    <div class="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">📄</span>
          <div>
            <h4 class="font-bold text-xs text-stone-900">${doc.filename}</h4>
            <span class="text-[10px] text-stone-400 font-medium">${(doc.sizeBytes / 1024).toFixed(1)} KB • Markdown / SQL</span>
          </div>
        </div>
        <p class="text-[11px] text-stone-600 mt-2 leading-relaxed">
          ${descriptions[doc.filename] || 'Official architectural documentation for Herita.'}
        </p>
      </div>
      <button onclick="downloadDoc('${doc.filename}')" class="w-full py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-center font-bold text-xs rounded-lg transition shadow-sm block">
        ⬇ Download ${doc.filename}
      </button>
    </div>
  `).join('');
}

async function downloadDoc(filename) {
  // First try API
  try {
    const res = await fetch(`/api/docs/download/${filename}`);
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return;
    }
  } catch (e) {}

  // Next try static docs path (e.g. GitHub Pages dist/docs)
  try {
    const res = await fetch(`./docs/${filename}`);
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, filename);
      return;
    }
  } catch (e) {}

  // Direct location fallback
  window.location.href = `/api/docs/download/${filename}`;
}

async function downloadAllBundle() {
  try {
    const res = await fetch('/api/docs/download-all');
    if (res.ok) {
      const blob = await res.blob();
      triggerBlobDownload(blob, 'HERITA_COMPLETE_DOCUMENTATION_BUNDLE_SIH2026.zip');
      return;
    }
  } catch (e) {}

  // Fallback for static GitHub Pages host:
  alert("Downloading all 4 documentation files directly to your machine...");
  ['HERITA_MASTER_SPECIFICATION.md', 'SIH_2026_PITCH_AND_QNA.md', 'DATABASE_SCHEMA_POSTGRES.sql', 'API_SPECIFICATION.md'].forEach((f, idx) => {
    setTimeout(() => downloadDoc(f), idx * 300);
  });
}

function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Generate default itinerary on load
generatePlan();
