# Project Components Overview

## Components Created

This document provides an overview of all Lightning Web Components created in this project.

---

## 1. contactCreator

**Location:** `force-app/main/default/lwc/contactCreator/`

### Purpose
Creates new Contact records using `lightning-record-form` with a success toast notification.

### Files
- `contactCreator.html` - Template with lightning-record-form
- `contactCreator.js` - Component logic
- `contactCreator.js-meta.xml` - Metadata configuration
- `__tests__/contactCreator.test.js` - Jest unit tests

### Key Features
- Uses `lightning-record-form` base component
- Fields: FirstName, LastName, Email
- Success handler shows toast with new Contact ID
- Exposed on Lightning App Pages

### Code Structure
```javascript
export default class ContactCreator extends LightningElement {
    objectApiName = CONTACT_OBJECT;
    fields = [FIRST_NAME_FIELD, LAST_NAME_FIELD, EMAIL_FIELD];
    
    handleSuccess(event) {
        // Show toast with record ID
    }
}
```

### Usage Example
```html
<c-contact-creator></c-contact-creator>
```

### Tests
- ✅ Verifies lightning-record-form renders
- ✅ Checks record form has fields configured

---

## 2. contactList

**Location:** `force-app/main/default/lwc/contactList/`

### Purpose
Displays a list of contacts in a datatable with error handling using `reduceErrors` from ldsUtils.

### Files
- `contactList.html` - Template with lightning-datatable
- `contactList.js` - Component logic with @wire and @api
- `contactList.js-meta.xml` - Metadata configuration
- `__tests__/contactList.test.js` - Jest unit tests

### Key Features
- Uses `@wire` to fetch contacts from Apex
- Uses `@api` to expose columns for testing/configuration
- Displays contacts in `lightning-datatable`
- Error handling with `reduceErrors` getter
- Schema references for field names

### Code Structure
```javascript
export default class ContactList extends LightningElement {
    contacts;
    error;
    
    @api
    columns = [...];  // Public columns configuration
    
    @wire(getContacts)
    wiredContacts({ error, data }) {
        // Handle wire adapter response
    }
    
    get errors() {
        return reduceErrors(this.error);  // Process errors
    }
}
```

### Apex Controller
**Class:** `ContactController`
**Method:** `getContacts()`
```java
@AuraEnabled(cacheable=true)
public static List<Contact> getContacts() {
    return [SELECT Id, FirstName, LastName, Email FROM Contact];
}
```

### Usage Example
```html
<c-contact-list></c-contact-list>
```

### Tests
- ✅ Verifies lightning-card renders with correct title
- ✅ Tests columns configuration (3 columns)
- ✅ Validates component structure

---

## 3. accountCreator

**Location:** `force-app/main/default/lwc/accountCreator/`

### Purpose
Creates new Account records using `lightning-record-form` with success notification.

### Files
- `accountCreator.html` - Template
- `accountCreator.js` - Component logic
- `accountCreator.js-meta.xml` - Metadata

### Key Features
- Uses `lightning-record-form` base component
- Fields: Name, AnnualRevenue, Industry
- Success handler shows toast with new Account ID
- Proper case-sensitive class naming (AccountCreator)

### Code Structure
```javascript
export default class AccountCreator extends LightningElement {
    objectApiName = ACCOUNT_OBJECT;
    fields = [NAME_FIELD, REVENUE_FIELD, INDUSTRY_FIELD];
    
    handleSuccess(event) {
        // Show toast with record ID
    }
}
```

### Usage Example
```html
<c-account-creator></c-account-creator>
```

---

## 4. unitTest

**Location:** `force-app/main/default/lwc/unitTest/`

### Purpose
Example component for demonstrating Jest testing concepts and best practices.

### Files
- `unitTest.html` - Simple template
- `unitTest.js` - Minimal JavaScript
- `unitTest.js-meta.xml` - Metadata
- `__tests__/unitTest.test.js` - Example tests

