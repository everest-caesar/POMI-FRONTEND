# Pomi Testing Suite

This directory contains all test files for the Pomi frontend application. We follow a comprehensive testing strategy covering E2E, visual regression, multilingual, accessibility, and unit tests.

## Test Structure

```
tests/
├── e2e/                  # End-to-end tests (user workflows)
├── visual/               # Visual regression tests (UI consistency)
├── multilingual/         # Tests for 4-language support
├── accessibility/        # WCAG 2.1 AA compliance tests
├── unit/                 # Component unit tests
└── README.md            # This file
```

## Running Tests

### All Tests
```bash
npm run test:e2e                # Run all Playwright tests
npm test                        # Run all tests (E2E + unit)
npm run test:watch             # Run tests in watch mode
```

### Specific Test Categories

#### E2E Tests (User Workflows)
```bash
npm run test:headed            # Run tests in visible browser
npm run test:ui                # Interactive Playwright UI
npm run test:e2e -- tests/e2e  # Run only E2E tests
```

#### Visual Regression Tests
```bash
npm run test:visual
```

#### Multilingual Tests (4 Languages)
```bash
npm run test:multilingual
# Tests: English (en), Amharic (am), Tigrinya (ti), Oromo (om)
```

#### Accessibility Tests
```bash
npm run test:a11y
# Checks WCAG 2.1 AA compliance using Axe
```

#### Unit Tests
```bash
npm test                       # Run with Vitest
npm run test:coverage         # Generate coverage report
```

## Test Categories Explained

### E2E Tests (tests/e2e/)
User interaction workflows that span the entire application.

**Files:**
- `home.spec.ts` - Tests home page rendering, modules, and responsiveness

**What we test:**
- Page loads correctly
- All modules display
- Responsive layouts (mobile, tablet, desktop)
- Navigation flows
- User interactions

### Visual Regression Tests (tests/visual/)
Ensures UI consistency across versions using screenshot comparisons.

**Files:**
- `home-visual.spec.ts` - Screenshot comparisons for different viewports

**What we test:**
- Desktop layout (full page screenshot)
- Mobile layout (375x667)
- Tablet layout (768x1024)
- Color contrast
- Consistent spacing

**Updating snapshots:**
```bash
npm run test:visual -- --update-snapshots
```

### Multilingual Tests (tests/multilingual/)
Verifies correct behavior in all supported languages.

**Languages:**
- English (en) - LTR
- Amharic (am) - RTL
- Tigrinya (ti) - RTL
- Afan Oromo (om) - LTR

**Files:**
- `home-multilingual.spec.ts` - Language switching and persistence

**What we test:**
- Language loads correctly
- RTL languages display properly
- Language preferences persist
- Dynamic language switching works

### Accessibility Tests (tests/accessibility/)
Ensures WCAG 2.1 AA compliance for all users.

**Files:**
- `a11y.spec.ts` - Accessibility compliance checks

**What we test:**
- No axe violations
- Proper heading hierarchy
- Image alt text
- Button labels
- Form labels
- Keyboard navigation
- Color contrast (WCAG AA)

**Tools:**
- Axe for automated accessibility testing
- Manual keyboard navigation tests

### Unit Tests (tests/unit/)
Tests individual components in isolation.

**Files:**
- `example.test.tsx` - Example component test

**What we test:**
- Component rendering
- Props handling
- State changes
- User interactions
- Edge cases

## Development Workflow

Follow the Pomi 5-step cycle:

1. **CODE** - Write component/feature
2. **SCREENSHOT** - `npm run test:ui` - Visualize in Playwright UI
3. **VERIFY** - `npm run test:multilingual` - Test all 4 languages
4. **TEST** - `npm run test:e2e && npm test` - Write and run tests
5. **DOCUMENT** - Add JSDoc comments and update documentation
6. **MERGE** - All tests pass ✅, create pull request

## Pre-commit Testing

Before pushing to GitHub:

```bash
# Run linting
npm run lint

# Type check
npm run type-check

# Run all tests
npm test

# Check coverage
npm run test:coverage
```

## CI/CD Integration

Tests run automatically on pull requests using GitHub Actions:
- Linting (`npm run lint`)
- Type checking (`npm run type-check`)
- Unit tests (`npm test`)
- E2E tests (`npm run test:e2e`)
- Coverage reports

All checks must pass before merging.

## Best Practices

### Writing E2E Tests
- Use semantic locators (`role`, `label`, `text`) over class selectors
- Test user workflows, not implementation details
- Keep tests independent and don't rely on execution order
- Use `beforeEach` for common setup

### Writing Visual Tests
- Create baseline snapshots first
- Review visual changes carefully before updating snapshots
- Use `mask` to exclude dynamic content
- Test all viewport sizes

### Writing Accessibility Tests
- Always include axe checks
- Test keyboard navigation
- Verify form labels and alt text
- Check heading hierarchy

### Writing Unit Tests
- Test behavior, not implementation
- Mock external dependencies
- Keep tests focused and small
- Use descriptive test names

## Debugging Tests

### View test report
```bash
npm run test:report
```

### Run single test
```bash
npm run test:e2e -- tests/e2e/home.spec.ts
```

### Run with specific project
```bash
npm run test:e2e -- --project=chromium
```

### Debug in headed mode
```bash
npm run test:headed -- tests/e2e/home.spec.ts
```

### Interactive debugging
```bash
npm run test:ui
# Click on test to run and debug in browser
```

## Coverage Goals

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

View coverage report:
```bash
npm run test:coverage
```

## Troubleshooting

### Tests fail locally but pass in CI
- Clear node_modules: `rm -rf node_modules && npm install`
- Update Playwright: `npm run test:e2e -- --install-deps`

### Timeout errors
- Increase timeout: `test.setTimeout(30000)` in specific test
- Check if app is running: `npm run dev`

### Visual regression failures
- Review new screenshots in `test-results/`
- Update if changes are intentional: `npm run test:visual -- --update-snapshots`

### Accessibility failures
- Check Axe report in test output
- Common issues: missing alt text, low contrast, missing labels

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Axe Accessibility](https://www.deque.com/axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
