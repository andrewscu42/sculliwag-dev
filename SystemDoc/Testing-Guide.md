# Jest Testing Guide for Lightning Web Components

## Overview

This guide covers Jest testing setup, patterns, and best practices for Lightning Web Components in this project.

**Official Documentation:** [Salesforce Jest Testing Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest)

**Trailhead:** [Test Lightning Web Components](https://trailhead.salesforce.com/content/learn/modules/test-lightning-web-components)

---

## Setup

### Prerequisites
- Node.js installed
- npm installed
- Salesforce DX project

### Installation
```bash
npm install
npm run test:unit -- --version
```

### Configuration Files

**See project files:**
- `jest.config.js` - Jest configuration
- `package.json` - Test scripts (lines 6-12)
- `.forceignore` - Excludes `**/__tests__/**` from deployment

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

**See example:** [`force-app/main/default/lwc/unitTest/__tests__/unitTest.test.js`](../force-app/main/default/lwc/unitTest/__tests__/unitTest.test.js)

---

## Testing Patterns

### Arrange-Act-Assert (AAA)
All tests follow this three-phase structure:
1. **ARRANGE** - Set up test conditions
2. **ACT** - Perform the action being tested
3. **ASSERT** - Verify the expected outcome

**Why AAA?**
- **Readable** - Clear structure
- **Maintainable** - Easy to understand intent
- **Consistent** - Standard across all tests

**See examples:** [`force-app/main/default/lwc/contactList/__tests__/contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js)

---

## Lifecycle Hooks in Tests

| Hook | When It Runs | Use Case |
|------|--------------|----------|
| `beforeAll()` | Once before all tests | One-time setup |
| `beforeEach()` | Before each test | Common setup |
| `afterEach()` | After each test | Cleanup (DOM, mocks) |
| `afterAll()` | Once after all tests | One-time cleanup |

**Why `afterEach()`?** Each test should be independent - changes from one test shouldn't affect others.

**See example:** [`force-app/main/default/lwc/contactCreator/__tests__/contactCreator.test.js`](../force-app/main/default/lwc/contactCreator/__tests__/contactCreator.test.js) (lines 5-10)

---

## Jest Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `describe()` | Groups related tests | `describe('c-component', () => { ... })` |
| `it()` / `test()` | Defines a single test | `it('renders component', () => { ... })` |
| `expect()` | Makes assertions | `expect(element).toBeTruthy()` |

**Best Practice:** Use descriptive test names that complete the sentence "it ..."

**See examples:** All test files in `force-app/main/default/lwc/*/__tests__/`

---

## Common Jest Matchers

| Category | Matcher | Purpose |
|----------|--------|---------|
| **Equality** | `toBe()` | Exact equality (===) |
| | `toEqual()` | Deep equality (objects/arrays) |
| | `not.toBe()` | Negation |
| **Truthiness** | `toBeTruthy()` | Any truthy value |
| | `toBeFalsy()` | Any falsy value |
| | `toBeNull()` | Exactly null |
| | `toBeUndefined()` | Exactly undefined |
| **Numbers** | `toBeGreaterThan()` | Number comparison |
| | `toBeLessThan()` | Number comparison |
| **Strings** | `toMatch()` | Regex match |
| | `toContain()` | String contains |
| **Arrays/Objects** | `toHaveLength()` | Array length |
| | `toContain()` | Array contains item |
| | `toHaveProperty()` | Object has property |

**Full Reference:** [Jest Matchers Documentation](https://jestjs.io/docs/expect)

---

## Testing Lightning Web Components

| Testing Aspect | Approach | Example File |
|----------------|----------|-------------|
| **Shadow DOM Querying** | Use `element.shadowRoot.querySelector()` | All test files |
| **Public Properties (`@api`)** | Direct access works | [`contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js) (lines 27-41) |
| **Private Properties** | Test through public behavior | [`contactCreator.test.js`](../force-app/main/default/lwc/contactCreator/__tests__/contactCreator.test.js) |
| **Getters** | Test return value | [`contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js) |
| **Event Handlers** | Trigger events, verify results | See component test files |
| **Async Operations** | Use `await Promise.resolve()` | [`contactListWire.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactListWire.test.js) |
| **Wire Adapters** | Mock wire adapters | [`Wire-Service-Testing-Guide.md`](./Wire-Service-Testing-Guide.md) |

---

## Test Examples from Project

| Component | Test File | What It Tests |
|-----------|-----------|---------------|
| **contactCreator** | [`contactCreator.test.js`](../force-app/main/default/lwc/contactCreator/__tests__/contactCreator.test.js) | Record form rendering, field configuration |
| **contactList** | [`contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js) | Card rendering, columns configuration |
| **contactList (Wire)** | [`contactListWire.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactListWire.test.js) | Wire adapter mocking, error handling |
| **unitTest** | [`unitTest.test.js`](../force-app/main/default/lwc/unitTest/__tests__/unitTest.test.js) | Basic component rendering, text content |
| **wireServiceExample** | [`wireServiceExample.test.js`](../force-app/main/default/lwc/wireServiceExample/__tests__/wireServiceExample.test.js) | Complete wire service testing examples |

---

## Running Tests

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run test:unit` | Run all tests | Test results summary |
| `npm run test:unit -- componentName` | Run specific component | Filtered results |
| `npm run test:unit:watch` | Watch mode (auto-run) | Interactive mode (press `a`, `f`, `p`, `q`) |
| `npm run test:unit:coverage` | With coverage report | Coverage metrics + HTML report |
| `npm run test:unit:debug` | Debug mode | Chrome DevTools integration |

**See:** `package.json` (lines 6-12) for all test scripts

---

## Best Practices

| Practice | Description | Example |
|----------|-------------|---------|
| **Test One Thing** | One assertion per test | See: [`contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js) |
| **Descriptive Names** | Complete "it ..." sentences | `it('renders lightning-card with title', ...)` |
| **Test Behavior** | Test user-visible behavior, not implementation | Test DOM output, not method calls |
| **Independent Tests** | Each test stands alone | No shared state between tests |
| **Clean Up** | Always use `afterEach()` for cleanup | Reset DOM, clear mocks |

**See examples:** All test files follow these patterns

---

## Common Patterns

| Pattern | Description | Example File |
|---------|-------------|--------------|
| **Component Renders** | Verify component loads without errors | [`unitTest.test.js`](../force-app/main/default/lwc/unitTest/__tests__/unitTest.test.js) |
| **Element Exists** | Check for specific DOM elements | [`contactCreator.test.js`](../force-app/main/default/lwc/contactCreator/__tests__/contactCreator.test.js) |
| **Text Content** | Verify displayed text | [`unitTest.test.js`](../force-app/main/default/lwc/unitTest/__tests__/unitTest.test.js) (line 44) |
| **Conditional Rendering** | Test `if:true` / `if:false` logic | [`contactListWire.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactListWire.test.js) |

---

## Troubleshooting

| Issue | Problem | Solution |
|-------|---------|----------|
| **"Property is not publicly accessible"** | Trying to access private property | Add `@api` decorator - see [`LWC-Decorators-Guide.md`](./LWC-Decorators-Guide.md) |
| **"Cannot find module"** | Wrong import path | Use `c/componentName` format, not relative paths |
| **"Tests don't run in watch mode"** | Git not initialized | Run `git init` |
| **"querySelector returns null"** | Querying too early | Use `await Promise.resolve()` for async updates |

**More Help:** [Salesforce Jest Troubleshooting](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest)

---

## Resources

| Resource Type | Links |
|--------------|-------|
| **Official Docs** | [Jest Docs](https://jestjs.io/docs/getting-started), [Salesforce Jest Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest), [@salesforce/sfdx-lwc-jest](https://www.npmjs.com/package/@salesforce/sfdx-lwc-jest) |
| **Trailhead** | [Test Lightning Web Components](https://trailhead.salesforce.com/content/learn/modules/test-lightning-web-components) |
| **Related Guides** | [Wire Service Testing Guide](./Wire-Service-Testing-Guide.md), [LWC Decorators Guide](./LWC-Decorators-Guide.md) |

---

**Last Updated:** November 7, 2025  
**Jest Version:** Included in @salesforce/sfdx-lwc-jest v7.0.2  
**Total Tests in Project:** 30+ passing

