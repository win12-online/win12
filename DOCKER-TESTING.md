# Docker Testing Guide

Run Win12 tests in a consistent Docker environment locally or in CI/CD.

## Quick Start

### Run All Tests in Docker

```bash
docker build -t win12-tests .
docker run --rm win12-tests npm run test:all
```

### Run Specific Tests

```bash
# Unit tests only
docker run --rm win12-tests npm test

# Linting only
docker run --rm win12-tests npm run lint

# E2E tests with web server
docker run --rm -p 3000:3000 win12-tests bash -c \
  "python -m http.server 3000 & sleep 2 && npm run test:e2e"
```

## Using Docker Compose

### Run All Tests

```bash
docker-compose run --rm tests
```

### Run Unit Tests Only

```bash
docker-compose run --rm test-unit
```

### Run E2E Tests Only

```bash
docker-compose run --rm test-e2e
```

### Interactive Shell (Debugging)

```bash
docker-compose run --rm tests bash
```

## What's in the Docker Image

- **Node.js 22** - Latest LTS version
- **Python 3** - For HTTP server
- **Playwright** - All browsers pre-installed (Chromium, Firefox, WebKit)
- **npm dependencies** - All packages pre-installed
- **curl** - For health checks

## Benefits

✅ **Consistency** - Same environment everywhere (local, CI, teammates)  
✅ **Isolation** - No conflicts with system Node or Python versions  
✅ **Speed** - Browsers already installed, no download delays  
✅ **Portability** - Works on macOS, Linux, Windows (with Docker Desktop)  
✅ **Reproducibility** - Exact same versions every time  

## Local Development with Docker

### Watch Mode (Auto-rerun on changes)

```bash
docker-compose run --rm -v $(pwd):/app test-unit
```

### Debug E2E Tests

```bash
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  win12-tests \
  bash -c "python -m http.server 3000 & npm run test:e2e -- --headed"
```

## CI/CD Integration

GitHub Actions workflow: `.github/workflows/test-docker.yml`

The Docker workflow provides:
- ✅ Consistent test environment
- ✅ Pre-installed browsers (faster than local download)
- ✅ Parallel testing support
- ✅ Easy to extend with more browsers/tools

### Run Docker Workflow Locally

```bash
# Install act: https://github.com/nektos/act
act push -W .github/workflows/test-docker.yml
```

## Troubleshooting

### Docker build fails

```bash
# Clear Docker cache and rebuild
docker build --no-cache -t win12-tests .
```

### Port 3000 already in use

```bash
# Use a different port
docker run -p 3001:3000 ...
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a
```

## Next Steps

1. **Try it locally:** `docker-compose run --rm tests`
2. **Use in CI/CD:** GitHub Actions automatically uses Docker
3. **Debug issues:** `docker-compose run --rm tests bash`
4. **Share with team:** "Just run `docker-compose run --rm tests`"

---

For more testing information, see [TESTING.md](TESTING.md) and [TESTING-QUICKSTART.md](TESTING-QUICKSTART.md).
