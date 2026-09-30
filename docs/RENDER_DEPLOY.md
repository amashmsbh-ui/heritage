# 🚀 Deploying Herita on Render

> **Stack:** Node.js · Express · JSON file-based DB (`database.json`)  
> **Render plan:** Free Web Service (512 MB RAM, auto-sleep after 15 min inactivity)

---

## Prerequisites

- [ ] A free [Render account](https://render.com)
- [ ] The `heritage` repo pushed to **your** GitHub fork (`origin`) — the one Render will read from
- [ ] `package.json` has a `"start"` script (or Render can use the default `node server.js`)

---

## Step 1 — Make sure `package.json` has a start script

Open `package.json` and confirm it looks like this:

```json
"scripts": {
  "start": "node server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

If the `"start"` key is missing, add it, commit, and push to `origin/main`.

---

## Step 2 — Push the latest code to your fork

```bash
# From the heritage/ directory
git add .
git commit -m "chore: prepare for Render deploy"
git push origin main
```

---

## Step 3 — Create a new Web Service on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com)
2. Click **New ▸ Web Service**
3. Connect your GitHub account if not already connected
4. Select your fork: **`amashmsbh-ui/heritage`** (or whatever your fork is named)
5. Click **Connect**

---

## Step 4 — Configure the service

| Field | Value |
|---|---|
| **Name** | `herita` (or any name you like) |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | *(leave blank — the repo root)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

> **Plan** — the free plan works fine for demos and SIH judging. It auto-sleeps after 15 minutes of no traffic (first request after sleep takes ~30 s to wake up).

---

## Step 5 — Set Environment Variables

Click **Advanced ▸ Add Environment Variable** and add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | *(leave blank — Render injects this automatically)* |

> ⚠️ Do **NOT** hard-code a `PORT` value. Render sets it automatically via `process.env.PORT`. The server already reads it correctly: `const PORT = process.env.PORT || 3000;`

---

## Step 6 — Deploy

Click **Create Web Service**. Render will:

1. Clone your repo
2. Run `npm install`
3. Run `npm start`

Watch the **Logs** tab — a successful start looks like:

```
=======================================================
🏛️  HERITA Full-Stack Server Running on http://localhost:XXXXX
📚 Documentation Download API ready at /api/docs/download-all
👤 Seed Credentials ready for User, Moderator, and Admin
=======================================================
```

Your live URL will be:
```
https://herita.onrender.com   (or whatever name you chose)
```

---

## Step 7 — Verify the deployment

Hit these endpoints in your browser or with curl:

```bash
# Health check — should return heritage items JSON
curl https://herita.onrender.com/api/heritage

# Auth — login with seed credentials
curl -X POST https://herita.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aarav@herita.org","password":"Password123!"}'

# Traditions list
curl https://herita.onrender.com/api/traditions
```

---

## ⚠️ Known Gotcha — File-Based DB on Render

Render's filesystem **is ephemeral** on the free plan — it resets on every deploy or restart.

| Situation | What happens |
|---|---|
| Server restarts (auto-sleep/wake) | `database.json` is **reset** to seed data — any user registrations or submissions are lost |
| New deploy | Same as above |

### Options to persist data

| Option | Effort | Notes |
|---|---|---|
| **Keep as-is** | Zero | Fine for demos/judging where you reset data each time |
| **Render Disk** (paid, $0.25/GB/mo) | Low | Add a 1 GB persistent disk at `/var/data`, point `DB_FILE` there via `DATABASE_PATH` env var |
| **PostgreSQL** | Medium | Render offers a free managed Postgres instance — the project already has `pg` in `dependencies` and a `DATABASE_SCHEMA_POSTGRES.sql` ready to use |

---

## Seed Credentials (for judges / testing)

| Role | Email | Password |
|---|---|---|
| User | `aarav@herita.org` | `Password123!` |
| Moderator | `moderator.verma@herita.org` | `ModPass123!` |
| Admin | `admin@herita.org` | `AdminPass123!` |

---

## Auto-Deploy on Push

By default Render auto-deploys every time you push to `main`. To disable, go to your service → **Settings ▸ Auto-Deploy ▸ Off**.

---

## Useful Links

- [Render Node.js docs](https://render.com/docs/deploy-node-express-app)
- [Render environment variables](https://render.com/docs/environment-variables)
- [Render free plan limits](https://render.com/docs/free#free-web-services)
- [render.yaml reference](https://render.com/docs/blueprint-spec) *(already in repo root)*
