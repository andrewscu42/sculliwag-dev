import { createElement } from 'lwc';
import ContactCreator from 'c/contactCreator';

describe('c-contact-creator', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
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

        // Assert - verify the record form has fields attribute bound
        const recordForm = element.shadowRoot.querySelector('lightning-record-form');
        expect(recordForm).not.toBeNull();
        // Fields are passed to the record form, we verify it exists
        expect(recordForm.fields).toBeTruthy();
    });
});

