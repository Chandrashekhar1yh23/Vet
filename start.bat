@echo off
echo Starting Vet Management System...

:: Start the Backend in a new window
start "Vet Backend" cmd /k "cd backend && node server.js"

:: Start the Frontend in a new window
start "Vet Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting up!
