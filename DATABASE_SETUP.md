# Database Setup Guide

## MongoDB Setup Options

You have **3 options** for MongoDB setup:

### Option 1: MongoDB Atlas (Cloud - Recommended for Testing)
**Best for:** Quick setup, no local installation needed

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user
5. Get your connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tile-stock-management
   ```

### Option 2: Local MongoDB Installation
**Best for:** Development, offline work

#### Windows:
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run the installer
3. Install MongoDB as a Windows Service
4. MongoDB will run on `mongodb://localhost:27017`
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/tile-stock-management
   ```

#### Mac (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option 3: Docker (If you have Docker installed)
**Best for:** Isolated environment

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use: `mongodb://localhost:27017/tile-stock-management`

## Initial Database Setup

Once MongoDB is running, you need to create initial data:

### 1. Create a Shop (Required for non-grand-admin users)

You can do this via:
- **MongoDB Compass** (GUI tool)
- **MongoDB Shell** (mongo/mongosh)
- **API** (after creating grand admin)

#### Using MongoDB Compass:
1. Connect to your MongoDB
2. Select `tile-stock-management` database
3. Create collection: `shops`
4. Insert document:
```json
{
  "name": "Main Shop",
  "address": {
    "city": "Your City",
    "country": "Your Country"
  },
  "contact": {
    "phone": "123-456-7890",
    "email": "shop@example.com"
  },
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Using MongoDB Shell:
```javascript
use tile-stock-management
db.shops.insertOne({
  name: "Main Shop",
  address: {
    city: "Your City",
    country: "Your Country"
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Create Grand Admin User

After MongoDB is set up, register via the frontend:
1. Go to http://localhost:3000/register
2. Select role: "Grand Admin"
3. Grand Admin doesn't need a shopId

Or create via API/MongoDB after hashing password.

## Database Collections

The system will automatically create these collections when you use the app:
- `users` - User accounts
- `shops` - Shop information
- `tiles` - Tile products
- `stocktransactions` - Stock movement history
- `sales` - Sales records

## Verification

To verify MongoDB is working:
1. Start backend: `cd backend && npm run dev`
2. Check console for: `✅ Connected to MongoDB`
3. If you see connection error, check:
   - MongoDB is running
   - Connection string in `.env` is correct
   - Network/firewall allows connection

## Troubleshooting

### Connection Refused
- MongoDB service not running
- Wrong port (should be 27017 for local)
- Firewall blocking connection

### Authentication Failed
- Wrong username/password in connection string
- User doesn't have database access

### Database Not Found
- This is OK! MongoDB creates databases automatically
- First API call will create the database

