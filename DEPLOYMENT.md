# FindingAura - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (free tier works)
3. MongoDB Atlas account (already set up ✅)
4. Gemini API key (already have ✅)

---

## Part 1: Push to GitHub

### Step 1: Initialize Git Repository
```powershell
# Navigate to project root
cd d:\antigravity-projects\findingaura

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI-powered quest tracking app with MERN stack"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `findingaura`
3. Description: "AI-powered quest generation and habit tracking application"
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Push to GitHub
```powershell
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/findingaura.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend to Vercel

### Step 1: Install Vercel CLI (Optional but Recommended)
```powershell
npm install -g vercel
```

### Step 2: Deploy Backend via Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Import your `findingaura` repository from GitHub
4. **Project Settings:**
   - Framework Preset: **Other**
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

5. **Environment Variables** - Add these in Vercel dashboard:
   ```
   MONGODB_URI=mongodb+srv://msrikanthkarthikeyan_db_user:s1lI9JgjnlNv9MQl@cluster0.lzax9pv.mongodb.net/findingaura?retryWrites=true&w=majority
   
   GEMINI_API_KEY=AIzaSyBz2sUlHxmMdkyPhZ0RjE0rP4k8QR
   
   JWT_SECRET=c9949fc8e31ae1b901f376fd4ff95ea3b18f898d7ef7e46a92e5b225bc2e446648918bf3be26c27e4652a1cd73215916d20d490f8ef1255bd9463724929c3ee2
   
   NODE_ENV=production
   ```

6. Click "Deploy"

7. **Important**: After deployment, copy your backend URL. It will be something like:
   ```
   https://findingaura-api.vercel.app
   ```

### Step 3: Seed Quest Templates
After backend is deployed, seed the templates:
```powershell
# Update the MongoDB URI in seedTemplates.js if needed
cd backend
node seedTemplates.js
```

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create New Vercel Project for Frontend

1. Go to https://vercel.com/new again
2. Import the same `findingaura` repository
3. **Project Settings:**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables** - Add this ONE variable:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   *(Replace with your actual backend URL from Part 2, Step 2)*

5. Click "Deploy"

---

## Part 4: Final Configuration

### Update CORS Settings
After deploying frontend, update `backend/server.js` to allow your frontend domain:

```javascript
// Update CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app' // Add your Vercel frontend URL
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Then commit and push:
```powershell
git add .
git commit -m "Update CORS for production"
git push
```

Vercel will auto-redeploy!

---

## 📝 Alternative: Using Vercel CLI

### Deploy Backend
```powershell
cd backend
vercel

# Follow prompts:
# - Link to existing project or create new? Create new
# - Project name: findingaura-api
# - Directory: ./ (current directory)

# Add environment variables
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Deploy to production
vercel --prod
```

### Deploy Frontend
```powershell
cd frontend
vercel

# Follow prompts
# - Project name: findingaura
# - Framework: Vite

# Add environment variable
vercel env add VITE_API_URL

# Deploy to production
vercel --prod
```

---

## ✅ Verify Deployment

1. **Backend Health Check:**
   Visit: `https://your-backend-url.vercel.app/api/health`
   Should see: `{"status":"ok","message":"FindingAura API is running"}`

2. **Frontend App:**
   Visit: `https://your-frontend-url.vercel.app`
   Should see the login page

3. **Test Full Flow:**
   - Register a new account
   - Complete onboarding
   - Generate a quest
   - Check if everything works!

---

## 🔧 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Check your MongoDB Atlas IP whitelist (allow from anywhere: `0.0.0.0/0`)
- **Environment Variables**: Verify all env vars are set in Vercel dashboard
- **API Routes Not Working**: Check `vercel.json` configuration

### Frontend Issues
- **API Calls Failing**: Verify `VITE_API_URL` points to correct backend
- **CORS Errors**: Update CORS settings in backend to include frontend URL
- **Build Errors**: Check all dependencies are in `package.json`

### Common Commands
```powershell
# View deployment logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel remove findingaura
```

---

## 🎉 Success!

Your FindingAura app should now be live on Vercel!

**Share your live URLs:**
- Frontend: `https://findingaura.vercel.app`
- Backend: `https://findingaura-api.vercel.app`

---

## 📚 Post-Deployment Tasks

1. **Custom Domain** (Optional):
   - Go to Vercel Dashboard → Domains
   - Add your custom domain

2. **Analytics**:
   - Enable Vercel Analytics in dashboard
   - Monitor usage and performance

3. **Updates**:
   - Any push to `main` branch auto-deploys
   - Test in development before pushing

4. **Database Backups**:
   - Regular MongoDB Atlas backups
   - Export user data periodically

---

## 🔐 Security Notes

- ⚠️ **Never commit `.env` files** (already in `.gitignore`)
- ✅ Environment variables are encrypted in Vercel
- ✅ MongoDB connection uses TLS encryption
- ✅ JWT tokens expire after 30 days
- ✅ Passwords hashed with bcrypt

---

**Need help?** Check Vercel docs: https://vercel.com/docs
