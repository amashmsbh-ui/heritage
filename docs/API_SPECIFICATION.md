# HERITA — RESTful API Specification (v1.0)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user profile.
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Sharma",
    "email": "aarav@herita.org",
    "password": "Password123!",
    "role": "user"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "token": "herita_token_...",
    "user": {
      "id": "uuid...",
      "fullName": "Aarav Sharma",
      "email": "aarav@herita.org",
      "role": "user",
      "points": 100,
      "streak": 1
    }
  }
  ```

### `POST /api/auth/login`
Authenticates a user and issues an authorization token.
- **Request Body**:
  ```json
  {
    "email": "aarav@herita.org",
    "password": "Password123!"
  }
  ```

### `GET /api/auth/me`
Retrieves currently authenticated session and passport summary.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Cultural Hub & Discovery Endpoints

### `GET /api/heritage`
Filters heritage items by city, radius, and category.
- **Query Params**:
  - `city` (string, e.g. `bhopal`)
  - `radius` (number, e.g. `5` or `all`)
  - `category` (string, optional: `music`, `literature`, `history`, `craft`, `people`, `game`, `food`)
  - `status` (string, optional: `at_risk`, `thriving`)

### `GET /api/traditions/:id`
Retrieves deep-dive data on a specific tradition including its 6-factor Cultural Survival Score breakdown and learning lessons.

---

## 3. Experience & AI Trip Planner Endpoints

### `POST /api/planner/generate`
Generates a culturally grounded itinerary with hard budget and duration clipping.
- **Request Body**:
  ```json
  {
    "city": "bhopal",
    "duration": "1d",
    "budget": 2500,
    "transport": "walking",
    "interests": ["history", "craft", "music"]
  }
  ```
- **Response**: Returns structured timeline stops, estimated costs, walking directions, and "Why You Should Visit" cultural rationale.

---

## 4. Preservation & AI Verification Endpoints

### `POST /api/preserve/submit`
Submits an endangered cultural practice or oral tradition to the AI verification pipeline.
- **Request Body**:
  ```json
  {
    "traditionName": "Bagheli Folk Lore",
    "location": "Bhopal tribal periphery",
    "practitionerCount": 5,
    "description": "Ancestral storytelling of monsoon deities..."
  }
  ```
- **Response**: Triggers AI multimodal extraction, vector duplicate scan, and assigns to Regional Moderator queue.

### `GET /api/preserve/submissions`
Lists pending or reviewed submissions (Moderator/Admin role access).

### `POST /api/preserve/verify/:id`
Allows Regional Moderators to review, approve/reject, and adjust the tradition's Cultural Survival Score.

---

## 5. Documentation Download Endpoints

### `GET /api/docs/list`
Lists all available master architecture and pitch files.

### `GET /api/docs/download/:filename`
Downloads a single markdown/SQL architectural document.

### `GET /api/docs/download-all`
Packages the entire documentation bundle into a single downloadable `.zip` archive.
