# Quick Start Guide

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended - 5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password
7. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tile-stock-management?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service
4. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/tile-stock-management
   ```

## Step 2: Install Dependencies

```bash
# From project root
npm run install:all
```

## Step 3: Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your MONGODB_URI
```

## Step 4: Initialize Database (Optional but Recommended)

This creates default shop and admin users:

```bash
cd backend
npx ts-node src/scripts/initDatabase.ts
```

This will create:
- **Grand Admin**: admin@example.com / admin123
- **Shop Admin**: shopadmin@example.com / shop123
- **Default Shop**: Main Shop

⚠️ **Change passwords after first login!**

## Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `✅ Connected to MongoDB` and `🚀 Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Wait for browser to open: http://localhost:3000

## Step 6: Login and Test

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You should see the Dashboard!

## Step 7: Test Features

### Create Your First Tile:
1. Go to **Tiles** → **Add New Tile**
2. Fill in the form
3. Upload images (drag & drop)
4. Click "Create Tile"

### Add Stock:
1. Go to **Stock** → **Add Stock**
2. Select tile, enter quantity
3. Click "Add Stock"

### Create a Sale:
1. Go to **Sales** → **New Sale**
2. Add customer info
3. Add items
4. Create sale

### View Reports:
1. Go to **Reports**
2. Try different report types
3. Change period filters

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB is running
- Verify connection string in `.env`
- Check network/firewall

### "Port already in use"
- Backend: Change PORT in `.env`
- Frontend: Change port in `package.json` scripts

### "Module not found"
- Run `npm install` in backend and frontend directories

### Images not showing
- Check `backend/uploads` directory exists
- Verify backend is serving static files
- Check image URLs in database

## Need Help?

- See `DATABASE_SETUP.md` for detailed MongoDB setup
- See `TESTING_GUIDE.md` for comprehensive testing steps
- See `STATUS.md` for what's implemented vs pending

