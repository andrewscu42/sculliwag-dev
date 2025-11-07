# Jest Testing Guide for Lightning Web Components

## Overview

This guide covers Jest testing setup, patterns, and best practices for Lightning Web Components in this project.

---

## Setup

### Prerequisites
- Node.js installed
- npm installed
- Salesforce DX project

### Installation
```bash
# Install all dependencies (including Jest)
npm install

# Verify Jest is available
npm run test:unit -- --version
```

### Configuration Files

#### `jest.config.js`
```javascript
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver']
};
```

#### `package.json` Scripts
```json
"scripts": {
    "test:unit": "sfdx-lwc-jest",
    "test:unit:watch": "sfdx-lwc-jest --watch",
    "test:unit:debug": "sfdx-lwc-jest --debug",
    "test:unit:coverage": "sfdx-lwc-jest --coverage"
}
```

#### `.forceignore`
```
**/__tests__/**
```
Tests are committed to Git but never deployed to Salesforce.

---

## Test Structure

### Folder Convention
```
componentName/
├── componentName.html
├── componentName.js
├── componentName.js-meta.xml
└── __tests__/
    └── componentName.test.js
```

**Key Points:**
- Folder must be named `__tests__` (double underscore)
- Test file must match component name
- Jest automatically discovers tests in `__tests__/` folders

### Basic Test Template
```javascript
import { createElement } from 'lwc';
import ComponentName from 'c/componentName';

describe('c-component-name', () => {
    afterEach(() => {
        // Clean up DOM after each test
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('test description', () => {
        // Arrange
        const element = createElement('c-component-name', {
            is: ComponentName
        });

        // Act
        document.body.appendChild(element);

        // Assert
        expect(element).toBeTruthy();
    });
});
```

---

## Testing Patterns

### Arrange-Act-Assert (AAA)
All tests follow this three-phase structure:

```javascript
it('displays the correct title', () => {
    // 1. ARRANGE - Set up test conditions
    const element = createElement('c-contact-list', {
        is: ContactList
    });

    // 2. ACT - Perform the action being tested
    document.body.appendChild(element);

    // 3. ASSERT - Verify the expected outcome
    const card = element.shadowRoot.querySelector('lightning-card');
    expect(card.title).toBe('Contact List');
});
```

**Why AAA?**
- **Readable** - Clear structure
- **Maintainable** - Easy to understand intent
- **Consistent** - Standard across all tests

---

## Lifecycle Hooks in Tests

### `afterEach()`
Runs after every test - use for cleanup:
```javascript
afterEach(() => {
    // Reset DOM to ensure test isolation
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});
```

**Why?** Each test should be independent - changes from one test shouldn't affect others.

### `beforeEach()`
Runs before every test - use for setup:
```javascript
let element;

beforeEach(() => {
    element = createElement('c-my-component', {
        is: MyComponent
    });
    document.body.appendChild(element);
});
```

### `beforeAll()` / `afterAll()`
Run once before/after all tests in the suite:
```javascript
beforeAll(() => {
    // One-time setup (e.g., mock complex dependencies)
});

afterAll(() => {
    // One-time cleanup
});
```

---

## Jest Commands

### `describe()`
Groups related tests:
```javascript
describe('c-contact-list', () => {
    describe('when data is loaded', () => {
        // Tests for loaded state
    });
    
    describe('when error occurs', () => {
        // Tests for error state
    });
});
```

### `it()` / `test()`
Defines a single test (both are equivalent):
```javascript
it('renders the component', () => { /* ... */ });
test('renders the component', () => { /* ... */ });
```

**Best Practice:** Use descriptive test names that complete the sentence "it ..."

### `expect()`
Makes assertions about values:
```javascript
expect(element).toBeTruthy();
expect(card.title).toBe('Contact List');
expect(columns).toHaveLength(3);
```

---

## Common Jest Matchers

### Equality Matchers
```javascript
expect(value).toBe(5);              // Exact equality (===)
expect(obj).toEqual({ a: 1 });      // Deep equality (for objects)
expect(value).not.toBe(5);          // Negation
```

### Truthiness Matchers
```javascript
expect(value).toBeTruthy();         // Any truthy value
expect(value).toBeFalsy();          // Any falsy value
expect(value).toBeNull();           // Exactly null
expect(value).toBeUndefined();      // Exactly undefined
expect(value).toBeDefined();        // Not undefined
```

### Number Matchers
```javascript
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);     // Floating point
```

### String Matchers
```javascript
expect(str).toMatch(/pattern/);     // Regex match
expect(str).toContain('substring'); // String contains
```

### Array/Object Matchers
```javascript
expect(arr).toHaveLength(3);
expect(arr).toContain('item');
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
```

---

## Testing Lightning Web Components

