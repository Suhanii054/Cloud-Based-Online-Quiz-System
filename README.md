# ☁️ Cloud-Based AI Quiz System

> A serverless, multi-cloud quiz platform powered by **Gemini AI**, **AWS DynamoDB**, and **Firebase** — built for the Cloud Computing curriculum.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth+Firestore-FFCA28?style=flat-square&logo=firebase)
![AWS](https://img.shields.io/badge/AWS-DynamoDB-FF9900?style=flat-square&logo=amazonaws)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=flat-square&logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

- 🤖 **AI Quiz Generation** — type any topic, Gemini generates 10 MCQs instantly
- ☁️ **Live Cloud Activity Panel** — watch every cloud operation happen in real time
- 🏆 **Global Leaderboard** — real-time rankings fetched from Firebase Firestore
- ⏱️ **30-Second Timer** — auto-advances on timeout
- 🎯 **Balanced Difficulty** — always 4 Easy + 4 Medium + 2 Hard questions
- 🔐 **Firebase Authentication** — secure email/password login with session persistence
- 📊 **Score Persistence** — best score and attempts synced to cloud
- 🌍 **Multi-Cloud Architecture** — spans AWS (us-east-1) and Google Cloud

---

## 🏗️ Architecture

```
Browser (React SPA)
        │
        ├── Firebase Auth ──────────► Google Cloud (Authentication)
        ├── Firebase Firestore ─────► Google Cloud (User profiles, scores)
        └── AWS DynamoDB SDK ───────► AWS us-east-1 (Quiz questions)
                                           │
                                    Google Gemini API
                                    (Dynamic quiz generation)
```

No backend server. The frontend talks directly to all three cloud services via official SDKs.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | SPA, component architecture |
| Styling | Tailwind CSS 3 | Dark neon theme, responsive |
| Auth | Firebase Authentication | Login, signup, session |
| User Data | Firebase Firestore | Profiles, scores, leaderboard |
| Quiz Data | AWS DynamoDB | 30 questions, scalable reads |
| AI | Google Gemini 1.5 Flash | Dynamic quiz generation |
| Routing | React Router DOM v7 | Protected routes, navigation |

---

## 📁 Project Structure

```
cloud-quiz/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                # Top nav with avatar + sign out
│   │   └── CloudActivityPanel.jsx   # ☁️ Live cloud operations log
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state via Firebase
│   ├── pages/
│   │   ├── Login.jsx                # Firebase sign in
│   │   ├── Signup.jsx               # Firebase sign up + Firestore profile
│   │   ├── Home.jsx                 # Dashboard with real stats
│   │   ├── Quiz.jsx                 # DynamoDB questions + timer + scoring
│   │   ├── Results.jsx              # Score display + Firestore update
│   │   ├── Leaderboard.jsx          # Real-time Firestore rankings
│   │   └── Profile.jsx              # User stats + global rank
│   ├── utils/
│   │   └── fetchQuestions.js        # DynamoDB scan + Fisher-Yates shuffle
│   ├── firebase.js                  # Firebase app init
│   └── App.jsx                      # Routes + ProtectedRoute guards
├── seed.js                          # One-time DynamoDB seeding script
├── tailwind.config.js               # Custom dark neon theme
├── .env.example                     # Environment variable template
└── .env                             # Your keys (never commit this)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- AWS account (free tier)
- Firebase project (free Spark plan)
- Google AI Studio account (free)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cloud-quiz.git
cd cloud-quiz
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env` — see [Environment Variables](#-environment-variables) below.

### 4. Seed DynamoDB with questions

> Run this **once** to populate your DynamoDB `questions` table with 30 questions.

```bash
node seed.js
```

You should see `Successfully seeded 30 questions` in the terminal.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

### Firebase (console.firebase.google.com)
Go to **Project Settings → Your apps → SDK setup → Config**

### AWS DynamoDB (console.aws.amazon.com)
Go to **IAM → Users → Create user → Attach policy: AmazonDynamoDBFullAccess → Create access key**

Make sure your DynamoDB table is in `us-east-1` (or update `VITE_AWS_REGION` accordingly).

### Google Gemini (aistudio.google.com)
Go to **Get API key → Create API key**

---

## ☁️ Cloud Services Setup

### Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Email/Password**
4. Create a **Firestore Database** (start in test mode)
5. Copy config to `.env`

### AWS DynamoDB Setup
1. Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Navigate to **DynamoDB → Tables → Create table**
3. Table name: `questions`, Partition key: `questionId` (String)
4. Leave all other settings as default → Create
5. Run `node seed.js` to populate

### Firestore Security Rules (recommended)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 📊 Database Schema

### AWS DynamoDB — `questions` table

| Attribute | Type | Description |
|---|---|---|
| `questionId` | String (UUID) | Partition key |
| `questionText` | String | The question |
| `options` | List | 4 answer choices |
| `correctIndex` | Number | Index of correct answer (0-3) |
| `difficulty` | String | `easy` \| `medium` \| `hard` |
| `category` | String | `general` \| `science` \| `math` \| `history` |
| `explanation` | String | Shown after answering |

### Firebase Firestore — `users` collection

| Field | Type | Description |
|---|---|---|
| `username` | String | Display name |
| `email` | String | Auth email |
| `bestScore` | Number | Highest quiz score |
| `totalAttempts` | Number | Total quizzes taken |
| `createdAt` | Timestamp | Account creation time |

---

## ☁️ Cloud Activity Panel

A standout feature — every page shows a live panel logging cloud operations as they happen:

```
☁️ Cloud Activity                              🟢 Live
──────────────────────────────────────────────────────
✅ Connecting to AWS DynamoDB...          +0ms
✅ Connected to AWS us-east-1 (408ms)     +408ms
✅ Fetching questions from DynamoDB...    +810ms
✅ 30 questions retrieved from cloud      +1359ms
✅ Selecting 10 balanced questions...     +1759ms
✅ Quiz ready — 10 questions loaded       +2162ms
```

This demonstrates cloud observability — similar to what AWS CloudWatch provides in production systems.

---

## 🎓 Cloud Computing Concepts Covered

| Concept | Implementation |
|---|---|
| Serverless Architecture | No backend — all managed services |
| Managed Database Services | DynamoDB + Firestore, zero ops |
| Identity as a Service | Firebase Authentication |
| Auto Scaling | Both databases scale automatically |
| Pay-Per-Use | AWS free tier + Firebase Spark plan |
| Multi-Cloud | AWS (us-east-1) + Google Cloud |
| Cloud Monitoring | Live CloudActivity panel |
| Regional Deployment | DynamoDB in AWS us-east-1 |

---

## 📸 Screenshots

> Add screenshots of your app here after deployment

| Home Dashboard | Quiz in Progress | Leaderboard |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## 🤝 Contributing

This is an academic project. Feel free to fork and extend it.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.