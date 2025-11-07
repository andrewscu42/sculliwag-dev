import { createElement } from 'lwc';
import WireServiceExample from 'c/wireServiceExample';
import { getRecord } from 'lightning/uiRecordApi';
import getContacts from '@salesforce/apex/ContactController.getContacts';

// Mock the wire adapters
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

describe('c-wire-service-example', () => {
    afterEach(() => {
        // Clean up DOM after each test
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('LDS Wire Adapter - getRecord', () => {
        it('displays account name when record data is loaded', () => {
            // Arrange
            const RECORD_ID = '001000000000000AAA';
            const MOCK_RECORD = {
                apiName: 'Account',
                fields: {
                    Name: {
                        value: 'Acme Corporation'
                    },
                    Industry: {
                        value: 'Technology'
                    }
                }
            };

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
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
                const nameElement = element.shadowRoot.querySelector('p');
                expect(nameElement.textContent).toContain('Acme Corporation');
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

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
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
                const errorElement = element.shadowRoot.querySelector('.slds-text-color_error');
                expect(errorElement).not.toBeNull();
                expect(errorElement.textContent).toContain('Record not found');
            });
        });

        it('reacts to reactive variable changes', () => {
            // Arrange
            const FIRST_RECORD_ID = '001000000000000AAA';
            const SECOND_RECORD_ID = '001000000000000BBB';
            
            const FIRST_RECORD = {
                apiName: 'Account',
                fields: {
                    Name: { value: 'First Account' }
                }
            };

            const SECOND_RECORD = {
                apiName: 'Account',
                fields: {
                    Name: { value: 'Second Account' }
                }
            };

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
            });
            element.recordId = FIRST_RECORD_ID;
            document.body.appendChild(element);

            const { createLdsTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
            const getRecordAdapter = createLdsTestWireAdapter(getRecord);

            // Act - Emit first record
            getRecordAdapter.emit(FIRST_RECORD);

            return Promise.resolve().then(() => {
                // Assert first record
                expect(element.accountName).toBe('First Account');

                // Change reactive variable
                element.recordId = SECOND_RECORD_ID;

                // Emit second record (wire adapter should react)
                getRecordAdapter.emit(SECOND_RECORD);

                return Promise.resolve().then(() => {
                    // Assert second record
                    expect(element.accountName).toBe('Second Account');
                });
            });
        });
    });

    describe('Apex Wire Adapter - getContacts', () => {
        it('displays contacts when Apex method returns data', () => {
            // Arrange
            const MOCK_CONTACTS = [
                { Id: '003000000000000AAA', FirstName: 'John', LastName: 'Doe', Email: 'john@example.com' },
                { Id: '003000000000000BBB', FirstName: 'Jane', LastName: 'Smith', Email: 'jane@example.com' }
            ];

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
            });
            document.body.appendChild(element);

            // Act - Emit data using Apex wire adapter
            const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
            const getContactsAdapter = createApexTestWireAdapter(jest.fn());
            getContactsAdapter.emit(MOCK_CONTACTS);

            // Wait for DOM updates
            return Promise.resolve().then(() => {
                // Assert
                const contactList = element.shadowRoot.querySelector('ul');
                expect(contactList).not.toBeNull();
                expect(element.contacts).toEqual(MOCK_CONTACTS);
                expect(element.contacts).toHaveLength(2);
            });
        });

        it('displays error when Apex method fails', () => {
            // Arrange
            const MOCK_ERROR = {
                body: {
                    message: 'Insufficient access rights'
                }
            };

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
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
                expect(element.errors).toContain('Insufficient access rights');
                
                const errorElement = element.shadowRoot.querySelector('.slds-text-color_error');
                expect(errorElement).not.toBeNull();
            });
        });

        it('clears contacts when error occurs', () => {
            // Arrange
            const MOCK_CONTACTS = [
                { Id: '003000000000000AAA', FirstName: 'John', LastName: 'Doe', Email: 'john@example.com' }
            ];
            const MOCK_ERROR = {
                body: { message: 'Error occurred' }
            };

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
            });
            document.body.appendChild(element);

            const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
            const getContactsAdapter = createApexTestWireAdapter(jest.fn());

            // Act - First emit data, then error
            getContactsAdapter.emit(MOCK_CONTACTS);

            return Promise.resolve().then(() => {
                expect(element.contacts).toEqual(MOCK_CONTACTS);

                // Emit error
                getContactsAdapter.error(MOCK_ERROR);

                return Promise.resolve().then(() => {
                    // Assert - contacts should be cleared
                    expect(element.contacts).toBeUndefined();
                    expect(element.error).toBeTruthy();
                });
            });
        });
    });

    describe('Generic Wire Adapter', () => {
        it('can use generic adapter for custom wire functions', () => {
            // Arrange
            const MOCK_DATA = { customField: 'customValue' };

            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
            });
            document.body.appendChild(element);

            // Act - Use generic wire adapter
            const { createTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
            const genericAdapter = createTestWireAdapter(jest.fn());
            genericAdapter.emit(MOCK_DATA);

            // Assert - Generic adapter emits data on demand
            return Promise.resolve().then(() => {
                expect(genericAdapter).toBeTruthy();
            });
        });
    });

    describe('Reactive Variables', () => {
        it('wire adapter reacts to $recordId changes', () => {
            // Arrange
            const element = createElement('c-wire-service-example', {
                is: WireServiceExample
            });
            document.body.appendChild(element);

            const { createLdsTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
            const getRecordAdapter = createLdsTestWireAdapter(getRecord);

            // Act - Set initial recordId
            element.recordId = '001000000000000AAA';
            
            const FIRST_RECORD = {
                apiName: 'Account',
                fields: { Name: { value: 'First' } }
            };
            getRecordAdapter.emit(FIRST_RECORD);

            return Promise.resolve().then(() => {
                expect(element.accountName).toBe('First');

                // Change reactive variable (prefixed with $)
                element.recordId = '001000000000000BBB';

                const SECOND_RECORD = {
                    apiName: 'Account',
                    fields: { Name: { value: 'Second' } }
                };
                getRecordAdapter.emit(SECOND_RECORD);

                return Promise.resolve().then(() => {
                    // Assert - Wire adapter should react to $recordId change
                    expect(element.accountName).toBe('Second');
                });
            });
        });
    });
});

