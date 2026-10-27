#!/usr/bin/env bash
PORT=8088
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

# Check if already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚡ Server is already running on http://localhost:$PORT"
    exit 0
fi

echo "🚀 Starting QuizCardGen on http://localhost:$PORT ..."
nohup python3 -m http.server $PORT >/dev/null 2>&1 &

sleep 0.8
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Server is running in the background!"
    echo "👉 Open in your browser: http://localhost:$PORT"
    echo "🛑 To stop it anytime, run: ./stop_server.sh"
else
    echo "Starting in foreground (Press Ctrl+C to stop):"
    python3 -m http.server $PORT
fi
