export class SurveyPage {
    public container: HTMLElement;
    public title: HTMLElement;
    public content: HTMLElement;
    public buttonContainer: HTMLElement;

    constructor(pageId: string) {
        this.container = document.createElement('div');
        this.container.className = 'survey-page';
        this.container.id = pageId;

        this.title = document.createElement('h2');
        this.title.className = 'survey-page-title';
        this.content = document.createElement('p');
        this.content.className = 'survey-page-content';
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = 'button-container';

        this.container.appendChild(this.title);
        this.container.appendChild(this.content);
        this.container.appendChild(this.buttonContainer);
    }

    setTitle(text: string): void {
        this.title.textContent = text;
    }

    setContent(html: string): void {
        this.content.innerHTML = html;
    }

    addButton(text: string, className: string, action: () => void): void {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', action);
        this.buttonContainer.appendChild(button);
    }

    show(): void {
        this.container.style.display = 'block';
    }

    hide(): void {
        this.container.style.display = 'none';
    }
}
