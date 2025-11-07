# Wire Service Testing Guide

## Overview

This guide explains how to test Lightning Web Components that use the `@wire` decorator with the three primary wire adapter types. The wire service is reactive and uses Lightning Data Service to read Salesforce data.

---

## Three Primary Wire Adapters

### 1. **Generic Wire Adapter**
- **Purpose**: Basic wire adapter for custom functions
- **API**: `createTestWireAdapter()`
- **Features**: Emits data on demand, no extra metadata
- **Use Case**: Custom wire functions, simple data mocking

### 2. **Lightning Data Service (LDS) Wire Adapter**
- **Purpose**: Mimics Lightning Data Service behavior
- **API**: `createLdsTestWireAdapter()`
- **Features**: Includes data properties, mimics LDS structure
- **Use Case**: Testing `getRecord`, `getObjectInfo`, `getPicklistValues`, etc.

### 3. **Apex Wire Adapter**
- **Purpose**: Mimics Apex method calls
- **API**: `createApexTestWireAdapter()`
- **Features**: Includes error status, mimics Apex response structure
- **Use Case**: Testing `@wire` with `@salesforce/apex` methods

---

## Reactive Variables

Reactive variables are prefixed with `$` and cause the wire service to re-provision data when they change.

### Example Component
```javascript
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

export default class Record extends LightningElement {
    @api recordId;  // Public property
    
    // $recordId makes it reactive - wire adapter re-runs when recordId changes
    @wire(getRecord, { 
        recordId: '$recordId',  // ← $ prefix makes it reactive
        fields: [ACCOUNT_NAME_FIELD] 
    })
    wiredRecord;
}
```

### Testing Reactive Variables
When testing, changing the reactive property should trigger the wire adapter to re-run:

```javascript
it('reacts to reactive variable changes', () => {
    const element = createElement('c-record', { is: Record });
    element.recordId = '001AAA';  // Initial value
    document.body.appendChild(element);
    
    const { createLdsTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
    const getRecordAdapter = createLdsTestWireAdapter(getRecord);
    
    // Emit first record
    getRecordAdapter.emit({ fields: { Name: { value: 'First' } } });
    
    return Promise.resolve().then(() => {
        expect(element.wiredRecord.data.fields.Name.value).toBe('First');
        
        // Change reactive variable
        element.recordId = '001BBB';  // Wire adapter should react
        
        // Emit second record
        getRecordAdapter.emit({ fields: { Name: { value: 'Second' } } });
        
        return Promise.resolve().then(() => {
            expect(element.wiredRecord.data.fields.Name.value).toBe('Second');
        });
    });
});
```

---

## Testing LDS Wire Adapter (getRecord)

### Component Example
```javascript
import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

export default class AccountDisplay extends LightningElement {
    @api recordId;
    
    @wire(getRecord, { 
        recordId: '$recordId', 
        fields: [ACCOUNT_NAME_FIELD] 
    })
    wiredRecord;
    
    get accountName() {
        return getFieldValue(this.wiredRecord.data, ACCOUNT_NAME_FIELD);
    }
}
```

### Test Example
```javascript
import { createElement } from 'lwc';
import AccountDisplay from 'c/accountDisplay';
import { getRecord } from 'lightning/uiRecordApi';

describe('c-account-display', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays account name when record data is loaded', () => {
        // Arrange
        const RECORD_ID = '001000000000000AAA';
        const MOCK_RECORD = {
            apiName: 'Account',
            fields: {
                Name: {
                    value: 'Acme Corporation'
                }
            }
        };

        const element = createElement('c-account-display', {
            is: AccountDisplay
        });
        element.recordId = RECORD_ID;
        document.body.appendChild(element);

        // Act - Emit data using LDS wire adapter
        const { createLdsTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getRecordAdapter = createLdsTestWireAdapter(getRecord);
        getRecordAdapter.emit(MOCK_RECORD);

        // Wait for DOM updates
        return Promise.resolve().then(() => {
            // Assert
            expect(element.accountName).toBe('Acme Corporation');
            expect(element.wiredRecord.data).toEqual(MOCK_RECORD);
        });
    });

    it('displays error message when record load fails', () => {
        // Arrange
        const RECORD_ID = '001000000000000AAA';
        const MOCK_ERROR = {
            body: {
                message: 'Record not found'
            }
        };

        const element = createElement('c-account-display', {
            is: AccountDisplay
        });
        element.recordId = RECORD_ID;
        document.body.appendChild(element);

        // Act - Emit error using LDS wire adapter
        const { createLdsTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getRecordAdapter = createLdsTestWireAdapter(getRecord);
        getRecordAdapter.error(MOCK_ERROR);

        // Wait for DOM updates
        return Promise.resolve().then(() => {
            // Assert
            expect(element.wiredRecord.error).toBeTruthy();
            expect(element.wiredRecord.error.body.message).toBe('Record not found');
        });
    });
});
```

