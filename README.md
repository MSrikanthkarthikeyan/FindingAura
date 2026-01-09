# FindingAura - AI Quest Generation & Habit Tracking

An AI-powered MERN stack application for automatic quest generation and habit tracking. Built with MongoDB, Express, React, Node.js, and Google's Gemini AI.

## Features

- 🤖 **AI-Powered Quest Generation** - Gemini AI generates personalized quests based on your goals
- 📅 **Multi-Timeframe Quests** - Daily, weekly, monthly, and yearly quest tracking
- 🎯 **Smart Habit Tracking** - Track habits with wins/losses and streak monitoring
- 📊 **Comprehensive Analytics** - Visualize your progress with interactive charts
- 🎨 **Beautiful Mobile-First UI** - Responsive design optimized for mobile devices
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🎮 **Gamification** - XP system, levels, and streaks to keep you motivated

## Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Google Gemini AI** - Quest generation
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Google Gemini API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd findingaura
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd ../frontend
npm install
\`\`\`

4. Configure environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Fill in your credentials:
     - `MONGODB_URI` - MongoDB connection string
     - `GEMINI_API_KEY` - Google Gemini API key
     - `JWT_SECRET` - Random secret string for JWT
     - `PORT` - Backend port (default: 5000)

### Running the Application

1. Start the backend server:
\`\`\`bash
cd backend
npm start
\`\`\`

The backend will run on http://localhost:5000

2. Start the frontend development server:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The frontend will run on http://localhost:3000

3. Open http://localhost:3000 in your browser

## Project Structure

\`\`\`
findingaura/
├── backend/
│   ├── config/         # Database configuration
│   ├── middleware/     # Authentication middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── services/       # AI service integration
│   └── server.js       # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client
│   │   ├── App.jsx     # Main app component
│   │   ├── main.jsx    # React entry point
│   │   └── index.css   # Global styles
│   ├── index.html      # HTML template
│   └── vite.config.js  # Vite configuration
└── .env               # Environment variables
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quests
- `POST /api/quests/generate` - Generate AI quest
- `GET /api/quests` - Get user quests
- `PUT /api/quests/:id` - Update quest progress
- `POST /api/quests/:id/complete` - Complete quest

### Habits
- `POST /api/habits` - Create habit
- `GET /api/habits` - Get user habits
- `POST /api/habits/:id/log` - Log habit completion

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/trends` - Habit trends
- `GET /api/analytics/wins-losses` - Wins/losses data

## Features in Detail

### AI Quest Generation
The application uses Google's Gemini AI to generate contextual, personalized quests based on:
- User's selected goal categories
- Preferred difficulty level
- Time commitment preferences
- Current level and progress
- Historical performance

### Habit Tracking
Track daily, weekly, or monthly habits with:
- Streak counting
- Win/loss tracking
- Completion history
- Category-based organization

### Analytics Dashboard
Visualize your progress with:
- Trend analysis (30-day charts)
- Category breakdown (pie charts)
- Wins vs losses (bar charts)
- Top performing habits
- Overall statistics

## Mobile Optimization

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Mobile-first design
- Swipe gestures
- Optimized for small screens
- Fast loading times

## License

MIT

## Author

Built with ❤️ using Google Gemini AI
\`\`\`
