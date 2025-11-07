# sculliwag-dev - Salesforce DX Project

Lightning Web Components project demonstrating data access patterns, wire services, and Jest testing.

## Project Overview

This project contains Lightning Web Components that demonstrate:
- Working with Salesforce data using Lightning Data Service
- Using `@wire` decorator with LDS and Apex adapters
- Jest unit testing for Lightning Web Components
- Error handling and utility functions

## Components

### Data Creation Components
- **contactCreator** - Create Contact records with toast notifications
- **accountCreator** - Create Account records

### Data Display Components
- **contactList** - Display contacts in datatable with wire service
- **wireServiceExample** - Complete wire service demonstration

### Utility Components
- **ldsUtils** - Error handling utilities from LWC Recipes
- **unitTest** - Example component for testing patterns

## Quick Start

### Prerequisites
- Node.js and npm installed
- Salesforce CLI installed
- VS Code with Salesforce Extensions

### Setup
```bash
# Install dependencies
npm install

# Authorize your org
sf org login web

# Deploy components
sf project deploy start
```

### Run Tests
```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage
```

## Documentation

Comprehensive documentation is available in the `SystemDoc/` folder:

- **[SystemDoc/README.md](SystemDoc/README.md)** - Master index and quick reference
- **[LWC Decorators Guide](SystemDoc/LWC-Decorators-Guide.md)** - Understanding `@api` and `@wire`
- **[Wire Service Testing Guide](SystemDoc/Wire-Service-Testing-Guide.md)** - Testing wire adapters
- **[Testing Guide](SystemDoc/Testing-Guide.md)** - Complete Jest testing guide
- **[Project Components Overview](SystemDoc/Project-Components-Overview.md)** - All components documented

## Project Structure

```
sculliwag-dev/
├── force-app/main/default/
│   ├── classes/
│   │   └── ContactController.cls
│   └── lwc/
│       ├── accountCreator/
│       ├── contactCreator/
│       ├── contactList/
│       ├── ldsUtils/
│       ├── unitTest/
│       └── wireServiceExample/
├── SystemDoc/                    # Comprehensive documentation
├── jest.config.js
├── package.json
└── sfdx-project.json
```

## Key Features

- ✅ Lightning Data Service integration
- ✅ Wire service with reactive variables
- ✅ Jest unit testing setup
- ✅ Error handling utilities
- ✅ Comprehensive documentation

## Salesforce DX Resources

### How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

### Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Additional Resources

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Lightning Web Components Developer Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
