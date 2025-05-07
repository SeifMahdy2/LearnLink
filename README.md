# Grad_Project
Finally the end 

# Learning Platform

A comprehensive learning platform designed to adapt content to different learning styles (Visual, Auditory, Reading/Writing, and Kinesthetic).

## Overview

This application transforms educational content into personalized learning experiences based on the user's preferred learning style. Upload documents and get tailored study materials that match how you learn best.

## Features

- **Learning Style Assessment**: Determines your dominant learning style
- **Document Processing**: Upload and process educational materials (PDF, DOCX, TXT, PPTX)
- **Adaptive Content**: Transforms documents into style-specific learning materials:
  - Visual learners: Diagrams, charts, visual concept maps
  - Auditory learners: Audio explanations, spoken-friendly content
  - Reading/Writing learners: Structured study guides, notes, summaries
  - Kinesthetic learners: Interactive activities, hands-on exercises
- **Study Tools**: Generates quizzes, summaries, and downloadable study materials
- **Progress Tracking**: Monitors learning time and effectiveness
- **Personalization**: Customizes experience based on learning preferences

## Technologies

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT models for content transformation

## Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Firebase account
- OpenAI API key
- Google account (for Google Drive integration)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/learning-platform.git
cd learning-platform
```

### 2. Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Set up Firebase Authentication, Firestore, and Storage
3. Download your Firebase Admin SDK service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Rename the downloaded file to `firebase-adminsdk.json`
   - Place it in the `backend/` directory

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
# OpenAI and Search APIs
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key

# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5000/oauth2callback

# Flask Configuration
FLASK_SECRET_KEY=your_secure_random_string
FLASK_DEBUG=False

# Firebase (Alternative to firebase-adminsdk.json)
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
```

### 5. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 6. Firebase Configuration for Frontend

Create a file named `src/firebaseConfig.js` with your Firebase web config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

export default firebaseConfig;
```

## Running the Application

### Start the Backend

```bash
# In the backend directory with virtual environment activated
python app.py
```

The backend server will start at http://localhost:5000

### Start the Frontend

```bash
# In the frontend directory
npm start
```

The application will open in your browser at http://localhost:3000

## Project Structure

```
learning-platform/
├── backend/               # Flask backend
│   ├── app.py             # Main server file
│   ├── requirements.txt   # Python dependencies
│   ├── google_drive_service.py  # Google Drive integration
│   └── .env               # Environment variables (not in repo)
│
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   ├── package.json       # Node.js dependencies
│   └── firebaseConfig.js  # Firebase configuration (not in repo)
│
└── README.md              # Project documentation
```

## Security Notes

For security reasons, the following files are not included in this repository:

- `firebase-adminsdk.json`: Firebase credentials
- `.env`: Environment variables with API keys
- `credentials.json`: Google API credentials

Never commit these files to version control.

## License

[Specify your license here]
