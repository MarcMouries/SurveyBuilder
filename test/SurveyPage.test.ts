import { describe, test, expect, beforeEach, jest } from "bun:test";

// Mocking the global document object with type assertions
globalThis.document = {
    createElement: (tagName: string): HTMLElement => {
        const element: Partial<HTMLElement> & {
            children: HTMLElement[];
            eventListeners: Record<string, Function[]>;
            appendChild(child: HTMLElement): void;
            addEventListener(type: string, listener: Function): void;
            click(): void;
        } = {
            style: {} as CSSStyleDeclaration, // Mocked style object
            className: '',
            children: [],
            eventListeners: {},
            appendChild(child: HTMLElement) {
                this.children.push(child);
            },
            addEventListener(type: string, listener: Function) {
                if (!this.eventListeners[type]) {
                    this.eventListeners[type] = [];
                }
                this.eventListeners[type].push(listener);
            },
            click() {
                if (this.eventListeners['click']) {
                    this.eventListeners['click'].forEach(listener => listener.call(this));
                }
            },
            get firstChild() {
                return this.children[0] || null;
            },
        };

        return element as HTMLElement;
    }
} as any as Document;



  

  

import { SurveyPage } from "../src/SurveyPage";

describe('SurveyPage', () => {
    let page;

    beforeEach(() => {
        page = new SurveyPage();
    });

    test('createPage should return an instance of SurveyPage', () => {
        expect(page).toBeInstanceOf(SurveyPage);
    });

    test('SurveyPage should have a container with correct initial structure', () => {
        expect(page.container).toBeDefined();
        expect(page.container.children.length).toBe(3); // Header, description, button container
        expect(page.header.className).toBe('page-header');
        expect(page.description.className).toBe('page-description');
        expect(page.buttonContainer.className).toBe('button-container');
    });

    test('setHeader should correctly set the header text', () => {
        const headerText = 'Test Header';
        page.setHeader(headerText);
        expect(page.header.textContent).toBe(headerText);
    });

    test('setDescription should correctly set the description HTML', () => {
        const descriptionHTML = '<p>This is a test</p>';
        page.setDescription(descriptionHTML);
        expect(page.description.innerHTML).toBe(descriptionHTML);
    });

    test('addButton should add a button to the button container', () => {
        const buttonText = 'Click Me';
        const buttonClass = 'test-button';
        const mockAction = jest.fn();

        page.addButton(buttonText, buttonClass, mockAction);
        expect(page.buttonContainer.children.length).toBe(1);
        const button = page.buttonContainer.firstChild;
        expect(button.textContent).toBe(buttonText);
        expect(button.className).toBe(buttonClass);

        // Simulate a button click and check if the action is called
        button.click();
        expect(mockAction).toHaveBeenCalled();
    });
});
