# Lightning Web Components - Decorators Guide

## Overview

This guide explains the purpose and usage of `@api` and `@wire` decorators in Lightning Web Components, with examples from the `contactList` component.

---

## `@api` Decorator

### Purpose
Makes a property or method **public** - accessible from outside the component.

### Syntax
```javascript
import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @api
    publicProperty = 'value';
    
    @api
    publicMethod() {
        // method logic
    }
}
```

### Use Cases

#### 1. **Component Configuration**
Allow parent components to pass in configuration:

```javascript
// Child component
@api recordId;
@api isReadOnly = false;
```

```html
<!-- Parent component -->
<c-my-component record-id={contactId} is-read-only></c-my-component>
```

#### 2. **Testing**
Make properties accessible in Jest tests:

```javascript
// Component
@api
columns = [
    { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Last Name', fieldName: 'LastName' }
];
```

```javascript
// Test
it('has correct columns', () => {
    const element = createElement('c-my-component', { is: MyComponent });
    expect(element.columns).toHaveLength(2);  // ✅ Works
});
```

#### 3. **Reusable Components**
Create flexible components that adapt to different contexts:

```javascript
@api title = 'Default Title';
@api showIcon = true;
@api variant = 'base';
```

### Public vs Private

| Without `@api` (Private) | With `@api` (Public) |
|-------------------------|---------------------|
| Only accessible within component | Accessible from parent components |
| Not accessible in tests | Accessible in tests |
| Internal implementation detail | Part of component's public API |

---

## `@wire` Decorator

### Purpose
Connects your component to **reactive data** from Salesforce - automatically updates when data changes.

### Syntax

#### Wire to a Function (Most Common)
```javascript
import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class MyComponent extends LightningElement {
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

#### Wire to a Property (Simple Cases)
```javascript
@wire(getContacts) contacts;
```

### Use Cases

#### 1. **Apex Methods**
Call server-side Apex methods:

```javascript
import getContacts from '@salesforce/apex/ContactController.getContacts';

@wire(getContacts)
wiredContacts({ error, data }) {
    // Handle response
}
```

#### 2. **Lightning Data Service (LDS)**
Read Salesforce records using standard adapters:

```javascript
import { getRecord } from 'lightning/uiRecordApi';

@wire(getRecord, { recordId: '$recordId', fields: FIELDS })
wiredRecord({ error, data }) {
    // Handle response
}
```

#### 3. **Dynamic Parameters**
Pass reactive parameters using `$` prefix:

```javascript
@api recordId;  // Public property

@wire(getRecord, { recordId: '$recordId' })  // $ makes it reactive
wiredRecord({ error, data }) {
    // Automatically re-runs when recordId changes
}
```

### Benefits of `@wire`

| Feature | Benefit |
|---------|---------|
| **Automatic invocation** | Runs when component loads |
| **Reactive updates** | Re-runs when parameters change |
| **Caching** | Uses Lightning Data Service cache |
| **Error handling** | Built-in error/data separation |
| **Performance** | Minimizes server calls |

### Manual Apex Calls vs `@wire`

#### ❌ Manual Approach (Imperative)
```javascript
import { LightningElement } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class MyComponent extends LightningElement {
    contacts;
    
    connectedCallback() {
        getContacts()
            .then(result => {
                this.contacts = result;
            })
            .catch(error => {
                console.error(error);
            });
    }
}
```

**Downsides:**
- No caching
- No automatic updates
- More code to write
- Must manually handle component lifecycle

#### ✅ `@wire` Approach (Declarative)
```javascript
import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

