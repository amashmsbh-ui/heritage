# HERITA — Living Cultural Heritage Platform
**Smart India Hackathon (SIH 2026) | Full-Stack Working Prototype**

Herita is an AI-powered cultural heritage ecosystem structured around three core actions:
$$\mathbf{DISCOVER} \longrightarrow \mathbf{EXPERIENCE} \longrightarrow \mathbf{PRESERVE}$$

---

## 🌐 Instant Web Deployment Options

The project is pre-configured for automated deployment across multiple cloud providers and GitHub Actions.

### Option 1: GitHub Pages (Automatic via GitHub Action)
The repository includes a ready-to-run GitHub Action workflow: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

1. Push this repository to GitHub:
   ```powershell
   git remote add origin https://github.com/<your-username>/herita.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The workflow will automatically test and deploy your site to:
   👉 `https://<your-username>.github.io/herita/`
   *(Includes intelligent client-side fallbacks so all features, maps, quizzes, and passport stats operate seamlessly even on static hosts!)*

---

### Option 2: Vercel (Recommended for Full-Stack Serverless)
Pre-configured with [`vercel.json`](./vercel.json) and [`api/index.js`](./api/index.js).

1. Install Vercel CLI (or connect via github.com/vercel):
   ```powershell
   npx vercel
   ```
2. Follow the 2 prompts. Your full-stack Express API and client will be deployed live with an instant SSL domain:
   👉 `https://herita.vercel.app`

---

### Option 3: Render (Free Web Service with Full Node.js Runtime)
Pre-configured with [`render.yaml`](./render.yaml).

1. Push to GitHub.
2. Go to [render.com](https://render.com) > **New** > **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and launches your service:
   👉 `https://herita.onrender.com`

---

### Option 4: Instant Public URL from Your Current Machine (5 Seconds)
If you want to share a live public link with judges or team members right now without pushing to GitHub:
```powershell
npx localtunnel --port 3000
```
This gives you an instant public HTTPS URL like `https://funny-bhopal-herita.loca.lt` forwarding directly to your running server!

---

## 💻 Running Locally

```powershell
cd C:\Users\Mishthi\.gemini\antigravity\scratch\herita
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👤 Pre-Configured Demo Credentials

Use the **⚡ Quick Demo One-Click Fill** buttons on the sign-in modal or:

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Regular Explorer** | `aarav@herita.org` | `Password123!` | Explore radius, take daily quizzes, earn streak XP, submit preservation reports, view Heritage Passport. |
| **Regional Moderator** | `moderator.verma@herita.org` | `ModPass123!` | All user features + Review and approve AI-flagged preservation submissions + add scholarly citations. |
| **Administrator** | `admin@herita.org` | `AdminPass123!` | Full system access, analytics, and user role configuration. |

---

## 📦 Documentation Download Center

All official SIH blueprints, schemas, and pitch decks are stored in [`docs/`](./docs) and can be downloaded via the web UI or REST API:

1. **[HERITA_MASTER_SPECIFICATION.md](./docs/HERITA_MASTER_SPECIFICATION.md)**: 46-section architecture specification, mathematical models for the Cultural Survival Score, and Triad mappings.
2. **[SIH_2026_PITCH_AND_QNA.md](./docs/SIH_2026_PITCH_AND_QNA.md)**: 30-second elevator pitch, SIH evaluation rubric alignment, and defense answers to tough judge questions.
3. **[DATABASE_SCHEMA_POSTGRES.sql](./docs/DATABASE_SCHEMA_POSTGRES.sql)**: Production DDL schema with PostGIS spatial indexing, pgvector semantic similarity, and RBAC tables.
4. **[API_SPECIFICATION.md](./docs/API_SPECIFICATION.md)**: Full RESTful API documentation with payloads and response formats.

👉 **Download All as ZIP**: Click *"Download All Docs (.ZIP Package)"* in the app or call `GET http://localhost:3000/api/docs/download-all`.
