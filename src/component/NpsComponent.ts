
export class NpsComponent extends HTMLElement {

    private selectedButton: HTMLButtonElement | null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        console.log("this.shadowRoot");
        console.log(this.shadowRoot);

        this.selectedButton = null;

        this.build();
        this.bindEvents();
    }

    build() {
        console.log(this.shadowRoot);
        if (this.shadowRoot) {

            this.shadowRoot.innerHTML =
            `
            <style>
            .nps-container {
                display: flex;
                justify-content: space-between;
                width: 100%;
                max-width: 400px;
            }
            .nps-container > button {
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

            .nps-container > button.active {
                border: 2px solid black;
                transform: scale(1.25);
            }

            .nps-container > button:hover {
                border: 2px solid black;
                transform: scale(1.25);
            }

            .nps-container .detractor:nth-child(1) { background-color: #ff9eae; }
            .nps-container .detractor:nth-child(2) { background-color: #ffafbc; }
            .nps-container .detractor:nth-child(3) { background-color: #ffb8c6; }
            .nps-container .detractor:nth-child(4) { background-color: #ffc0cb; }
            .nps-container .detractor:nth-child(5) { background-color: #ffd1d9; }
            .nps-container .detractor:nth-child(6) { background-color: #ffe2e7; }
            .nps-container .detractor:nth-child(7) { background-color: #ffdfe4; }
            .nps-container .passive:nth-child(8)   { background-color: #ecf1e0; }
            .nps-container .passive:nth-child(9)   { background-color: #c8e6cc; }
            .nps-container .promoter:nth-child(10) { background-color: #adecba; }
            .nps-container .promoter:nth-child(11) { background-color: #5ad974; }

            .labels {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                max-width: 400px;
                font-size: small;
                color: #aaa;
            }
            </style>
            <div class="nps-container">
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
        `
        }
    }

    bindEvents() {
        const buttons = this.shadowRoot!.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.onSelectOption(button); 
            });
        });
    }
    

    onSelectOption(selectedButton: HTMLButtonElement) {
        // Remove 'active' class from previously selected button if it exists
        if (this.selectedButton) {
            this.selectedButton.classList.remove('active');
        }
    
        // Set the new selected button
        this.selectedButton = selectedButton;
    
        // Add 'active' class to the newly selected button
        this.selectedButton.classList.add('active');
    
        // Dispatch the custom event with the selected button's text as the option
        const event = new CustomEvent('optionSelected', {
            detail: { option: this.selectedButton.textContent }
        });
        this.dispatchEvent(event);
    }
    
}
// Define the new element
customElements.define('nps-component', NpsComponent);