### Key Points for LDS Adapter
- Use `createLdsTestWireAdapter()` from `@salesforce/sfdx-lwc-jest`
- Mock data structure should match LDS format (with `apiName`, `fields`, etc.)
- Use `.emit(data)` for successful responses
- Use `.error(error)` for error responses

---

## Testing Apex Wire Adapter

### Component Example
```javascript
import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class ContactList extends LightningElement {
    contacts;
    error;

    @wire(getContacts)
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }
}
```

### Test Example
```javascript
import { createElement } from 'lwc';
import ContactList from 'c/contactList';
import getContacts from '@salesforce/apex/ContactController.getContacts';

// Mock the Apex wire adapter
jest.mock(
    '@salesforce/apex/ContactController.getContacts',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

describe('c-contact-list', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays contacts when Apex method returns data', () => {
        // Arrange
        const MOCK_CONTACTS = [
            { 
                Id: '003000000000000AAA', 
                FirstName: 'Lisa', 
                LastName: 'Jones', 
                Email: 'ljones@developer.com' 
            }
        ];

        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        // Act - Emit data using Apex wire adapter
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getContactsAdapter = createApexTestWireAdapter(jest.fn());
        getContactsAdapter.emit(MOCK_CONTACTS);

        // Wait for DOM updates
        return Promise.resolve().then(() => {
            // Assert
            expect(element.contacts).toEqual(MOCK_CONTACTS);
            expect(element.contacts).toHaveLength(1);
        });
    });

    it('displays error when Apex method fails', () => {
        // Arrange
        const MOCK_ERROR = {
            body: {
                message: 'Insufficient access rights'
            }
        };

        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        // Act - Emit error using Apex wire adapter
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getContactsAdapter = createApexTestWireAdapter(jest.fn());
        getContactsAdapter.error(MOCK_ERROR);

        // Wait for DOM updates
        return Promise.resolve().then(() => {
            // Assert
            expect(element.error).toBeTruthy();
            expect(element.error.body.message).toBe('Insufficient access rights');
        });
    });
});
```

### Key Points for Apex Adapter
- **Must mock the Apex import** using `jest.mock()` with `{ virtual: true }`
- Use `createApexTestWireAdapter(jest.fn())` in the mock
- Apex errors typically have `body.message` structure
- Use `.emit(data)` for successful responses
- Use `.error(error)` for error responses

---

## Testing Generic Wire Adapter

### Component Example
```javascript
import { LightningElement, wire } from 'lwc';

// Custom wire function
function getCustomData() {
    return { data: 'value' };
}

export default class CustomComponent extends LightningElement {
    @wire(getCustomData)
    wiredData;
}
```

### Test Example
```javascript
import { createElement } from 'lwc';
import CustomComponent from 'c/customComponent';

describe('c-custom-component', () => {
    it('can use generic adapter for custom wire functions', () => {
        // Arrange
        const MOCK_DATA = { customField: 'customValue' };

        const element = createElement('c-custom-component', {
            is: CustomComponent
        });
        document.body.appendChild(element);

        // Act - Use generic wire adapter
        const { createTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const genericAdapter = createTestWireAdapter(jest.fn());
        genericAdapter.emit(MOCK_DATA);

        // Assert
        return Promise.resolve().then(() => {
            expect(genericAdapter).toBeTruthy();
            // Verify data was emitted
        });
    });
});
```

### Key Points for Generic Adapter
- Use `createTestWireAdapter()` for generic/custom wire functions
- Simpler than LDS/Apex adapters - no special structure required
- Use `.emit(data)` to send data

---

## Complete Example Component

See `wireServiceExample` component for a complete example using both LDS and Apex wire adapters:

**Location:** `force-app/main/default/lwc/wireServiceExample/`

**Features:**
- LDS wire adapter (`getRecord`) with reactive `$recordId`
- Apex wire adapter (`getContacts`)
- Error handling with `reduceErrors`
- Getter methods using `getFieldValue`

**Test File:** `__tests__/wireServiceExample.test.js`

---

## Testing Patterns

### Pattern 1: Test Successful Data Load
```javascript
it('displays data when wire adapter succeeds', () => {
    // Arrange
    const element = createElement('c-component', { is: Component });
    document.body.appendChild(element);
    
    // Act
    const adapter = createLdsTestWireAdapter(getRecord);
    adapter.emit(MOCK_DATA);
    
    // Assert
    return Promise.resolve().then(() => {
        expect(element.data).toEqual(MOCK_DATA);
    });
});
```

### Pattern 2: Test Error Handling
```javascript
it('displays error when wire adapter fails', () => {
    // Arrange
    const element = createElement('c-component', { is: Component });
    document.body.appendChild(element);
    
    // Act
    const adapter = createApexTestWireAdapter(jest.fn());
    adapter.error(MOCK_ERROR);
    
    // Assert
    return Promise.resolve().then(() => {
        expect(element.error).toBeTruthy();
    });
});
```