### Querying the Shadow DOM
```javascript
// Query within shadow DOM
const div = element.shadowRoot.querySelector('div');
const inputs = element.shadowRoot.querySelectorAll('lightning-input');

// Check if element exists
expect(div).not.toBeNull();
expect(div).toBeTruthy();
```

### Testing Public Properties (`@api`)
```javascript
it('can access public property', () => {
    const element = createElement('c-contact-list', {
        is: ContactList
    });
    document.body.appendChild(element);
    
    // Only works if property has @api decorator
    expect(element.columns).toHaveLength(3);
});
```

### Testing Private Properties
```javascript
// ❌ Can't directly access private properties
// expect(element.privateProperty).toBe(value);

// ✅ Test through public behavior
const card = element.shadowRoot.querySelector('lightning-card');
expect(card.title).toBe('Expected Title');
```

### Testing Getters
```javascript
it('uses errors getter', () => {
    const element = createElement('c-contact-list', {
        is: ContactList
    });
    document.body.appendChild(element);
    
    // Test the getter's return value
    expect(element.errors).toBeTruthy();
    expect(typeof element.errors).toBe('string');
});
```

### Testing Event Handlers
```javascript
it('handles button click', () => {
    const element = createElement('c-my-component', {
        is: MyComponent
    });
    document.body.appendChild(element);
    
    // Create and dispatch event
    const button = element.shadowRoot.querySelector('lightning-button');
    button.click();
    
    // Verify result
    const output = element.shadowRoot.querySelector('.output');
    expect(output.textContent).toBe('Clicked!');
});
```

### Async Testing
```javascript
it('updates after async operation', async () => {
    const element = createElement('c-my-component', {
        is: MyComponent
    });
    document.body.appendChild(element);
    
    // Trigger async operation
    const button = element.shadowRoot.querySelector('button');
    button.click();
    
    // Wait for DOM updates
    await Promise.resolve();
    
    // Verify result
    const result = element.shadowRoot.querySelector('.result');
    expect(result.textContent).toBe('Done');
});
```

---

## Test Examples from Project

### Example 1: contactCreator Tests
```javascript
import { createElement } from 'lwc';
import ContactCreator from 'c/contactCreator';

describe('c-contact-creator', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders lightning-record-form with correct properties', () => {
        // Arrange
        const element = createElement('c-contact-creator', {
            is: ContactCreator
        });

        // Act
        document.body.appendChild(element);

        // Assert
        const recordForm = element.shadowRoot.querySelector('lightning-record-form');
        expect(recordForm).not.toBeNull();
        expect(recordForm.objectApiName).toBeTruthy();
    });

    it('has three fields configured', () => {
        // Arrange
        const element = createElement('c-contact-creator', {
            is: ContactCreator
        });

        // Act
        document.body.appendChild(element);

        // Assert
        const recordForm = element.shadowRoot.querySelector('lightning-record-form');
        expect(recordForm).not.toBeNull();
        expect(recordForm.fields).toBeTruthy();
    });
});
```

### Example 2: contactList Tests
```javascript
import { createElement } from 'lwc';
import ContactList from 'c/contactList';

describe('c-contact-list', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders lightning-card with title', () => {
        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        const card = element.shadowRoot.querySelector('lightning-card');
        expect(card).not.toBeNull();
        expect(card.title).toBe('Contact List');
    });

    it('has three columns configured for datatable', () => {
        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        expect(element.columns).toHaveLength(3);
        expect(element.columns[0].label).toBe('First Name');
        expect(element.columns[1].label).toBe('Last Name');
        expect(element.columns[2].label).toBe('Email');
    });
});
```

### Example 3: unitTest Tests
```javascript
import { createElement } from 'lwc';
import UnitTest from 'c/unitTest';

describe('c-unit-test', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays the unit test component', () => {
        const element = createElement('c-unit-test', {
            is: UnitTest
        });
        document.body.appendChild(element);

        const div = element.shadowRoot.querySelector('div');
        expect(div).not.toBeNull();
    });

    it('displays the correct text', () => {
        const element = createElement('c-unit-test', {
            is: UnitTest
        });
        document.body.appendChild(element);

        const p = element.shadowRoot.querySelector('p');
        expect(p.textContent).toBe('Unit Test Component');
    });
});
```

---

## Running Tests

### Run All Tests
```bash
npm run test:unit
```

**Output:**
```
Test Suites: 4 passed, 4 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        1.289 s
```

### Run Specific Component Tests
```bash
npm run test:unit -- contactList
npm run test:unit -- unitTest
```

### Watch Mode (Auto-run on Changes)
```bash
npm run test:unit:watch
```

Press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `q` - Quit

### Coverage Report
```bash
npm run test:unit:coverage
```

**Output includes:**
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
- HTML report in `coverage/` folder

