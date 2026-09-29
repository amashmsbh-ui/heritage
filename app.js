// ==============================================================================
// HERITA Frontend Application Logic (SIH 2026)
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
    console.error(e);
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
    const data = await res.json();
    if (!res.ok) {
      errorBox.textContent = data.error || 'Authentication failed';
      errorBox.classList.remove('hidden');
      return;
    }

    authToken = data.token;
    localStorage.setItem('herita_token', authToken);
    currentUser = data.user;
    updateAuthUI(currentUser);
    closeAuthModal();
  } catch (err) {
    errorBox.textContent = 'Network or server error';
    errorBox.classList.remove('hidden');
  }
}

function logout() {
  localStorage.removeItem('herita_token');
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
  }
}

async function loadHeritageItems() {
  try {
    const res = await fetch(`/api/heritage?city=${currentCity}&radius=${currentRadius}&category=${currentCategory}`);
    const data = await res.json();
    
    document.getElementById('resultsCount').textContent = data.totalFound;
    renderHeritageCards(data.items);
    renderMapMarkers(data.items);
  } catch (e) {
    console.error(e);
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
    const data = await res.json();
    const itin = data.itinerary;

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
  } catch (e) {
    console.error(e);
  }
}

function startAudioGuide() {
  alert("🎧 Experience Mode Activated! Simulating live spatial narration for Gohar Mahal & Begum Lakefront.");
}

// -------------------------------------------------------------
// 6. LEARN & PLAY: QUIZ & STREAKS
// -------------------------------------------------------------
let dailyQuizData = null;

async function loadDailyQuiz() {
  try {
    const res = await fetch('/api/quiz/daily');
    dailyQuizData = await res.json();
    document.getElementById('quizQuestion').textContent = dailyQuizData.question;

    const optContainer = document.getElementById('quizOptions');
    optContainer.innerHTML = dailyQuizData.options.map((opt, i) => `
      <button onclick="submitQuiz(${i})" class="quiz-btn w-full text-left p-2.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100 font-medium transition text-stone-800">
        ${opt.text}
      </button>
    `).join('');
  } catch (e) {
    console.error(e);
  }
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
    const data = await res.json();
    const fb = document.getElementById('quizFeedback');
    fb.classList.remove('hidden');

    if (data.isCorrect) {
      fb.className = "text-xs font-semibold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200";
      fb.innerHTML = `✅ <strong>Correct!</strong> ${data.explanation} <br/>🎉 <strong>+${data.pointsAwarded} XP Awarded!</strong>`;
      if (currentUser && data.newTotalPoints) {
        currentUser.points = data.newTotalPoints;
        currentUser.streak = data.currentStreak;
        updateAuthUI(currentUser);
      }
    } else {
      fb.className = "text-xs font-semibold p-3 rounded-xl bg-red-50 text-red-800 border border-red-200";
      fb.innerHTML = `❌ <strong>Not quite right.</strong> ${data.explanation}`;
    }
  } catch (e) {
    console.error(e);
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
    const data = await res.json();
    alert("🎉 " + data.message);
    loadSubmissions();
    if (currentUser) {
      currentUser.points += 50;
      currentUser.contributionsCount += 1;
      updateAuthUI(currentUser);
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadSubmissions() {
  try {
    const res = await fetch('/api/preserve/submissions');
    const items = await res.json();
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
          <div>🔍 <strong>AI Dialect:</strong> ${sub.aiExtraction.dialect}</div>
          <div>🛡️ <strong>Duplicate Scan:</strong> ${sub.aiDuplicateCheck.archiveMatches}</div>
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
  } catch (e) {
    console.error(e);
  }
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
    const data = await res.json();
    alert("✓ " + data.message);
    loadSubmissions();
  } catch (e) {
    console.error(e);
  }
}

// -------------------------------------------------------------
// 8. PASSPORT
// -------------------------------------------------------------
async function loadPassport() {
  if (!authToken) {
    document.getElementById('passportName').textContent = 'Guest Traveler Passport';
    document.getElementById('passportRank').textContent = 'Log in to sync your verified preservation activity';
    document.getElementById('passportXP').textContent = '0 XP';
    document.getElementById('passportBadges').innerHTML = '<span class="text-stone-400">No badges earned yet. Sign in to start!</span>';
    return;
  }

  try {
    const res = await fetch('/api/passport', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const p = data.passport;

    document.getElementById('passportName').textContent = `${p.fullName}'s Cultural Passport`;
    document.getElementById('passportRank').textContent = p.culturalRank;
    document.getElementById('passportXP').textContent = `${p.points.toLocaleString()} XP`;
    document.getElementById('passportExplored').textContent = p.placesExplored;
    document.getElementById('passportMastered').textContent = p.traditionsMastered;
    document.getElementById('passportContrib').textContent = p.verifiedContributions;
    document.getElementById('passportStreak').textContent = `${p.streak} Days`;

    const badgeContainer = document.getElementById('passportBadges');
    badgeContainer.innerHTML = p.badges.map(b => `
      <span class="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
        🏅 ${b}
      </span>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// -------------------------------------------------------------
// 9. DOCUMENT DOWNLOADS
// -------------------------------------------------------------
async function loadDocsList() {
  try {
    const res = await fetch('/api/docs/list');
    const docs = await res.json();
    const container = document.getElementById('docsList');

    const descriptions = {
      'HERITA_MASTER_SPECIFICATION.md': 'Complete 46-section architecture specification, mathematical formulations, and Triad mappings.',
      'SIH_2026_PITCH_AND_QNA.md': 'Executive pitch script, evaluation rubric alignment, and defense answers to tough judge questions.',
      'DATABASE_SCHEMA_POSTGRES.sql': 'Production DDL script with PostGIS geometries, pgvector embeddings, and RBAC tables.',
      'API_SPECIFICATION.md': 'Complete RESTful API endpoint contracts, schemas, headers, and request/response payloads.'
    };

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
        <a href="/api/docs/download/${doc.filename}" download class="w-full py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-center font-bold text-xs rounded-lg transition shadow-sm block">
          ⬇ Download ${doc.filename}
        </a>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// Initialize default plan on load
generatePlan();