### Pattern 3: Test Reactive Variables
```javascript
it('reacts to reactive variable changes', () => {
    const element = createElement('c-component', { is: Component });
    element.recordId = '001AAA';
    document.body.appendChild(element);
    
    const adapter = createLdsTestWireAdapter(getRecord);
    adapter.emit(FIRST_DATA);
    
    return Promise.resolve().then(() => {
        expect(element.data).toEqual(FIRST_DATA);
        
        // Change reactive variable
        element.recordId = '001BBB';
        adapter.emit(SECOND_DATA);
        
        return Promise.resolve().then(() => {
            expect(element.data).toEqual(SECOND_DATA);
        });
    });
});
```

### Pattern 4: Test State Transitions
```javascript
it('clears error when data is successfully loaded', () => {
    const element = createElement('c-component', { is: Component });
    document.body.appendChild(element);
    
    const adapter = createApexTestWireAdapter(jest.fn());
    
    // First emit error
    adapter.error(MOCK_ERROR);
    
    return Promise.resolve().then(() => {
        expect(element.error).toBeTruthy();
        
        // Then emit data
        adapter.emit(MOCK_DATA);
        
        return Promise.resolve().then(() => {
            expect(element.error).toBeUndefined();
            expect(element.data).toEqual(MOCK_DATA);
        });
    });
});
```

---

## Common Issues & Solutions

### Issue: "Cannot find module" when mocking Apex
**Problem:** Apex mock not set up correctly

**Solution:** Use `{ virtual: true }` in `jest.mock()`:
```javascript
jest.mock(
    '@salesforce/apex/Controller.method',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }  // ← Required for Apex mocks
);
```

### Issue: Wire adapter not emitting data
**Problem:** Forgetting to wait for async updates

**Solution:** Use `Promise.resolve()` to wait:
```javascript
adapter.emit(MOCK_DATA);

return Promise.resolve().then(() => {
    // Now assertions will work
    expect(element.data).toEqual(MOCK_DATA);
});
```

### Issue: Reactive variable not triggering wire adapter
**Problem:** Not using `$` prefix in component

**Solution:** Ensure reactive variables use `$` prefix:
```javascript
// Component
@wire(getRecord, { recordId: '$recordId' })  // ← $ makes it reactive
wiredRecord;
```

---

## API Reference

### `createLdsTestWireAdapter(wireAdapter)`
Creates a test wire adapter for Lightning Data Service adapters.

**Parameters:**
- `wireAdapter` - The LDS adapter function (e.g., `getRecord`)

**Returns:** Wire adapter with `.emit(data)` and `.error(error)` methods

**Example:**
```javascript
const adapter = createLdsTestWireAdapter(getRecord);
adapter.emit({ fields: { Name: { value: 'Test' } } });
```

### `createApexTestWireAdapter(mockFn)`
Creates a test wire adapter for Apex methods.

**Parameters:**
- `mockFn` - Jest mock function (typically `jest.fn()`)

**Returns:** Wire adapter with `.emit(data)` and `.error(error)` methods

**Example:**
```javascript
const adapter = createApexTestWireAdapter(jest.fn());
adapter.emit([{ Id: '001', Name: 'Test' }]);
```

### `createTestWireAdapter(mockFn)`
Creates a generic test wire adapter.

**Parameters:**
- `mockFn` - Jest mock function

**Returns:** Wire adapter with `.emit(data)` method

**Example:**
```javascript
const adapter = createTestWireAdapter(jest.fn());
adapter.emit({ customData: 'value' });
```

---

## Best Practices

### 1. **Always Mock Apex Imports**
```javascript
// ✅ Good - Mock Apex imports
jest.mock('@salesforce/apex/Controller.method', () => {
    const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
    return {
        default: createApexTestWireAdapter(jest.fn())
    };
}, { virtual: true });
```

### 2. **Wait for Async Updates**
```javascript
// ✅ Good - Wait for Promise resolution
adapter.emit(data);
return Promise.resolve().then(() => {
    expect(element.data).toEqual(data);
});
```

### 3. **Test Both Success and Error Paths**
```javascript
// ✅ Good - Test both scenarios
it('handles successful data load', () => { /* ... */ });
it('handles error scenarios', () => { /* ... */ });
```

### 4. **Use Descriptive Mock Data**
```javascript
// ✅ Good - Clear mock data
const MOCK_CONTACT = {
    Id: '003000000000000AAA',
    FirstName: 'Lisa',
    LastName: 'Jones',
    Email: 'ljones@developer.com'
};
```

### 5. **Clean Up After Tests**
```javascript
// ✅ Good - Always clean up
afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});
```

---

## Related Documentation

- [Salesforce Wire Service Documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_wire_service_about)
- [Lightning Data Service Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_ui_api)
- [Jest Testing Guide](./Testing-Guide.md)
- [LWC Decorators Guide](./LWC-Decorators-Guide.md)

---

## Example Test Files

1. **wireServiceExample.test.js** - Complete example with all three adapter types
2. **contactListWire.test.js** - Apex wire adapter testing example
3. **contactList.test.js** - Basic component structure tests

---

**Last Updated:** November 7, 2025  
**Project:** sculliwag-dev  
**Components:** wireServiceExample, contactList  
**Test Files:** 3 wire service test examples