### Debug Mode
```bash
npm run test:unit:debug
```

Then open Chrome and navigate to `chrome://inspect`

---

## Best Practices

### 1. Test One Thing Per Test
```javascript
// ❌ Bad - Testing multiple things
it('renders and has correct data', () => {
    expect(element).toBeTruthy();
    expect(element.data).toHaveLength(5);
    expect(element.title).toBe('Title');
});

// ✅ Good - One assertion per test
it('renders the component', () => {
    expect(element).toBeTruthy();
});

it('displays correct number of items', () => {
    expect(element.data).toHaveLength(5);
});

it('shows the correct title', () => {
    expect(element.title).toBe('Title');
});
```

### 2. Use Descriptive Test Names
```javascript
// ❌ Bad
it('test 1', () => { /* ... */ });
it('works', () => { /* ... */ });

// ✅ Good
it('renders lightning-card with title', () => { /* ... */ });
it('displays three columns in datatable', () => { /* ... */ });
it('shows error message when wire adapter fails', () => { /* ... */ });
```

### 3. Test Behavior, Not Implementation
```javascript
// ❌ Bad - Testing internal implementation
it('calls handleClick method', () => {
    expect(element.handleClick).toHaveBeenCalled();
});

// ✅ Good - Testing user-visible behavior
it('updates display when button is clicked', () => {
    button.click();
    expect(output.textContent).toBe('Updated');
});
```

### 4. Keep Tests Independent
```javascript
// ❌ Bad - Tests depend on each other
let sharedElement;

it('creates element', () => {
    sharedElement = createElement('c-component', { is: Component });
});

it('uses element', () => {
    expect(sharedElement.data).toBe('value'); // Fails if first test doesn't run
});

// ✅ Good - Each test is independent
it('test one', () => {
    const element = createElement('c-component', { is: Component });
    expect(element).toBeTruthy();
});

it('test two', () => {
    const element = createElement('c-component', { is: Component });
    expect(element.data).toBe('value');
});
```

### 5. Clean Up After Tests
```javascript
afterEach(() => {
    // Always clean up DOM
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
    
    // Clear mocks if using them
    jest.clearAllMocks();
});
```

---

## Common Patterns

### Pattern: Test Component Renders
```javascript
it('renders without crashing', () => {
    const element = createElement('c-component', { is: Component });
    expect(() => {
        document.body.appendChild(element);
    }).not.toThrow();
});
```

### Pattern: Test Element Exists
```javascript
it('contains expected element', () => {
    const element = createElement('c-component', { is: Component });
    document.body.appendChild(element);
    
    const child = element.shadowRoot.querySelector('.expected-class');
    expect(child).not.toBeNull();
});
```

### Pattern: Test Text Content
```javascript
it('displays correct text', () => {
    const element = createElement('c-component', { is: Component });
    document.body.appendChild(element);
    
    const text = element.shadowRoot.querySelector('p').textContent;
    expect(text).toBe('Expected Text');
});
```

### Pattern: Test Conditional Rendering
```javascript
it('shows error message when error exists', () => {
    const element = createElement('c-component', { is: Component });
    element.error = { message: 'Error occurred' };
    document.body.appendChild(element);
    
    const errorDiv = element.shadowRoot.querySelector('.error');
    expect(errorDiv).not.toBeNull();
});
```

---

## Troubleshooting

### Issue: "Property is not publicly accessible"
**Problem:** Trying to access private property in test

**Solution:** Add `@api` decorator to make property public
```javascript
// Component
@api columns = [...];  // Now accessible in tests
```

### Issue: "Cannot find module"
**Problem:** Import path is wrong

**Solution:** Check import format
```javascript
import Component from 'c/componentName';  // ✅ Correct
import Component from './componentName';  // ❌ Wrong for LWC
```

### Issue: "Tests don't run in watch mode"
**Problem:** Git not initialized

**Solution:** Initialize Git
```bash
git init
```

### Issue: "querySelector returns null"
**Problem:** Querying too early or wrong selector

**Solution:** Check timing and selector
```javascript
// Wait for async updates
await Promise.resolve();

// Use correct selector
element.shadowRoot.querySelector('.class-name');  // Not #id or wrong class
```

---

## Resources

### Official Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Salesforce Jest Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest)
- [@salesforce/sfdx-lwc-jest on npm](https://www.npmjs.com/package/@salesforce/sfdx-lwc-jest)
- [LWC Testing Recipes](https://github.com/trailheadapps/lwc-recipes)

### VS Code Extensions
- **Salesforce Extension Pack** - Run tests from sidebar
- **Jest Runner** - Run individual tests with keyboard shortcuts

---

**Last Updated:** November 7, 2025  
**Jest Version:** Included in @salesforce/sfdx-lwc-jest v7.0.2  
**Total Tests in Project:** 20 passing

