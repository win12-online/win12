# Testing Quick Start

Get up and running with Win12 automated tests in 5 minutes.

## Installation (One-time setup)

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Playwright browsers (for E2E testing)
npx playwright install

# Done! You're ready to run tests.
```

## Running Tests Locally

### ✅ All Tests (Recommended before committing)
```bash
npm run test:all
```

### ✅ Unit Tests Only  
```bash
npm test
```

### ✅ Unit Tests in Watch Mode (Auto-rerun on changes)
```bash
npm test -- --watch
```

### ℹ️ E2E Tests (Local only - requires web server)
```bash
# Terminal 1: Start web server
python -m http.server 3000

# Terminal 2: Run tests in another terminal
npm run test:e2e
```

**OR with Docker:**
```bash
docker-compose run --rm test-e2e
```

### ℹ️ E2E Tests with Browser Visible
```bash
npm run test:e2e -- --headed
```

### 🎨 Interactive Test Dashboard
```bash
npm run test:ui
```

### 📊 Code Coverage Report
```bash
npm run test:coverage
open coverage/index.html  # View HTML report
```

## Code Quality

### Check Code Style
```bash
npm run lint
```

### Auto-fix Code Style Issues
```bash
npm run lint:fix
```

## What Gets Tested

### Unit Tests (Fast - ~2 seconds)
- Translation system (i18n keys, lookups, language switching)
- Window manager (positioning, resizing, state management)
- Language normalization (browser code to app code conversion)
- Translation completeness checks

**Coverage:** 28 tests across 2 test suites

### Linting (~17 seconds)
- Code quality and style consistency
- No unused variables
- Proper error handling
- Security best practices

### E2E Tests (Local only - ~3-5 seconds per browser)
- Desktop loads and displays correctly
- Apps open/close and display windows
- Window operations (drag, resize, maximize, minimize)
- File Explorer navigation
- Language switching with UI reload
- Terminal functionality
- Taskbar and system tray

## Before Committing Code

```bash
# Run this before git commit
npm run test:all

# If it passes, you're good to commit!
# If it fails, fix the issues and try again.
```

## GitHub Actions (CI/CD)

When you push or create a PR, GitHub Actions automatically runs:
1. ✅ **Linting** (must pass)
2. ✅ **Unit Tests** (must pass)
3. ⏱️ **Duration:** ~30-40 seconds

**Note:** E2E tests don't run in GitHub Actions. Run them locally with `npm run test:e2e` before pushing.

## Common Commands

| Command | What it does | Time |
|---------|------------|------|
| `npm test` | Run unit tests once | ~2s |
| `npm test -- --watch` | Auto-rerun on file changes | - |
| `npm run test:ui` | Interactive test dashboard | - |
| `npm run test:e2e` | E2E tests (local setup) | ~3-5s |
| `npm run test:e2e -- --headed` | See browser during tests | ~3-5s |
| `npm run test:coverage` | Coverage report | ~3s |
| `npm run lint` | Check code style | ~17s |
| `npm run lint:fix` | Auto-fix style issues | ~17s |
| `npm run test:all` | All local tests | ~20s |

## Writing Your First Test

### Example: Test a translation key

Create `tests/unit/my-feature.test.js`:

```javascript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should translate correctly', () => {
    const translations = {
      en: { 'my.key': 'Hello World' },
      zh_CN: { 'my.key': '你好世界' }
    };

    expect(translations.en['my.key']).toBe('Hello World');
    expect(translations.zh_CN['my.key']).toBe('你好世界');
  });
});
```

Run it:
```bash
npm test -- tests/unit/my-feature.test.js
```

## Troubleshooting

### "command not found: npm"
→ Install Node.js from https://nodejs.org

### "timeout waiting for selector" (E2E tests)
→ App loading too slow; check the server is running and accessible

### "ESLint: unused variable"
→ Run `npm run lint:fix` to auto-fix, or delete the unused variable

### Tests pass locally but fail in CI
→ Most common: timing issues. Add explicit waits instead of delays:
```javascript
await page.waitForSelector('.element');  // Good
// Don't use: await page.waitForTimeout(1000);  // Bad
```

### "Python command not found" (starting web server)
→ Install Python 3 from https://python.org or use Docker: `docker-compose run --rm test-e2e`

## Next Steps

1. ✅ Run `npm run test:all` to verify setup works
2. 📖 Read [Testing Guide](README.md) for detailed patterns
3. 📖 Read [Unit Tests Guide](UNIT-TESTS.md) for test patterns
4. ✍️ Write tests for new features
5. 📊 Check coverage: `npm run test:coverage`
6. 🚀 Commit with confidence!

## Questions?

- **Detailed testing patterns** → See [Unit Tests Guide](UNIT-TESTS.md)
- **E2E testing details** → See [E2E Tests Guide](E2E-TESTS.md)
- **Docker setup** → See [Docker Testing Guide](DOCKER.md)
- **Vitest docs** → https://vitest.dev
- **Playwright docs** → https://playwright.dev
- **ESLint docs** → https://eslint.org

---

**Golden Rule:** If it's user-facing, it should have a test. 🎯
