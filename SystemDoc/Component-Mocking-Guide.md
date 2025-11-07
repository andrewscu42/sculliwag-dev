# Component Mocking Guide for Jest Tests

## Overview

This guide explains how to create stubs (mocks) for components in Jest tests. The `@salesforce/sfdx-lwc-jest` package provides default stubs for Lightning Base Components, but you may need to create custom stubs for other components.

**Official Documentation:** [Salesforce Jest Testing Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest)

**Trailhead:** [Test Lightning Web Components](https://trailhead.salesforce.com/content/learn/modules/test-lightning-web-components)

---

## Default Stubs Provided

The `@salesforce/sfdx-lwc-jest` package automatically provides stubs for:

| Component Type | Examples | Location |
|----------------|----------|----------|
| **Lightning Base Components** | `lightning-button`, `lightning-card`, `lightning-datatable` | `node_modules/@salesforce/sfdx-lwc-jest/src/lightning-stubs/` |

**Key Point:** All Lightning Base Components are automatically stubbed - no configuration needed!

**What are Stubs?** Stubs are programs that simulate components that a module undergoing tests depends on. They allow you to run tests in your local environment while not in a Lightning environment.

---

## When to Create Custom Stubs

| Scenario | Solution |
|----------|----------|
| **Override Lightning Base Component** | Create custom stub in `force-app/test/jest-mocks/lightning/` |
| **Mock Other Namespace Component** | Create stub in `force-app/test/jest-mocks/{namespace}/` |
| **Mock Local LWC Not in Project** | Create stub in `force-app/test/jest-mocks/c/` |

---

## Directory Structure

```
force-app/
└── test/
    └── jest-mocks/
        ├── lightning/          # Override Lightning Base Components
        │   └── button/
        │       ├── button.html
        │       └── button.js
        ├── thunder/            # Mock other namespace components
        │   └── hammerButton/
        │       ├── hammerButton.html
        │       └── hammerButton.js
        └── c/                  # Mock local LWC components
            └── displayPanel/
                ├── displayPanel.html
                └── displayPanel.js
```

**Example Stubs Created:** See `force-app/test/jest-mocks/` for working examples of all three stub types.

---

## Overriding Lightning Base Components

### Step 1: Create Directory Structure
Create: `force-app/test/jest-mocks/lightning/button/`

### Step 2: Create Stub Files

**button.html:**
```html
<template></template>
```

**button.js:**
```javascript
import { LightningElement, api } from 'lwc';

export default class Button extends LightningElement {
    @api disabled;
    @api iconName;
    @api iconPosition;
    @api label;
    @api name;
    @api type;
    @api value;
    @api variant;
}
```

### Step 3: Update jest.config.js

```javascript
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        '^lightning/button$': '<rootDir>/force-app/test/jest-mocks/lightning/button'
    },
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver']
};
```

**Key Points:**
- `moduleNameMapper` maps component imports to stub locations
- Pattern: `'^lightning/button$'` → `'<rootDir>/force-app/test/jest-mocks/lightning/button'`
- `<rootDir>` maps to the Salesforce DX workspace root
- The first dash (`-`) is converted to a forward slash (`/`) - the module resolver treats everything before the first dash as the namespace
- The rest of the component name goes from kebab-case to camelCase

**See example:** [`force-app/test/jest-mocks/lightning/button/`](../force-app/test/jest-mocks/lightning/button/)

---

## Mocking Other Namespace Components

### Example: `thunder-hammer-button`

**Error:** `Cannot find module 'thunder/hammerButton'`

### Solution:

**1. Create stub files:**
- `force-app/test/jest-mocks/thunder/hammerButton/hammerButton.html`
- `force-app/test/jest-mocks/thunder/hammerButton/hammerButton.js`

**2. hammerButton.js:**
```javascript
import { LightningElement, api } from 'lwc';

export default class HammerButton extends LightningElement {
    @api label;
    // Add other @api properties as needed
}
```

**3. Update jest.config.js:**
```javascript
moduleNameMapper: {
    '^thunder/hammerButton$': '<rootDir>/force-app/test/jest-mocks/thunder/hammerButton'
}
```

**Naming Convention:**
- Component: `<thunder-hammer-button>` → Import: `thunder/hammerButton`
- First dash becomes forward slash (namespace separator)
- Remaining kebab-case becomes camelCase

**See example:** [`force-app/test/jest-mocks/thunder/hammerButton/`](../force-app/test/jest-mocks/thunder/hammerButton/)

---

## Mocking Local LWC Components

### Example: `c-display-panel` (not in your project)

**Error:** `Cannot find module 'c/displayPanel'`

### Solution:

**1. Create stub files:**
- `force-app/test/jest-mocks/c/displayPanel/displayPanel.html`
- `force-app/test/jest-mocks/c/displayPanel/displayPanel.js`

**2. displayPanel.js:**
```javascript
import { LightningElement, api } from 'lwc';

export default class DisplayPanel extends LightningElement {
    @api errors;
    @api notes;
    // Add other @api properties passed to component
}
```

**3. Update jest.config.js:**
```javascript
moduleNameMapper: {
    '^c/displayPanel$': '<rootDir>/force-app/test/jest-mocks/c/displayPanel'
}
```

**Important:** Include `@api` decorators for all properties passed to the component in your template.

**See example:** [`force-app/test/jest-mocks/c/displayPanel/`](../force-app/test/jest-mocks/c/displayPanel/)

---

## Module Name Mapping Rules

| Component Tag | Import Path | Jest Config Pattern |
|---------------|-------------|---------------------|
| `<lightning-button>` | `lightning/button` | `'^lightning/button$'` |
| `<thunder-hammer-button>` | `thunder/hammerButton` | `'^thunder/hammerButton$'` |
| `<c-display-panel>` | `c/displayPanel` | `'^c/displayPanel$'` |

**Pattern Rules:**
1. First dash (`-`) becomes forward slash (`/`) - namespace separator
2. Remaining kebab-case becomes camelCase
3. Use `^` (start) and `$` (end) anchors for exact matching

---

## Complete jest.config.js Example

**Current config:** See [`jest.config.js`](../jest.config.js) - currently uses default stubs only.

**Example with custom stubs:**
```javascript
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        // Override Lightning Base Component
        '^lightning/button$': '<rootDir>/force-app/test/jest-mocks/lightning/button',
        
        // Mock other namespace component
        '^thunder/hammerButton$': '<rootDir>/force-app/test/jest-mocks/thunder/hammerButton',
        
        // Mock local LWC component
        '^c/displayPanel$': '<rootDir>/force-app/test/jest-mocks/c/displayPanel'
    },
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver']
};
```

**Note:** Add `moduleNameMapper` entries only when you need to override or mock components. The default Lightning Base Component stubs work automatically.

---

## Stub File Best Practices

### Minimal Stub (Recommended)
```javascript
import { LightningElement, api } from 'lwc';

export default class ComponentName extends LightningElement {
    @api property1;
    @api property2;
    // Only include properties used in tests
}
```

### Advanced Stub (When Needed)
```javascript
import { LightningElement, api } from 'lwc';

export default class ComponentName extends LightningElement {
    @api property1;
    @api property2;
    
    // Add methods if tests need to interact with them
    handleClick() {
        // Custom implementation for testing
    }
}
```

**Guideline:** Start minimal, add complexity only when tests require it.

---

## Troubleshooting

| Issue | Problem | Solution |
|-------|---------|----------|
| **"Cannot find module"** | Stub not created or path wrong | Check directory structure matches import path |
| **"Property not accessible"** | Missing `@api` decorator | Add `@api` to all properties used in tests |
| **"Test still fails"** | Jest config not updated | Verify `moduleNameMapper` entry exists |
| **"Wrong component behavior"** | Stub too simple | Add methods/implementation to stub |

---

## Common Stub Patterns

### Pattern 1: Simple Property Stub
```javascript
import { LightningElement, api } from 'lwc';

export default class SimpleStub extends LightningElement {
    @api label;
    @api value;
}
```

### Pattern 2: Event Emitting Stub
```javascript
import { LightningElement, api } from 'lwc';

export default class EventStub extends LightningElement {
    @api label;
    
    handleClick() {
        this.dispatchEvent(new CustomEvent('click'));
    }
}
```

### Pattern 3: Conditional Rendering Stub
```javascript
import { LightningElement, api } from 'lwc';

export default class ConditionalStub extends LightningElement {
    @api showContent = false;
    
    get hasContent() {
        return this.showContent;
    }
}
```

---

## Testing Without Salesforce Environment

**Key Benefit:** Stubs allow you to run Jest tests locally without:
- ❌ Salesforce org connection
- ❌ Lightning runtime environment
- ❌ Network dependencies

**How It Works:**
- Stubs replace real components with test doubles
- Tests run in Node.js environment (jsdom)
- Fast, isolated, reliable

---

## Related Documentation

- [Jest Module Name Mapping](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)
- [Salesforce Jest Testing Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.unit_testing_using_jest)
- [Wire Service Testing Guide](./Wire-Service-Testing-Guide.md) - For mocking wire adapters

---

**Last Updated:** November 7, 2025  
**Project:** sculliwag-dev  
**Stub Location:** `force-app/test/jest-mocks/` (create as needed)

