# MongoDB Atlas Setup Guide

## Step-by-Step Setup

### Step 1: Create Cluster
1. You're already on MongoDB Atlas - great!
2. Click **"Create"** or **"Build a Database"**
3. Choose **FREE (M0)** tier
4. Select a cloud provider and region (closest to you)
5. Click **"Create"** (takes 1-3 minutes)

### Step 2: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - Username: `tileadmin` (or your choice)
   - Password: Create a strong password (save it!)
5. Set privileges: **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 4: Update Connection String
1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. Add database name at the end: `/tile-stock-management`
4. Final string should look like:
   ```
   mongodb+srv://tileadmin:YourPassword123@cluster0.xxxxx.mongodb.net/tile-stock-management?retryWrites=true&w=majority
   ```

### Step 5: Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Add Current IP Address"**
4. Or click **"Allow Access from Anywhere"** (0.0.0.0/0) - less secure but easier for testing
5. Click **"Confirm"**

### Step 6: Update Backend .env File
1. Open `backend/.env` (create it if it doesn't exist)
2. Add your connection string:
   ```
   MONGODB_URI=mongodb+srv://tileadmin:YourPassword123@cluster0.xxxxx.mongodb.net/tile-stock-management?retryWrites=true&w=majority
   ```
3. Save the file

### Step 7: Test Connection
Run the backend to test:
```bash
cd backend
npm run dev
```

You should see: `✅ Connected to MongoDB`

## Security Notes
- ⚠️ Never commit `.env` file to git (it's in .gitignore)
- ⚠️ Use strong passwords
- ⚠️ Restrict IP access in production
- ⚠️ Use environment variables in production

## Troubleshooting

### "Authentication failed"
- Check username and password in connection string
- Verify user has correct permissions

### "IP not whitelisted"
- Add your IP in Network Access
- Or allow from anywhere (0.0.0.0/0) for testing

### "Connection timeout"
- Check cluster is running (not paused)
- Verify connection string format
- Check network/firewall

