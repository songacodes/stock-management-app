# Tile Stock Management System - Setup Guide

Welcome! This guide will help you set up the project on **Windows**, **macOS**, or **Linux**.

## Prerequisites

Install these before starting:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (optional if using MongoDB Atlas)

## Quick Start (Any OS)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stock-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

1. Copy the example file:
   - **Windows (PowerShell):** `copy .env.example .env`
   - **Mac/Linux:** `cp .env.example .env`

2. **That's it!** The database is already configured and shared among all team members.
   - The `.env.example` already contains the correct MongoDB connection
   - No need to edit anything unless you want to change the port

> **Note:** All collaborators use the **same shared database**. The database already has users and data.


#### Seed the Database (Optional - Already Done)

The database already has users created. You can skip this step.

If you need to recreate users:
```bash
npm run seed
```


#### Start Backend Server

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

Open a **new terminal** (keep backend running):

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

## Login Credentials

**Everyone uses the same shared database**, so these credentials work for all team members:

- **Email:** `admin@example.com`
- **Password:** `password123`

> Any data you add or modify will be visible to all collaborators.


## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure your MongoDB URI in `.env` is correct
- If using MongoDB Atlas, ensure your IP is whitelisted (or use `0.0.0.0/0` for testing)

### "Port 5000 already in use"
- **Windows:** `taskkill /F /IM node.exe`
- **Mac/Linux:** `pkill node`

### "Users don't exist / Can't login"
- Run `npm run seed` in the backend folder

## Project Structure

```
├── backend/          # Express + MongoDB API
│   ├── src/         # Source code
│   ├── scripts/     # Utility scripts (seed, etc.)
│   └── .env         # Environment variables (not in git)
├── frontend/        # React frontend
└── README.md        # This file
```

## Development Workflow

1. Always run `npm run dev` in backend first
2. Then run `npm start` in frontend
3. Access the app at http://localhost:3000

## Need Help?

Check existing issues or create a new one!
