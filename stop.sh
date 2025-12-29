#!/bin/bash

# Stop the LLM Council application

echo "Stopping LLM Council..."

# Kill frontend (Vite on port 5173)
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "Stopping frontend (port 5173)..."
    lsof -ti:5173 | xargs kill -9
    echo "Frontend stopped."
else
    echo "Frontend is not running."
fi

# Kill backend (FastAPI on port 8000)
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "Stopping backend (port 8000)..."
    lsof -ti:8000 | xargs kill -9
    echo "Backend stopped."
else
    echo "Backend is not running."
fi

echo "LLM Council stopped."
