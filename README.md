```markdown
# 📍 Community Lost & Found Board

A modern, high-performance digital board built for campus communities to report and claim lost items. This project features a real-time "Hacker" aesthetic UI, optimized for speed and community utility.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (via Vite)
- **Styling:** Tailwind CSS v4 (Modern Plugin Architecture)
- **Database:** Firebase Cloud Firestore (NoSQL)
- **Deployment:** Firebase Hosting
- **CI/CD:** GitHub Actions (Automated Deployment Workflows)

---

## ✨ Features

- **Real-time Synchronization:** Items appear on the board instantly as they are reported using Firestore snapshots.
- **Responsive Grid:** A clean, mobile-first grid layout to browse found items.
- **Claim & Remove:** Authorized users can "Claim" an item, which removes it from the live database once the owner is found.
- **Backend Verification:** Integrated "Test DB Sync" tool to verify database connectivity in one click.
- **Universal Setup:** Environment-variable driven configuration for easy cloning and local setup.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the necessary dependencies:
```bash
git clone [https://github.com/ABIZER-web/vibe-coding.git](https://github.com/ABIZER-web/vibe-coding.git)
cd vibe-coding
npm install

```

### 2. Firebase Configuration

This project is designed to be backend-agnostic. To use your own Firebase instance:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Initialize a **Cloud Firestore** database in **Test Mode** (Location: `us-central1` recommended).
3. Enable **Email/Password Authentication** under the Sign-in Method tab.

### 3. Environment Setup

Create a `.env` file in the root directory and populate it with your Firebase Web App credentials (see `.env.example` for the template):

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```

### 4. Run Development Server

```bash
npm run dev

```

---

## 📡 Database Architecture & Verification

The application uses a flat collection structure for high performance:

* **Collection:** `found_items`
* **Fields:** `name`, `location`, `contact`, `createdAt`

To verify your setup is correct:

1. Run the app locally.
2. Click the **TEST_DB_SYNC** button in the bottom-right corner.
3. Check your **Browser Console (F12)** for a success message and verify the new document in your Firebase Console.

---

## 📜 Security Rules

For the hackathon demo, Firestore rules are set to public. **Important: Update these before production use.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

```

---

## 👤 Author

**Abizer Saify**
*Social Media Head - ACM MHSSCE*
GitHub: [@ABIZER-web](https://www.google.com/search?q=https://github.com/ABIZER-web)

```

---

### Pro-Tip for your GitHub
Since your `.env` file is hidden from GitHub (as it should be), make sure you've also created that `.env.example` file. This acts as a guide for anyone who clones your project so they know exactly which keys they need to grab from their own Firebase console.

Would you like me to generate a **LICENSE** file or help you set up the **GitHub Actions** so your project automatically deploys to Firebase Hosting whenever you push to main?

```
