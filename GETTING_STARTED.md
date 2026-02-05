# 🚀 Quick Start for Collaborators

**You just cloned this project? Here's everything you need to get started!**

## Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)

That's it! The database is already set up and shared.

## Setup (5 minutes)

### Windows Users

1. Open the project folder
2. Double-click `setup.bat`
3. Wait for installation to complete

### Mac/Linux Users

1. Open terminal in the project folder
2. Run these commands:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## Running the Project

After setup completes, you need **2 terminal windows**:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Wait until you see: `✅ Connected to MongoDB` and `🚀 Server running on port 5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

The app will automatically open at **http://localhost:3000**

## Login

Use these credentials (shared by all team members):
- **Email:** `admin@example.com`
- **Password:** `password123`

## Important Notes

- ✅ **Database is shared** - Everyone uses the same database. Changes you make are visible to all collaborators.
- ✅ **No additional setup needed** - Everything is pre-configured in the `.env` files
- ✅ **Users already exist** - No need to create accounts

## Troubleshooting

### Port 5000 already in use?
**Windows:** 
```bash
taskkill /F /IM node.exe
```

**Mac/Linux:**
```bash
pkill node
```

Then restart the backend.

### Need more help?

Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

That's it! You're ready to contribute! 🎉
