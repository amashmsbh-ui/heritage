const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'database.json');

// Password hashing utility using Node.js built-in crypto (pbkdf2)
function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// Initial seed data
const initialData = {
  users: [
    {
      id: "u-1",
      email: "aarav@herita.org",
      fullName: "Aarav Sharma",
      role: "user",
      points: 1420,
      streak: 7,
      badges: ["Dhrupad Vocal Apprentice", "Zardozi Preservation Patron", "Begum Trail Pathfinder"],
      exploredCount: 27,
      masteredCount: 4,
      contributionsCount: 12,
      ...hashPassword("Password123!", "user_salt_123")
    },
    {
      id: "u-2",
      email: "moderator.verma@herita.org",
      fullName: "Dr. Alok Verma (Regional Scholar)",
      role: "moderator",
      points: 4850,
      streak: 42,
      badges: ["Distinguished Folklorist", "IGNCA Fellow", "Senior Regional Verifier"],
      exploredCount: 112,
      masteredCount: 18,
      contributionsCount: 84,
      ...hashPassword("ModPass123!", "mod_salt_456")
    },
    {
      id: "u-3",
      email: "admin@herita.org",
      fullName: "Herita Lead Administrator",
      role: "admin",
      points: 9999,
      streak: 100,
      badges: ["System Architect", "Cultural Heritage Custodian"],
      exploredCount: 250,
      masteredCount: 50,
      contributionsCount: 200,
      ...hashPassword("AdminPass123!", "admin_salt_789")
    }
  ],
  cities: [
    { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
    { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
    { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 }
  ],
  heritageItems: [
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
      whyItMatters: "Direct living link to Vedic chanting and Mughal court patronage. Bhopal's Dhrupad Sansthan is one of the last residential gurukuls in the world.",
      sources: ["Dhrupad Sansthan Archives", "Sangeet Natak Akademi", "MP Cultural Department"]
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
      whyItMatters: "A fading legacy of female rulers. Rapid synthetic machine replicas threaten the economic survival of authentic hand-craft masters.",
      sources: ["MP Craft Council", "Craft Economics Field Survey 2025"]
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
      whyItMatters: "Symbolizes 107 years of sovereign women's rule in central India.",
      sources: ["Archaeological Survey of India (ASI)", "Bhopal Heritage Register"]
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
      whyItMatters: "Tribal wisdom embodying ecological stewardship and centuries of oral transmission.",
      sources: ["Indira Gandhi Rashtriya Manav Sangrahalaya (IGRMS)", "Tribal Research Institute"]
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
      whyItMatters: "Fosters community bonding and physical resilience without expensive athletic gear.",
      sources: ["Madhya Pradesh Folk Sports Documentation"]
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
      whyItMatters: "Culinary heritage passed down through family-run tea stalls for 5 generations.",
      sources: ["Oral Culinary Histories of Old Bhopal"]
    },
    {
      id: "h-7",
      cityId: "bhopal",
      title: "Ustad Abdul Latif Khan Sarangi Heritage",
      category: "people",
      distanceKm: 4.1,
      lat: 23.2510,
      lng: 77.4110,
      origin: "20th Century Musical Lineage",
      practitioners: "2 surviving direct disciples",
      survivalScore: 28,
      status: "critical",
      shortDescription: "The vocal-emulating sarangi tradition perfected by Padma Shri Ustad Abdul Latif Khan.",
      whyItMatters: "The acoustic bow technique of this lineage is on the verge of extinction with only 2 living disciples.",
      sources: ["All India Radio Archives", "Bhopal Sangeet Samaj"]
    }
  ],
  traditions: [
    {
      id: "t-1",
      name: "Bhopali Zardozi Embroidery",
      category: "craft",
      score: 32,
      status: "at_risk",
      indicators: {
        practitionerDensity: { label: "Active Masters (14 left)", value: 22, max: 100 },
        ageDemographics: { label: "Median Age (61 yrs)", value: 15, max: 100 },
        youthTransmission: { label: "Youth Apprentices (3 enrolled)", value: 18, max: 100 },
        practiceFrequency: { label: "Monthly Output (Orders)", value: 35, max: 100 },
        documentation: { label: "Recorded Video & Technique", value: 65, max: 100 },
        economicDemand: { label: "Living Wage Sustainability", value: 38, max: 100 }
      },
      lessons: [
        { step: 1, title: "Setting the Adda (Embroidery Frame)", desc: "Tightly stretch velvet or silk over a heavy wooden loom frame with uniform tension." },
        { step: 2, title: "Preparing the Metallic Kalabattu", desc: "Twist silver and gold-gilt threads around silk cores for flexibility." },
        { step: 3, title: "The Aari Hook Stitch", desc: "Execute reverse-needle chain stitches guiding metal thread from underneath the fabric." }
      ]
    }
  ],
  dailyQuiz: {
    question: "Which musical instrument is traditionally paired with the Rudra Veena in ancient Dhrupad performances?",
    options: [
      { text: "A) Sitar", isCorrect: false },
      { text: "B) Pakhawaj (Barrel-shaped drum)", isCorrect: true },
      { text: "C) Tabla", isCorrect: false },
      { text: "D) Shehnai", isCorrect: false }
    ],
    explanation: "Dhrupad is accompanied by the heavy, acoustic resonance of the Pakhawaj (Mrudang), rather than the modern tabla."
  },
  submissions: [
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
      },
      createdAt: new Date().toISOString()
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readDb,
  writeDb,
  hashPassword,
  verifyPassword
};
