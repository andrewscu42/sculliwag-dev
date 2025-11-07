# Lightning Web Components - Decorators Guide

## Overview

This guide explains the purpose and usage of `@api` and `@wire` decorators in Lightning Web Components. See the `contactList` component for a complete example: [`force-app/main/default/lwc/contactList/contactList.js`](../force-app/main/default/lwc/contactList/contactList.js)

**Official Documentation:** [Salesforce LWC Decorators](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_decorators)

---

## `@api` Decorator

### Purpose
Makes a property or method **public** - accessible from outside the component.

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Component Configuration** | Allow parent components to pass in values |
| **Testing** | Make properties accessible in Jest tests |
| **Reusable Components** | Create flexible, configurable components |

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

**Official Documentation:** [Wire Service Documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_wire_service_about)

### Wire Adapter Types

| Type | Use Case | Example |
|------|----------|---------|
| **Apex Methods** | Server-side data | `@wire(getContacts)` |
| **LDS Adapters** | Standard Salesforce data | `@wire(getRecord)` |
| **Reactive Variables** | Dynamic parameters | `@wire(getRecord, { recordId: '$recordId' })` |

**See complete example:** [`force-app/main/default/lwc/wireServiceExample/wireServiceExample.js`](../force-app/main/default/lwc/wireServiceExample/wireServiceExample.js)

### Benefits of `@wire`

| Feature | Benefit |
|---------|---------|
| **Automatic invocation** | Runs when component loads |
| **Reactive updates** | Re-runs when parameters change |
| **Caching** | Uses Lightning Data Service cache |
| **Error handling** | Built-in error/data separation |
| **Performance** | Minimizes server calls |

**Trailhead:** [Work with Salesforce Data](https://trailhead.salesforce.com/content/learn/modules/lightning-web-components-and-salesforce-data)

---

## Real Example: contactList Component

**See full implementation:** [`force-app/main/default/lwc/contactList/contactList.js`](../force-app/main/default/lwc/contactList/contactList.js)

### Why Use Each Decorator?

**`@api columns`**
- ✅ Parent components can customize columns if needed
- ✅ Tests can verify columns are configured correctly
- ✅ Makes component more flexible and reusable

**`@wire(getContacts)`**
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

**Analogy:** A TV remote - public buttons users can press vs. private internal circuits

### 2. **Reactive Programming (`@wire`)**
Implements the Observer Pattern - component observes data sources and automatically reacts when data changes.

**Analogy:** News subscription - get notified automatically instead of checking manually

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

**Pattern 1: Public Reactive Parameter**  
See: [`force-app/main/default/lwc/wireServiceExample/wireServiceExample.js`](../force-app/main/default/lwc/wireServiceExample/wireServiceExample.js) (lines 8-15)

**Pattern 2: Getter for Computed Values**  
See: [`force-app/main/default/lwc/contactList/contactList.js`](../force-app/main/default/lwc/contactList/contactList.js) (lines 30-32)

**Pattern 3: Error Handling with Utility**  
See: [`force-app/main/default/lwc/contactList/contactList.js`](../force-app/main/default/lwc/contactList/contactList.js) (lines 19-28, 30-32)

---

## Testing Considerations

**Testing `@api` Properties:**  
See: [`force-app/main/default/lwc/contactList/__tests__/contactList.test.js`](../force-app/main/default/lwc/contactList/__tests__/contactList.test.js) (lines 27-41)

**Testing `@wire` Adapters:**  
See: [`SystemDoc/Wire-Service-Testing-Guide.md`](./Wire-Service-Testing-Guide.md) for complete wire service testing guide

---

## Related Documentation

- [Salesforce LWC Decorators Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_decorators)
- [Wire Service Documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_wire_service_about)
- [Lightning Data Service Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_ui_api)
- **Trailhead:** [Lightning Web Components Basics](https://trailhead.salesforce.com/content/learn/modules/lightning-web-components-basics)

---

**Last Updated:** November 7, 2025  
**Project:** sculliwag-dev  
**Component Examples:** contactList, wireServiceExample

