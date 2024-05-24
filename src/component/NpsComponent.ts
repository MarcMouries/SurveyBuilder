import type { IQuestion } from "../IQuestion";

export class NpsComponent extends HTMLElement {

    private selectedButton!: HTMLButtonElement | null;
    private question!: IQuestion;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.selectedButton = null;

        this.build();
        this.bindEvents();
    }


    setQuestion(question: IQuestion) {
        this.question = question;
    }

    build() {
        const style = document.createElement("style");
        style.textContent = `
            .nps-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                max-width: 400px;
            }
            .buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
            .buttons > button {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 28px;
                width: 28px;
                line-height: 1;
                background-color: #f3f3f3;
                border: none;
                border-radius: 8px;
                color: #333;
                font-size: 12px;
                transition: all ease 0.1s;
                cursor: pointer;
            }
            .buttons > button.active {
                border: 2px solid black;
                transform: scale(1.25);
            }
            .buttons > button:hover {
                border: 2px solid black;
                transform: scale(1.25);
            }
            .buttons .detractor:nth-child(1) { background-color: #ff9eae; }
            .buttons .detractor:nth-child(2) { background-color: #ffafbc; }
            .buttons .detractor:nth-child(3) { background-color: #ffb8c6; }
            .buttons .detractor:nth-child(4) { background-color: #ffc0cb; }
            .buttons .detractor:nth-child(5) { background-color: #ffd1d9; }
            .buttons .detractor:nth-child(6) { background-color: #ffe2e7; }
            .buttons .detractor:nth-child(7) { background-color: #ffdfe4; }
            .buttons .passive:nth-child(8) { background-color: #ecf1e0; }
            .buttons .passive:nth-child(9) { background-color: #c8e6cc; }
            .buttons .promoter:nth-child(10) { background-color: #adecba; }
            .buttons .promoter:nth-child(11) { background-color: #5ad974; }
            .labels {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                width: 100%;
                font-size: small;
                color: #aaa;
            }
        `;

        const container = document.createElement('div');
        container.classList.add('nps-container');
        container.innerHTML = `
            <div class="buttons">
                <button class="detractor">0</button>
                <button class="detractor">1</button>
                <button class="detractor">2</button>
                <button class="detractor">3</button>
                <button class="detractor">4</button>
                <button class="detractor">5</button>
                <button class="detractor">6</button>
                <button class="passive">7</button>
                <button class="passive">8</button>
                <button class="promoter">9</button>
                <button class="promoter">10</button>
            </div>
            <div class="labels">
                <span>Not Likely</span>
                <span>Very Likely</span>
            </div>
        `;

        if (this.shadowRoot) {
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(container);
        }
    }

    bindEvents() {
        const buttons = this.shadowRoot!.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.onSelection(button);
            });
        });
    }


    onSelection(selectedButton: HTMLButtonElement) {
        this.selectedButton?.classList.remove('active');
        this.selectedButton = selectedButton;
        this.selectedButton.classList.add('active');
        const event = new CustomEvent('SelectionChanged', {
            detail: { value: this.selectedButton.textContent }
        });
        this.dispatchEvent(event);
    }
}
customElements.define('nps-component', NpsComponent);
