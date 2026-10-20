#!/usr/bin/env bash
PORT=8088

# Kill via lsof
PID=$(lsof -ti :$PORT 2>/dev/null)
if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "✓ Stopped server on port $PORT (PID $PID)."
    exit 0
fi

# Fallback via fuser
if command -v fuser >/dev/null 2>&1; then
    if fuser -k ${PORT}/tcp >/dev/null 2>&1; then
        echo "✓ Stopped server on port $PORT."
        exit 0
    fi
fi

# Fallback via pkill
if pkill -f "python3 -m http.server ${PORT}" 2>/dev/null; then
    echo "✓ Stopped server on port $PORT."
    exit 0
fi

echo "ℹ️ No server was running on port $PORT."
