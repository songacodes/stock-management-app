# Tile Stock Management System

> **👥 New Collaborator?** → Start here: [GETTING_STARTED.md](./GETTING_STARTED.md)

A comprehensive web-based stock management system for tile retailers with inventory tracking, sales management, visual product previews, and multi-shop administration.


## Features

- 🏪 **Multi-Shop Support** - Manage multiple shops with centralized administration
- 📦 **Inventory Management** - Complete tile inventory tracking
- 💰 **Sales Management** - Record and track sales transactions
- 📊 **Analytics & Reports** - Comprehensive reporting with period-based filters
- 🖼️ **Visual Previews** - Show clients how tiles look in real home settings
- 🔍 **Image Recognition** - Identify tiles using image-based search
- 📈 **Profit Tracking** - Track profit/loss for each tile
- 🔄 **Real-time Sync** - Synchronize data across multiple shops

## Project Structure

```
tile-stock-management-system/
├── backend/          # Node.js/Express backend
├── frontend/         # React frontend
├── Architecture.md   # System architecture documentation
└── TIME_ESTIMATE.md  # Development time estimates
```

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB (Centralized database)
- JWT Authentication
- Socket.io (Real-time sync)

### Frontend
- React.js with TypeScript
- Material-UI / Tailwind CSS
- Three.js (Visual previews)
- Redux Toolkit (State management)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

**📖 For detailed setup instructions (Windows/Mac/Linux), see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

**Quick Start:**

1. Clone the repository
```bash
git clone <repository-url>
cd tile-stock-management-system
```

2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Database already configured!
npm run dev           # Start backend server
```

3. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm start       # Start frontend
```

**Default Login:**
- Email: `admin@example.com`
- Password: `password123`

## Development


- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000

## Documentation

- [Setup Guide (Detailed)](./SETUP_GUIDE.md) - Cross-platform setup instructions
- [Architecture Documentation](./Architecture.md)
- [Time Estimates](./TIME_ESTIMATE.md)


## License

ISC

