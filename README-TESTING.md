# Testing Documentation

## Overview

This document outlines the comprehensive testing strategy implemented for Le Tuan's portfolio website, focusing on the updated sections containing CV information.

## Test Structure

```
src/
├── __tests__/
│   ├── accessibility/
│   │   └── components-a11y.test.js     # Accessibility tests using jest-axe
│   ├── content/
│   │   └── job-content.test.js         # Content validation for markdown files
│   ├── integration/
│   │   └── markdown-content.test.js    # GraphQL integration tests
│   └── visual/
│       └── visual-regression.test.js   # Layout and visual consistency tests
└── components/
    └── sections/
        └── __tests__/
            ├── about.test.js           # About component unit tests
            ├── jobs.test.js            # Jobs component unit tests
            └── contact.test.js         # Contact component unit tests
```

## Test Categories

### 1. Unit Tests

**About Component** (`about.test.js`)

- ✅ Le Tuan's name and AI Research Scientist profile display
- ✅ Professional experience mentions (Heudiasyc, UTC, VATEC, Vietnam Electricity)
- ✅ Research focus areas (foundation models, multimodal learning, anomaly detection)
- ✅ Publication information (Neurocomputing, RCLED, 93%+ accuracy)
- ✅ Skills list rendering (8 AI/ML technologies)
- ✅ Image display with alt text
- ✅ External links with correct URLs
- ✅ ScrollReveal animation integration

**Jobs Component** (`jobs.test.js`)

- ✅ Tab interface with keyboard navigation
- ✅ Four job positions display and switching
- ✅ Job content from GraphQL/markdown integration
- ✅ ARIA compliance for tab interface
- ✅ Company links and date ranges
- ✅ AI research achievements display
- ✅ Quantifiable results (93%+ accuracy, 40% reduction, etc.)
- ✅ Chronological ordering (most recent first)

**Contact Component** (`contact.test.js`)

- ✅ Collaboration-focused messaging
- ✅ AI research domain mentions
- ✅ Email link functionality
- ✅ Professional contact tone
- ✅ Research opportunity emphasis
- ✅ Accessibility compliance

### 2. Integration Tests

**Markdown Content Integration** (`markdown-content.test.js`)

- ✅ GraphQL query structure validation
- ✅ Frontmatter parsing for all 4 job entries
- ✅ HTML content generation from markdown
- ✅ Date sorting (DESC order)
- ✅ Required field validation
- ✅ Le Tuan specific content verification
- ✅ Error handling for missing data

### 3. Content Tests

**Job Content Validation** (`job-content.test.js`)

- ✅ All job files have required frontmatter
- ✅ Non-empty content with detailed descriptions
- ✅ ISO date format validation
- ✅ Current AI research work (Heudiasyc)
- ✅ PhD achievements (UTC, RCLED, Neurocomputing)
- ✅ Industry ML experience (VATEC, Vietnam Electricity)
- ✅ Quantifiable metrics in descriptions
- ✅ Technical language and terminology
- ✅ Proper markdown formatting

### 4. Accessibility Tests

**Component Accessibility** (`components-a11y.test.js`)

- ✅ Zero accessibility violations (jest-axe)
- ✅ Proper heading hierarchy
- ✅ ARIA attributes for interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ Semantic HTML structure
- ✅ Alternative text for images
- ✅ Color contrast considerations

### 5. Visual Regression Tests

**Layout Integrity** (`visual-regression.test.js`)

- ✅ Component structure preservation
- ✅ Grid and flex layouts maintenance
- ✅ Content display consistency
- ✅ Interactive element states
- ✅ Responsive design elements
- ✅ Content length handling
- ✅ Visual hierarchy validation

## Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only accessibility tests
npm run test:a11y

# Run tests for CI environment
npm run test:ci
```

## Coverage Targets

The test suite maintains the following coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Key Test Features

### Mocking Strategy

- **Gatsby**: StaticQuery, Link, navigation
- **ScrollReveal**: Animation library
- **Styled Components**: Theme provider
- **Custom Hooks**: Motion preferences
- **File System**: For content tests

### Real Data Testing

- Uses actual job content from markdown files
- Tests real URL structure and links
- Validates actual skills and technologies
- Confirms real publication information

### Accessibility Focus

- Uses `jest-axe` for automated a11y testing
- Tests keyboard navigation patterns
- Validates ARIA relationships
- Ensures screen reader compatibility

## CI/CD Integration

The test suite is integrated with GitHub Actions (`test.yml`):

- Runs on Node.js 18.x and 20.x
- Executes all test categories
- Generates coverage reports
- Runs linting and formatting checks
- Builds project to verify integration

## Le Tuan Specific Validations

The tests specifically verify:

1. **Professional Identity**: AI Research Scientist title and description
2. **Current Role**: Postdoctoral Research Scientist at Heudiasyc Lab
3. **PhD Achievement**: RCLED architecture, Neurocomputing publication
4. **Skills**: PyTorch, TensorFlow, Foundation Models, Multimodal AI
5. **Experience**: 4 positions with quantifiable results
6. **Research Focus**: Autonomous systems, multimodal learning, anomaly detection
7. **Contact**: Research collaboration messaging

## Running Tests Locally

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Test Suite**

   ```bash
   npm test
   ```

3. **View Coverage Report**

   ```bash
   npm run test:coverage
   open coverage/lcov-report/index.html
   ```

4. **Debug Failing Tests**
   ```bash
   npm run test:watch
   # Press 'f' to run only failing tests
   ```

## Best Practices

1. **Test Behavior, Not Implementation**: Tests focus on user-facing behavior
2. **Realistic Data**: Uses actual CV content rather than generic test data
3. **Accessibility First**: Every component tested for a11y compliance
4. **Integration Coverage**: Tests data flow from markdown to UI
5. **Visual Consistency**: Validates layout structure preservation
6. **Performance Aware**: Tests include motion preference handling

## Maintenance

- Update tests when adding new job experiences
- Verify accessibility tests when changing interactive elements
- Update content tests when modifying markdown structure
- Review visual tests when changing layouts or styling
- Maintain coverage thresholds as codebase grows
