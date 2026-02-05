@echo off
REM Quick setup script for Windows

echo 🚀 Setting up Tile Stock Management System...
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend
call npm install

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ✅ .env created with shared database connection
) else (
    echo ✅ .env already exists
)

echo ✅ Backend setup complete! (Using shared database)

REM Frontend setup
echo.
echo 📦 Setting up frontend...
cd ..\frontend
call npm install

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo   1. Terminal 1: cd backend ^&^& npm run dev
echo   2. Terminal 2: cd frontend ^&^& npm start
echo.
echo Login with: admin@example.com / password123
echo.
pause
