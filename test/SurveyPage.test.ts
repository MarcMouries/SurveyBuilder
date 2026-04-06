import { describe, test, expect, beforeEach, jest } from "bun:test";

// Mock the global document object — Bun doesn't run in a browser environment
globalThis.document = {
    createElement: (tagName: string): HTMLElement => {
        const element: Partial<HTMLElement> & {
            children: HTMLElement[];
            eventListeners: Record<string, Function[]>;
            appendChild(child: HTMLElement): void;
            addEventListener(type: string, listener: Function): void;
            click(): void;
        } = {
            style: {} as CSSStyleDeclaration,
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
    let page: SurveyPage;

    beforeEach(() => {
        page = new SurveyPage('test-page');
    });

    test('should return an instance of SurveyPage', () => {
        expect(page).toBeInstanceOf(SurveyPage);
    });

    test('pageContainer should exist with the correct id and class', () => {
        expect(page.pageContainer).toBeDefined();
        expect(page.pageContainer.id).toBe('test-page');
        expect(page.pageContainer.className).toBe('survey-page');
    });

    test('pageContainer should contain title and content elements', () => {
        // pageContainer appends: title, content (buttonContainer is handled by SurveyBuilder)
        expect((page.pageContainer as any).children.length).toBe(2);
    });

    test('title element should have the correct class', () => {
        expect(page.title).toBeDefined();
        expect(page.title.className).toBe('survey-page-title');
    });

    test('content element should have the correct class', () => {
        expect(page.content).toBeDefined();
        expect(page.content.className).toBe('survey-page-content');
    });

    test('setTitle should set the header text', () => {
        page.setTitle('Welcome to the survey');
        expect(page.title.textContent).toBe('Welcome to the survey');
    });

    test('setContent should set the content HTML', () => {
        page.setContent('<p>Please answer the following questions.</p>');
        expect(page.content.innerHTML).toBe('<p>Please answer the following questions.</p>');
    });

    test('show should set display to block', () => {
        page.show();
        expect(page.pageContainer.style.display).toBe('block');
    });

    test('hide should set display to none', () => {
        page.hide();
        expect(page.pageContainer.style.display).toBe('none');
    });
});
