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

describe('c-contact-list - Wire Service Tests', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays contacts when Apex wire adapter returns data', () => {
        // Arrange
        const MOCK_CONTACTS = [
            { 
                Id: '003000000000000AAA', 
                FirstName: 'Lisa', 
                LastName: 'Jones', 
                Email: 'ljones@developer.com' 
            },
            { 
                Id: '003000000000000BBB', 
                FirstName: 'John', 
                LastName: 'Doe', 
                Email: 'jdoe@example.com' 
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
            expect(element.contacts).toHaveLength(2);
            
            const datatable = element.shadowRoot.querySelector('lightning-datatable');
            expect(datatable).not.toBeNull();
            expect(datatable.data).toEqual(MOCK_CONTACTS);
        });
    });

    it('displays error message when Apex wire adapter fails', () => {
        // Arrange
        const MOCK_ERROR = {
            body: {
                message: 'This is a forced error for testing purposes.'
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
            expect(element.errors).toContain('This is a forced error for testing purposes.');
            
            const errorElement = element.shadowRoot.querySelector('.slds-text-color_error');
            expect(errorElement).not.toBeNull();
            expect(errorElement.textContent).toContain('This is a forced error for testing purposes.');
        });
    });

    it('clears error when data is successfully loaded', () => {
        // Arrange
        const MOCK_ERROR = {
            body: { message: 'Initial error' }
        };
        const MOCK_CONTACTS = [
            { Id: '003000000000000AAA', FirstName: 'Test', LastName: 'User', Email: 'test@example.com' }
        ];

        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getContactsAdapter = createApexTestWireAdapter(jest.fn());

        // Act - First emit error, then data
        getContactsAdapter.error(MOCK_ERROR);

        return Promise.resolve().then(() => {
            expect(element.error).toBeTruthy();

            // Emit data
            getContactsAdapter.emit(MOCK_CONTACTS);

            return Promise.resolve().then(() => {
                // Assert - Error should be cleared
                expect(element.error).toBeUndefined();
                expect(element.contacts).toEqual(MOCK_CONTACTS);
            });
        });
    });

    it('uses reduceErrors getter to process error', () => {
        // Arrange
        const MOCK_ERROR = {
            body: { message: 'Test error message' }
        };

        const element = createElement('c-contact-list', {
            is: ContactList
        });
        document.body.appendChild(element);

        // Act
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        const getContactsAdapter = createApexTestWireAdapter(jest.fn());
        getContactsAdapter.error(MOCK_ERROR);

        return Promise.resolve().then(() => {
            // Assert - Test that the errors getter returns processed error
            expect(element.errors).toBeTruthy();
            expect(typeof element.errors).toBe('string');
            expect(element.errors).toContain('Test error message');
        });
    });
});

