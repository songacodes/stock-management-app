#!/bin/bash
# Quick setup script for Unix-based systems (Mac/Linux)

echo "🚀 Setting up Tile Stock Management System..."

# Backend setup
echo ""
echo "📦 Setting up backend..."
echo "⏳ Installing dependencies (this may take a minute)..."
cd backend
npm install

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env created with shared database connection"
else
    echo "✅ .env already exists"
fi

echo "✅ Backend setup complete! (Using shared database)"

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Terminal 1: cd backend && npm run dev"
echo "  2. Terminal 2: cd frontend && npm start"
echo ""
echo "Login with: admin@tilestock.app / password123"
