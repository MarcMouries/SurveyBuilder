export class SurveyPage {
    public container: HTMLElement;
    public title: HTMLElement;
    public content: HTMLElement;
    public buttonContainer: HTMLElement;
    private buttons: Map<string, HTMLElement>;

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

        this.buttons = new Map();
    }

    setTitle(text: string): void {
        this.title.textContent = text;
    }

    setContent(html: string): void {
        this.content.innerHTML = html;
    }

    addButton(id: string, text: string, className: string, onClick: () => void): void {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        this.buttonContainer.appendChild(button);
        this.buttons.set(id, button);
        button.style.display = 'none';
    }

    showButton(id: string): void {
        const button = this.buttons.get(id);
        if (button) {
            button.style.display = 'block';
        }
    }

    hideButton(id: string): void {
        const button = this.buttons.get(id);
        if (button) {
            button.style.display = 'none';
        }
    }

    show(): void {
        this.container.style.display = 'block';
    }

    hide(): void {
        this.container.style.display = 'none';
    }
}
