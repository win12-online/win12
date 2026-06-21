# Testing Quick Start

Get up and running with Win12 automated tests in 5 minutes.

## Installation (One-time setup)

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# Done! You're ready to run tests.
```

## Running Tests Locally

### All Tests (Recommended for pre-commit)
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm test
```

### Unit Tests in Watch Mode (Auto-rerun on changes)
```bash
npm test -- --watch
```

### E2E Tests Only
```bash
npm run test:e2e
```

### E2E Tests with Browser Visible
```bash
npm run test:e2e -- --headed
```

### Interactive Test UI (Dashboard)
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
open coverage/index.html
```

## Code Quality

### Check Code Style
```bash
npm run lint
```

### Auto-fix Style Issues
```bash
npm run lint:fix
```

## What Gets Tested

### ✅ Unit Tests (Fast - ~1-2 seconds)
- Translation system (i18n keys, lookups, language switching)
- Window manager (positioning, resizing, state management)
- Language normalization (browser code to app code conversion)
- Translation completeness checks

### ✅ E2E Tests (Full browser - ~3-5 seconds per browser)
- Desktop loads and displays correctly
- Apps open/close and display windows
- Window operations (drag, resize, maximize, minimize)
- File Explorer navigation
- Language switching with UI reload
- Terminal functionality
- Taskbar and system tray

### ✅ Linting
- Code quality and style consistency
- No unused variables
- Proper error handling
- Security best practices

## Before Committing

```bash
# Run this before git commit
npm run test:all

# If it passes, you're good to commit!
# If it fails, fix the issues and try again.
```

## CI/CD Pipeline

When you push or create a PR:
1. ✅ **Linting** runs (code style check)
2. ✅ **Unit Tests** run (fast validation)
3. ✅ **E2E Tests** run (full workflow validation)
4. 📊 **Coverage** report generated
5. 💬 **PR Comment** posted with results

If any step fails, the PR is blocked until fixed.

## Common Commands

| Command | What it does |
|---------|------------|
| `npm test` | Run unit tests once |
| `npm test -- --watch` | Run unit tests in watch mode |
| `npm run test:ui` | Open interactive test dashboard |
| `npm run test:e2e` | Run E2E tests in all browsers |
| `npm run test:e2e -- --headed` | See browser while running tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix style issues |
| `npm run test:all` | Run everything (pre-commit) |

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

### "timeout waiting for selector"
→ App loading too slow; check the server is running and accessible

### "ESLint: unused variable"
→ Run `npm run lint:fix` to auto-fix, or delete the unused variable

### Tests pass locally but fail in CI
→ Most common: timing issues. Add explicit waits instead of delays:
```javascript
await page.waitForSelector('.element');  // Good
// Don't use: await page.waitForTimeout(1000);  // Bad
```

## Next Steps

1. ✅ Run `npm run test:all` to verify setup works
2. 📖 Read [TESTING.md](TESTING.md) for detailed patterns
3. ✍️ Write tests for new features
4. 📊 Check coverage: `npm run test:coverage`
5. 🚀 Push with confidence!

## Questions?

- **Testing patterns**: See [TESTING.md](TESTING.md)
- **Vitest docs**: https://vitest.dev
- **Playwright docs**: https://playwright.dev
- **ESLint docs**: https://eslint.org

---

**Golden Rule**: If it's user-facing, it should have a test. 🎯
