# Use official Node.js LTS image as the base
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm globally (since the project uses pnpm)
RUN npm install -g pnpm@latest

# Copy only package files to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install production dependencies (skip dev)
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose the port the app runs on (default Next.js port)
EXPOSE 3000

# Define environment variables (optional)
ENV NODE_ENV=production

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the server
CMD ["pnpm", "run", "start"]
