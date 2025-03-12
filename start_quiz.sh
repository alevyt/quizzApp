#!/bin/bash

# Function to get local IP
get_local_ip() {
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    ip a | grep -oP 'inet \K192\.168\.\d+\.\d+' | head -1
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    ipconfig getifaddr en0  # macOS
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    ipconfig | grep -oE '192\.168\.[0-9]+\.[0-9]+' | head -1  # Windows
  else
    echo "localhost"
  fi
}

# Get local IP
LOCAL_IP=$(get_local_ip)
PORT=3000

# Start the server
echo "🚀 Starting the quiz server..."
node index.js &  # Run server in the background
sleep 2  # Wait for the server to start

# Print links
echo "✅ Server running at:"
echo "📌 Local:   http://localhost:$PORT"
echo "📡 Network: http://$LOCAL_IP:$PORT/team"

# Copy to clipboard (cross-platform)
if command -v xclip &> /dev/null; then
  echo -n "http://$LOCAL_IP:$PORT/team" | xclip -selection clipboard
elif command -v pbcopy &> /dev/null; then
  echo -n "http://$LOCAL_IP:$PORT/team" | pbcopy
elif command -v clip &> /dev/null; then
  echo "http://$LOCAL_IP:$PORT/team" | clip
fi

echo "🔗 Link copied to clipboard! Paste (Ctrl + V) to share."
