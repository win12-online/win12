FROM node:22-alpine

WORKDIR /app

# Install Python and curl for HTTP server
RUN apk add --no-cache python3 curl bash

# Install dependencies
COPY package*.json ./
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps chromium firefox webkit

# Copy project files
COPY . .

# Expose port for web server
EXPOSE 3000

# Default command runs tests
CMD ["npm", "run", "test:all"]