### Key Features
- Simple component for learning testing
- Demonstrates Arrange-Act-Assert pattern
- Shows DOM querying in tests
- Example of lifecycle hooks in tests

### Tests
- ✅ Verifies component renders
- ✅ Tests text content
- ✅ Demonstrates basic Jest assertions

---

## 5. ldsUtils (from LWC Recipes)

**Location:** `force-app/main/default/lwc/ldsUtils/`

### Purpose
Utility module providing helper functions for Lightning Data Service operations.

### Key Functions
- `reduceErrors(errors)` - Formats error messages for display
- Reduces complex error objects to user-friendly strings

### Usage Example
```javascript
import { reduceErrors } from 'c/ldsUtils';

get errors() {
    return reduceErrors(this.error);
}
```

---

## Component Relationships

```
contactCreator
    └── Creates → Contact records

contactList
    ├── Uses → ContactController.getContacts()
    ├── Uses → ldsUtils.reduceErrors()
    └── Displays → Contact records

accountCreator
    └── Creates → Account records

unitTest
    └── Example for → Jest testing patterns

ldsUtils
    └── Used by → contactList (and potentially others)
```

---

## Apex Classes

### ContactController
**Location:** `force-app/main/default/classes/ContactController.cls`

```java
public class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        return [SELECT Id, FirstName, LastName, Email FROM Contact];
    }
}
```

**Features:**
- `@AuraEnabled` makes it accessible to LWC
- `cacheable=true` enables Lightning Data Service caching
- Returns list of contacts with required fields

**Used By:** contactList component

---

## Testing Infrastructure

### Jest Configuration
- **File:** `jest.config.js`
- **Package:** `@salesforce/sfdx-lwc-jest` v7.0.2
- **Test Location:** `__tests__/` folders in each component

### Test Commands
```bash
npm run test:unit              # Run all tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage report
npm run test:unit:debug        # Debug mode
```

### Test Structure
All tests follow the **Arrange-Act-Assert** pattern:
```javascript
it('test description', () => {
    // Arrange - Set up test data
    const element = createElement('c-component', { is: Component });
    
    // Act - Perform action
    document.body.appendChild(element);
    
    // Assert - Verify result
    expect(element.shadowRoot.querySelector('div')).not.toBeNull();
});
```

---

## Deployment Configuration

### `.forceignore`
Ensures tests are tracked in Git but never deployed:
```
**/__tests__/**
```

### `sfdx-project.json`
```json
{
    "packageDirectories": [
        {
            "path": "force-app",
            "default": true
        }
    ],
    "sourceApiVersion": "65.0"
}
```

---

## Key Learnings

### 1. Case Sensitivity
JavaScript class names must be PascalCase and match the component folder name:
- Folder: `contactCreator` (camelCase)
- Class: `ContactCreator` (PascalCase)

### 2. Schema References
Use schema imports for field references:
```javascript
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
```

Benefits:
- Compile-time validation
- Refactoring safety
- Prevents field deletion

### 3. Public vs Private
Use `@api` to make properties testable and configurable:
```javascript
@api columns = [...];  // ✅ Accessible in tests
columns = [...];       // ❌ Private, not testable
```

### 4. Error Handling
Use utility functions for consistent error processing:
```javascript
get errors() {
    return reduceErrors(this.error);
}
```

---

## Next Steps

### Potential Enhancements
1. **Add search functionality** to contactList
2. **Create accountList** component (similar to contactList)
3. **Add filtering/sorting** to datatables
4. **Implement pagination** for large datasets
5. **Add edit functionality** using lightning-record-edit-form
6. **Create relationship views** (Account → Contacts)

### Testing Improvements
1. Add wire adapter mocking for full coverage
2. Test error scenarios more thoroughly
3. Add integration tests
4. Improve test isolation

---

**Last Updated:** November 7, 2025  
**Total Components:** 5  
**Total Tests:** 20 passing  
**Coverage:** Basic structure and configuration

