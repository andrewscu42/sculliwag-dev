import { createElement } from 'lwc';
import UnitTest from 'c/unitTest';

describe('c-unit-test', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays the unit test component', () => {
        // Arrange
        const element = createElement('c-unit-test', {
            is: UnitTest
        });

        // Act
        document.body.appendChild(element);

        // Assert
        const div = element.shadowRoot.querySelector('div');
        expect(div).not.toBeNull();
    });

    it('displays the correct text', () => {
        // Arrange
        const element = createElement('c-unit-test', {
            is: UnitTest
        });

        // Act
        document.body.appendChild(element);

        // Assert
        const p = element.shadowRoot.querySelector('p');
        expect(p.textContent).toBe('Unit Test Component');
    });
});

