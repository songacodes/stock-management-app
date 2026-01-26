# Setup Guide

## Quick Start

### Prerequisites
- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Step 1: Install Dependencies

From the root directory, run:
```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend
- Frontend

### Step 2: Configure Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy the environment example file:
```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On Linux/Mac
cp .env.example .env
```

3. Edit `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Adjust other settings as needed

### Step 3: Configure Frontend

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Create `.env` file (if needed):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or on Linux/Mac
mongod
```

**Option B: MongoDB Atlas**
- Use your MongoDB Atlas connection string in `.env`

### Step 5: Run the Application

**Option A: Run both servers together (from root):**
```bash
npm run dev
```

**Option B: Run separately:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## First Steps After Setup

1. **Create a Grand Admin Account**
   - Go to http://localhost:3000/register
   - Register with role "Grand Admin"
   - Or use the API directly to create users

2. **Create a Shop**
   - Use the API or create directly in MongoDB
   - Example:
   ```javascript
   {
     "name": "Main Shop",
     "address": {
       "city": "Your City",
       "country": "Your Country"
     },
     "isActive": true
   }
   ```

3. **Create Shop Admin/Staff**
   - Register new users with appropriate roles
   - Assign them to the shop

4. **Start Adding Tiles**
   - Login to the system
   - Navigate to Tiles → Add New Tile
   - Fill in the tile information

## Project Structure

```
tile-stock-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   └── package.json
├── Architecture.md         # System architecture
├── TIME_ESTIMATE.md        # Development timeline
└── README.md              # Project readme
```

## Available Scripts

### Root Level
- `npm run dev` - Run both backend and frontend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build both projects

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network/firewall settings

### Port Already in Use
- Backend default: 5000
- Frontend default: 3000
- Change ports in `.env` or `package.json` if needed

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:3000`

### TypeScript Errors
- Run `npm install` in the specific directory
- Check `tsconfig.json` settings
- Ensure all dependencies are installed

## Next Steps

1. Complete remaining API endpoints (Stock, Sales, Reports)
2. Implement image upload functionality
3. Build visual preview system
4. Add image-based recognition
5. Implement real-time synchronization
6. Add advanced reporting features

## Development Status

✅ Completed:
- Project structure setup
- Backend foundation (Express, TypeScript, MongoDB)
- Authentication system (JWT)
- Database models (User, Shop, Tile)
- Tile CRUD APIs
- Frontend foundation (React, TypeScript, Redux)
- Authentication UI (Login, Register)
- Tile management UI (List, Create, Detail)
- Basic navigation and routing

🚧 In Progress:
- Stock management APIs and UI
- Sales management APIs and UI
- Reports and analytics

⏳ Pending:
- Visual preview system
- Image-based recognition
- Multi-shop synchronization
- Advanced features

