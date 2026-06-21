FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install Node.js 22 (Playwright image includes Node, but ensure latest)
RUN apt-get update && apt-get install -y \
    python3 \
    curl \
    bash \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=optional

# Install Playwright browsers (already included in base image, but refresh)
RUN npx playwright install chromium firefox webkit

# Copy project files
COPY . .

# Expose port for web server
EXPOSE 3000

# Set environment for CI
ENV CI=true

# Default command runs tests
CMD ["npm", "run", "test:all"]
