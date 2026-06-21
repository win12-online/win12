FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    curl \
    bash \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only package files first
COPY package*.json ./

# Clean install npm dependencies (fresh for Linux)
# Remove package-lock to ensure fresh install for Linux architecture
RUN rm -f package-lock.json && \
    npm install --prefer-offline --no-audit

# Copy project files
COPY . .

# Ensure Playwright browsers are installed for Linux
RUN npx playwright install --with-deps chromium firefox webkit

# Expose port for web server
EXPOSE 3000

# Set environment for CI
ENV CI=true \
    NODE_ENV=production

# Default command runs tests
CMD ["npm", "run", "test:all"]
