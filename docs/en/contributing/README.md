# Contributing Guide

Thank you for contributing to Win12 Online! This guide will help you get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature: `git checkout -b feature/my-feature`
4. **Make your changes**
5. **Test your changes** - See [Testing Guide](../testing/)
6. **Commit** your changes
7. **Push** to your fork
8. **Create a Pull Request**

## Testing Requirements

**Before submitting a PR, ensure all tests pass:**

```bash
# Run all tests
npm run test:all

# This includes:
# - Unit tests (must pass ✅)
# - Linting (must pass ✅)
# - E2E tests (run locally recommended, not required in CI)
```

### For New Features

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Implement the feature**
3. **Ensure all tests pass**
4. **Run linting checks:**
   ```bash
   npm run lint:fix
   ```
5. **Commit tests and implementation together**

### Testing Guidelines

- ✅ **Unit tests** - For logic, functions, modules
- ✅ **E2E tests** - For user workflows (run locally before pushing)
- ✅ **Linting** - Code must pass ESLint checks
- ❌ **Don't skip tests** - Use `.skip` only for blocking issues

**Test Coverage Targets:**
- Statements: 50%+
- Branches: 50%+
- Functions: 50%+
- Lines: 50%+

See [Testing Guide](../testing/QUICKSTART.md) for commands.

## Code Quality

### Linting

```bash
# Check code style
npm run lint

# Auto-fix most issues
npm run lint:fix
```

### Commit Messages

Keep commit messages clear and descriptive:

```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
refactor: Improve code quality
test: Add test coverage
```

## Pull Request Checklist

Before submitting your PR:

- [ ] Tests pass locally: `npm run test:all`
- [ ] Linting passes: `npm run lint`
- [ ] Commit messages are clear
- [ ] Changes are focused on one feature/fix
- [ ] Documentation is updated if needed

## CI/CD Pipeline

When you push, GitHub Actions automatically checks:

| Check | Must Pass | Time |
|-------|-----------|------|
| Linting | ✅ YES | ~17s |
| Unit Tests | ✅ YES | ~20s |
| E2E Tests | ℹ️ INFO | (local only) |

**Total CI/CD time:** ~30-40 seconds

If any check fails:
1. Review the error message
2. Fix the issue locally
3. Push again - CI will re-run automatically

## Using Docker

For a consistent development environment:

```bash
# Run all tests in Docker
docker-compose run --rm tests

# Or specific tests
docker-compose run --rm test-unit
docker-compose run --rm test-e2e
docker-compose run --rm lint
```

See [Docker Testing Guide](../testing/DOCKER.md) for details.

## Project Structure

```
win12/
├── desktop.html          # Main app
├── desktop.js            # App logic
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # E2E tests
├── module/              # JavaScript modules
├── .github/workflows/   # CI/CD pipelines
├── docs/                # Documentation
└── docs/
    ├── en/testing/      # English testing docs
    └── zh/testing/      # Chinese testing docs
```

## Common Issues

### "Tests fail locally but pass in CI"
→ Most common: timing issues. Use explicit waits, not delays.

### "I added new user-facing strings but didn't write tests"
→ All user-visible features should have tests. See [Testing Guide](../testing/).

### "Linting fails"
→ Run `npm run lint:fix` to auto-fix most issues.

### "E2E tests fail"
→ E2E tests require manual setup. Run `npm run test:e2e` locally with `python -m http.server 3000` in another terminal, or use Docker: `docker-compose run --rm test-e2e`.

## Questions?

- **Testing help** → [Testing Quick Start](../testing/QUICKSTART.md)
- **Docker help** → [Docker Guide](../testing/DOCKER.md)
- **Code patterns** → See existing code in `tests/` folder
- **Issue questions** → Create an issue on GitHub

## Code of Conduct

We have a [Code of Conduct](../../CODE_OF_CONDUCT.md). Please follow it in all interactions.

---

**Thank you for contributing!** 🙏

We appreciate your effort to improve Win12 Online. Happy coding! 🚀
