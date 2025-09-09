#!/bin/sh

# This script allows runtime environment variable injection
# for React apps built with Vite

# Create a config.js file with runtime environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:8000}"
};
EOF

# Execute the CMD from the Dockerfile
exec "$@"