export default class MyComponent extends LightningElement {
    @wire(getContacts)
    contacts;
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Automatic updates
- ✅ Less code
- ✅ Follows Lightning best practices

---

## Real Example: contactList Component

```javascript
import { LightningElement, wire, api } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import { reduceErrors } from 'c/ldsUtils';

export default class ContactList extends LightningElement {
    contacts;
    error;

    // @api makes columns accessible to parent components and tests
    @api
    columns = [
        { label: 'First Name', fieldName: FIRST_NAME_FIELD.fieldApiName },
        { label: 'Last Name', fieldName: LAST_NAME_FIELD.fieldApiName },
        { label: 'Email', fieldName: EMAIL_FIELD.fieldApiName }
    ];

    // @wire connects to Apex method and handles reactivity
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

    // Getter processes error for display
    get errors() {
        return reduceErrors(this.error);
    }
}
```

### Why Use Each Decorator?

**`@api columns` (Line 12-17)**
- ✅ Parent components can customize columns if needed
- ✅ Tests can verify columns are configured correctly
- ✅ Makes component more flexible and reusable

**`@wire(getContacts)` (Line 19-28)**
- ✅ Automatically fetches contacts when component loads
- ✅ Uses Lightning Data Service caching
- ✅ Re-fetches if contacts are updated elsewhere
- ✅ Handles loading, success, and error states

---

## Key Differences Summary

| Feature | `@api` | `@wire` |
|---------|--------|---------|
| **Purpose** | Make properties/methods public | Connect to reactive data |
| **Direction** | Outward (expose to parents) | Inward (pull from Salesforce) |
| **Use Case** | Component configuration | Data retrieval |
| **Reactivity** | Not reactive by default | Automatically reactive |
| **Import** | `import { api }` | `import { wire }` |
| **Target** | Properties & methods | Functions & properties |
| **Example** | `@api recordId;` | `@wire(getRecord)` |

---

## Software Engineering Principles

### 1. **Encapsulation (`@api`)**
Defines the public contract of your component:
- **Public** (`@api`): What others can access
- **Private** (no decorator): Internal implementation

**Analogy:** A TV remote
- Public buttons (`@api`): Power, Volume - users can press
- Private circuits: Internal wiring - users can't touch

### 2. **Reactive Programming (`@wire`)**
Implements the Observer Pattern:
- Component observes data sources
- Automatically reacts when data changes
- No manual polling needed

**Analogy:** News subscription
- Old way: Check website every hour
- `@wire` way: Get notified automatically

### 3. **Separation of Concerns**
- `@api` = **Interface** (how component talks to outside)
- `@wire` = **Data Layer** (how component gets data)
- Regular properties = **Internal State** (component's own data)

---

## Quick Reference

### When to Use `@api`
✅ Parent components need to configure your component  
✅ Tests need to access properties  
✅ Building reusable components  
✅ Creating component libraries  

### When to Use `@wire`
✅ Reading data from Salesforce  
✅ You want automatic updates  
✅ You want built-in caching  
✅ Working with Lightning Data Service  

### When to Use Neither
✅ Internal state management (`@track` or reactive properties)  
✅ Event handlers (`onclick`, `onchange`)  
✅ Lifecycle hooks (`connectedCallback`, etc.)  
✅ Helper methods  

---

## Common Patterns

### Pattern 1: Public Reactive Parameter
```javascript
@api recordId;  // Parent can set this

@wire(getRecord, { recordId: '$recordId' })  // React to changes
wiredRecord({ error, data }) {
    // Handle response
}
```

### Pattern 2: Getter for Computed Values
```javascript
contacts;
error;

@wire(getContacts)
wiredContacts({ error, data }) {
    this.contacts = data;
    this.error = error;
}

get hasContacts() {
    return this.contacts && this.contacts.length > 0;
}
```

### Pattern 3: Error Handling with Utility
```javascript
import { reduceErrors } from 'c/ldsUtils';

@wire(getContacts)
wiredContacts({ error, data }) {
    if (error) {
        this.error = error;
    }
}

get errors() {
    return reduceErrors(this.error);  // Process for display
}
```

---

## Testing Considerations

### Testing `@api` Properties
```javascript
it('can access public columns property', () => {
    const element = createElement('c-contact-list', { is: ContactList });
    document.body.appendChild(element);
    
    // ✅ Works because @api makes it public
    expect(element.columns).toHaveLength(3);
});
```

### Testing `@wire` Adapters
Testing wire adapters requires mocking - simplified approach:
```javascript
// Test the component structure, not the wire adapter
it('renders lightning-card', () => {
    const element = createElement('c-contact-list', { is: ContactList });
    document.body.appendChild(element);
    
    const card = element.shadowRoot.querySelector('lightning-card');
    expect(card).not.toBeNull();
});
```

---

## Related Documentation

- [Salesforce LWC Decorators Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_decorators)
- [Wire Service Documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_wire_service_about)
- [Lightning Data Service Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_ui_api)

---

**Last Updated:** November 7, 2025  
**Project:** sculliwag-dev  
**Component Examples:** contactList, contactCreator

