# Testing Guide

Complete guide to automated testing in Win12 Online.

## 📚 Testing Documentation

### Quick References
- **[Quick Start](QUICKSTART.md)** - 5-minute setup and basic commands
- **[Unit Tests](UNIT-TESTS.md)** - Writing and running unit tests  
- **[E2E Tests](E2E-TESTS.md)** - End-to-end testing guide
- **[Docker Testing](DOCKER.md)** - Testing with Docker containers

## 🎯 Testing Overview

Win12 uses a three-layer testing approach:

### 1. Unit Tests (Fast - ~2 seconds)
- Test individual functions and modules
- Use Vitest + jsdom
- Focus: Logic correctness, edge cases
- Location: `tests/unit/`

**Example Coverage:**
- i18n translation system
- Window manager operations
- Calculator logic
- Language normalization

### 2. Linting (Code Quality - ~17 seconds)
- Check code style and quality
- Use ESLint
- Focus: Best practices, consistency
- Runs on: Test files and new code

**Checks:**
- No unused variables
- Consistent style
- Security best practices
- Error handling

### 3. E2E Tests (Full Browser - Local Only)
- Test complete user workflows
- Use Playwright (Chromium, Firefox, WebKit)
- Focus: User experience, integration
- **Note:** Run locally only, not in GitHub Actions
- Command: `docker-compose run --rm test-e2e`

**Workflows Tested:**
- App launching and closing
- Window operations (drag, resize, etc.)
- File navigation
- Language switching
- Terminal operations

## 🚀 Quick Start

Get started testing in 5 minutes:

```bash
# Install dependencies
npm install
npx playwright install

# Run all tests locally
npm run test:all

# Or run specific tests
npm test              # Unit tests only
npm run lint         # Linting only
npm run test:e2e     # E2E tests (requires web server)
```

## 📊 Test Status in CI/CD

**GitHub Actions (Blocking Checks):**
- ✅ Linting - Must pass to merge
- ✅ Unit Tests - Must pass to merge
- ℹ️ E2E Tests - Not run in CI (run locally instead)

**Time to Pass CI/CD:** ~30-40 seconds

## 🐳 Docker Testing

Run complete test suite in Docker:

```bash
# All tests in Docker
docker-compose run --rm tests

# Specific tests
docker-compose run --rm test-unit
docker-compose run --rm test-e2e
docker-compose run --rm lint
```

See [Docker Testing Guide](DOCKER.md) for details.

## 📖 Detailed Guides

Choose your topic:

- **First time testing?** → [Quick Start](QUICKSTART.md)
- **Writing unit tests?** → [Unit Tests Guide](UNIT-TESTS.md)
- **E2E testing workflow?** → [E2E Tests Guide](E2E-TESTS.md)
- **Docker setup?** → [Docker Testing](DOCKER.md)

## 🔍 Common Tasks

### Before Committing Code
```bash
npm run test:all
```

### Write Tests for New Features
1. Create `tests/unit/feature.test.js`
2. Follow patterns in existing tests
3. Run: `npm test -- tests/unit/feature.test.js`
4. Ensure linting passes: `npm run lint:fix`

### Debug Failing Tests
```bash
npm test -- --watch          # Unit tests in watch mode
npm run test:ui              # Interactive UI
npm run test:e2e -- --headed # E2E with visible browser
```

### Check Code Coverage
```bash
npm run test:coverage
open coverage/index.html
```

## 🛠️ Test Commands Reference

| Command | Purpose | Time |
|---------|---------|------|
| `npm test` | Run unit tests | ~2s |
| `npm test -- --watch` | Watch mode | - |
| `npm run test:ui` | Interactive UI | - |
| `npm run test:coverage` | Coverage report | ~3s |
| `npm run lint` | Linting check | ~17s |
| `npm run lint:fix` | Auto-fix linting | ~17s |
| `npm run test:e2e` | E2E tests (local) | ~3-5s |
| `npm run test:all` | All tests | ~20s |

## ❓ FAQ

**Q: Do I need to run E2E tests before pushing?**
A: Recommended for important features, but not required. They run locally with `npm run test:e2e` (requires manual web server) or `docker-compose run --rm test-e2e`.

**Q: Why are E2E tests not in GitHub Actions?**
A: E2E tests are slow and require external setup. Better to run locally before pushing. CI/CD focuses on fast unit tests + linting.

**Q: How do I fix a failing test?**
A: Check the error message, review the test code, fix the implementation, and rerun the test.

**Q: Can I skip certain tests?**
A: Use `.skip` for Vitest tests: `it.skip('test name', () => {})` or `test.skip()` for Playwright. But fix them before committing!

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [ESLint Documentation](https://eslint.org)
- [Jest Matchers (Vitest uses similar API)](https://jestjs.io/docs/expect)

## 📝 Next Steps

1. ✅ [Read Quick Start](QUICKSTART.md) - 5 minutes
2. ✅ Run `npm run test:all` - Verify setup
3. ✅ Review test patterns in [Unit Tests Guide](UNIT-TESTS.md)
4. ✅ Write tests for new features
5. ✅ Push with confidence!

---

**Golden Rule:** If it's user-facing, it should have a test. 🎯
