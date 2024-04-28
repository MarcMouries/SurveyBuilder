const BUTTON_CLASS = 'survey-button';

export class SurveyPage {
    public pageContainer: HTMLElement;
    public title: HTMLElement;
    public content: HTMLElement;
    public buttonContainer: HTMLElement;
    private buttons: Map<string, HTMLElement>;


    constructor(pageId: string) {
        this.pageContainer = document.createElement('div');
        this.pageContainer.className = 'survey-page';
        this.pageContainer.id = pageId;

        this.title = document.createElement('h2');
        this.title.className = 'survey-page-title';

        this.content = document.createElement('p');
        this.content.className = 'survey-page-content';

        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = 'button-container';
        this.pageContainer.appendChild(this.title);
        this.pageContainer.appendChild(this.content);
        this.pageContainer.appendChild(this.buttonContainer);

        this.buttons = new Map();
    }

    setTitle(text: string): void {
        this.title.textContent = text;
    }

    setContent(html: string): void {
        this.content.innerHTML = html;
    }

    addButton(id: string, text: string, onClick: () => void): void {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.className = BUTTON_CLASS;
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
        this.pageContainer.style.display = 'block';
    }

    hide(): void {
        this.pageContainer.style.display = 'none';
    }
}
