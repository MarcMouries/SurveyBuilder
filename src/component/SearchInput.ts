export class SearchInput extends HTMLElement {
    private _config: any;
    private inputValue: any;
    private modalContainer: any;
    private filterInput: any;
    private clearButton: any;
    private optionsContainer: any;
    private cancelButton: any;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.build();
        this.bindEvents();
    }

    build() {
        if (this.shadowRoot) {

            this.shadowRoot.innerHTML = `
            <style>
                .search-input-wrapper {
                    position: relative;
                }

                .input-value, .modal-container {
                    width: 100%;
                }

                .input-value input, .header-filter-container input {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: inherit;
                }

                .modal-container {
                    display: none; /* Initially hidden */
                    position: fixed;
                    justify-content: space-between;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 1000;
                    flex-direction: column;
                }

                .header-filter-container {
                    display: flex;
                    padding: 12px;
                }

                .main-options-container {
                    overflow-y: auto;
                    flex-grow: 1;
                    border: 1px solid #ccc;
                    margin: 10px 0;
                }
                .main-options-container .option {
                    padding: 8px; /* Add padding to each option */
                    margin: 2px 0; /* Small margin between options */
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.3s; /* Smooth transition for hover effect */
                }
                .main-options-container .option:hover {
                    background-color: #f0f0f0;
                }

                .footer-actions-container {
                    background-color: whitesmoke;
                    padding: 12px;
                    text-align: center;
                }
                .footer-actions-container .button {
                    padding: 10px 20px;
                    background-color: #4CAF50; /* Green background */
                    color: white; /* White text */
                    border: none;
                    border-radius: 4px;
                    cursor: pointer; /* Change cursor to indicate clickability */
                    transition: background-color 0.3s; /* Smooth transition for hover effect */
                }

                .footer-actions-container .button:hover {
                    background-color: #45a049; /* Slightly darker green on hover */
                }

            </style>
            <div class="search-input-wrapper">
                <div class="input-value">
                    <input type="text" autocomplete="off" placeholder="Type to search...">
                </div>
                <div class="modal-container">
                    <div class="header-filter-container">
                        <input type="text" autocomplete="off" placeholder="Type to search...">
                        <button type="button" class="clear-icon" aria-label="Clear">&#x274C;</button>
                    </div>
                    <div class="main-options-container"></div>
                    <div class="footer-actions-container">
                        <button class="button cancel" type="button" title="Cancel" tabindex="0" role="button"><span>Cancel</span></button>
                    </div>
                </div>
            </div>
        `;
            // Cache necessary elements
            this.inputValue = this.shadowRoot.querySelector('.input-value input');
            this.modalContainer = this.shadowRoot.querySelector('.modal-container');
            this.filterInput = this.shadowRoot.querySelector('.header-filter-container input');
            this.clearButton = this.shadowRoot.querySelector('.clear-icon');
            this.optionsContainer = this.shadowRoot.querySelector('.main-options-container');
            this.cancelButton = this.shadowRoot.querySelector('.button.cancel');
        }

    }

    bindEvents() {
        this.inputValue.addEventListener('focus', () => this.showModal());
        this.cancelButton.addEventListener('click', () => this.hideModal());
        this.filterInput.addEventListener('input', (e: any) => this.handleFilterInput(e.target.value));
        this.clearButton.addEventListener('click', () => {
            this.filterInput.value = '';
            this.optionsContainer.innerHTML = ''; // Clear options if needed
            this.filterInput.focus(); // Refocus on the filter input
        });
    }

    showModal() {
        this.inputValue.style.display = 'none'; // Hide the initial input
        this.modalContainer.style.display = 'flex'; // Show the modal
        this.filterInput.focus(); // Focus on the filter input inside the modal
    }

    hideModal() {
        this.modalContainer.style.display = 'none'; // Hide the modal
        this.inputValue.style.display = 'block'; // Show the initial input
    }


    setConfig(config: any) {
        this._config = config;
    }

      /*
    onInput(event:any) {
        const searchText = event.target.value.trim();
        // Show clear button only if there's text
        this.clearButton.style.visibility = searchText ? 'visible' : 'hidden';

        if (searchText.length >= 2) {
            this.updateOptions(searchText);
            this.optionsContainer.style.display = 'block'; // Show options
        } else {
            this.clearOptions();
        }
    }
*/  
    handleFilterInput(inputValue: any) {
        // Clear existing options
        this.optionsContainer.innerHTML = '';
        if (inputValue.length >= 2) {
            // Fetch or filter options based on inputValue
            this.fetchOptions(inputValue).then(options => {
                options.forEach(option => {
                    const optionDiv = document.createElement('div');
                    optionDiv.textContent = option;
                    optionDiv.classList.add('option');
                    optionDiv.addEventListener('click', () => this.onSelectOption(option));
                    this.optionsContainer.appendChild(optionDiv);
                });
            });
        }
    }

    onSelectOption(optionSelected: string) {
        this.inputValue.value = optionSelected;
        this.hideModal();
        const event = new CustomEvent('optionSelected', { 
            detail: { option: optionSelected }
        });
        this.dispatchEvent(event);
    }

    fetchOptions(searchText: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (this._config.dynamic_options_service) {
                // Fetch dynamic options from the service
                const serviceUrl = `${this._config.dynamic_options_service}${encodeURIComponent(searchText)}`;
                console.log("serviceUrl : ", serviceUrl);
                fetch(serviceUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("data received : ", data);
                        const options = data.result.map((item: any) => item.name);
                        resolve(options);
                    })
                    .catch(error => {
                        console.error('Error fetching dynamic options:', error);
                        reject(error);
                    });
            } else if (this._config.static_options) {
                // Filter static options based on searchText
                const filteredOptions = this._config.static_options.filter((option: any) =>
                    option.toLowerCase().includes(searchText.toLowerCase())
                );
                resolve(filteredOptions);
            } else {
                // Resolve with an empty array if there are no options to fetch or filter
                resolve([]);
            }
        });
    }




    onClear() {
        this.filterInput.value = ''; // Clear the filterInput field
        this.clearButton.style.visibility = 'hidden'; // Hide the clear button
        this.clearOptions();
        // Dispatch a clear event if needed
        this.dispatchEvent(new CustomEvent('clear'));
    }

    clearOptions() {
        this.optionsContainer.innerHTML = '';
        this.optionsContainer.style.display = 'none'; // Hide options
    }
}

// Define the new element
customElements.define('search-input', SearchInput);