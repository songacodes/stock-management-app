# Tile Stock Management System

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

1. Clone the repository
```bash
git clone <repository-url>
cd tile-stock-management-system
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers
```bash
# From root directory
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) servers.

## Development

- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000

## Documentation

- [Architecture Documentation](./Architecture.md)
- [Time Estimates](./TIME_ESTIMATE.md)

## License

ISC

