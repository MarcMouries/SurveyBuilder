export class StarRatingComponent extends HTMLElement {
    private selectedStar!: HTMLButtonElement | null;
    private rating!: number;

    static get observedAttributes() {
        return ['rating'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.selectedStar = null;
    }

    connectedCallback() {
        this.build();
        this.bindEvents();
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (name === 'rating') {
            this.rating = parseInt(newValue);
            this.updateStars();
        }
    }

    setRating(rating: number) {
        this.setAttribute('rating', rating.toString());
    }

    build() {
        const style = document.createElement("style");
        style.textContent = `
            .star-container {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .star-container > button {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 28px;
                width: 28px;
                background-color: transparent;
                border: none;
                color: #ccc;
                font-size: 28px;
                cursor: pointer;
                transition: color 0.2s;
            }
            .star-container > button.active,
            .star-container > button:hover {
                color: gold;
            }
        `;

        const container = document.createElement('div');
        container.classList.add('star-container');
        container.innerHTML = `
            <button data-value="1">&#9733;</button>
            <button data-value="2">&#9733;</button>
            <button data-value="3">&#9733;</button>
            <button data-value="4">&#9733;</button>
            <button data-value="5">&#9733;</button>
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
                this.onSelectStar(button);
            });
        });
    }

    onSelectStar(selectedStar: HTMLButtonElement) {
        this.selectedStar?.classList.remove('active');
        this.selectedStar = selectedStar;
        this.selectedStar.classList.add('active');
        const rating = parseInt(this.selectedStar.dataset.value!)
        this.setRating(rating);
        const event = new CustomEvent('SelectionChanged', {
            detail: { value: rating }
        });
        this.dispatchEvent(event);
    }

    updateStars() {
        const buttons = this.shadowRoot!.querySelectorAll('button');
        buttons.forEach(button => {
            const value = parseInt(button.dataset.value!);
            if (value <= this.rating) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

customElements.define('star-rating-component', StarRatingComponent);
