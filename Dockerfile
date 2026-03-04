# Use official Node.js image with Alpine for a smaller footprint
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Add required packages for better-sqlite3 compilation if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building the frontend)
RUN npm install

# Copy source code
COPY . .

# Build the frontend assets (Vite will output to /app/dist)
RUN npm run build

# Set Node environment for production so our server.ts will correctly serve the static files
ENV NODE_ENV=production
# Expose the default PORT (process.env.PORT)
ENV PORT=3000
# Define the persistent storage path for SQLite
ENV DATABASE_URL=/app/data/medisafe.db

# Ensure the data directory exists
RUN mkdir -p /app/data && chown -R node:node /app/data

# Run as a non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application using tsx as configured in our package.json 'start' script
CMD ["npm", "start"]
