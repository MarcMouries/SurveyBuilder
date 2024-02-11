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
                .search-input {
                    position: relative;
                }

                .search-input .input-value {
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
                    z-index: 9999;
                    flex-direction: column;
                }

                .input-value input, .header-filter-container input {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: inherit;
                }

                .header-filter-container {
                    display: flex;
                    padding: 8px;
                }

                .header-filter-container .search-icon {
                    position: absolute;
                    left: 10px; 
                    pointer-events: none;
                }

                .header-filter-container .input-with-clear {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .header-filter-container .input-with-clear input {
                    flex-grow: 1;
                    _width: 100%;
                    padding-left: 40px; /* Space for the search icon */
                    padding-right: 30px; /* Space for the clear icon */

                    _padding: 12px 16px 12px 12px; /* padding to not overlap with the clear icon */
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }

                /* Additional styles to ensure the clear button only shows when there's text */
                .header-filter-container input:valid + .clear-icon {
                    display: block;
                }

                .header-filter-container .input-with-clear .magnifier-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    fill: #293E41; 
                }
                
                .header-filter-container .clear-icon {
                    position: absolute;
                    right: 10px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 0;
                    color: #293E40;
                }
                                
                .header-filter-container .clear-icon svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .main-options-container {
                    overflow-y: auto;
                    flex-grow: 1;                    
                    margin-left: 8px;
                    margin-right: 8px;
                }
                .main-options-container .option {
                    padding: 8px; 
                    margin: 2px 0;
                    cursor: pointer;
                    border: 1px solid lightgray;
                    border-radius: 4px;

                    transition: background-color 0.3s;
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
                    cursor: pointer; 
                    transition: background-color 0.3s; 
                }
                .footer-actions-container .button:hover {
                    background-color: #45a049;
                }
            </style>
            <div class="search-input">
                <div class="input-value">
                    <input type="text" autocomplete="off" placeholder="Type to search...">
                </div>
                <div class="modal-container">
                    <div class="header-filter-container">
                        <div class="input-with-clear">
                            <svg class="search-icon" width="28px" height="28px" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Group-6" transform="translate(1.000000, 1.000000)" stroke="#293E41" stroke-width="1.8">
                                        <ellipse id="Oval" transform="translate(11.982318, 12.085276) rotate(-45.000000) translate(-11.982318, -12.085276) " cx="11.9823181" cy="12.0852763" rx="7.8125" ry="7.90909091"></ellipse>
                                        <path d="M21.0889963,17.3736826 L21.0889963,25.0067188" id="Line-2" stroke-linecap="square" transform="translate(21.088996, 21.139916) rotate(-45.000000) translate(-21.088996, -21.139916) "></path>
                                    </g>
                                </g>
                            </svg>
                            <input type="text" autocomplete="off" placeholder="Type to search...">
                            <button type="button" class="clear-icon" aria-label="Clear">
                                <svg width="19px" height="19px" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg">
                                    <g stroke-linecap="square" stroke="#293E40" stroke-width="1.8">
                                        <path d="M15.5361199,15.5563492 L0,0"></path>
                                        <path d="M0,15.5563492 L15.5361199,0"></path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="main-options-container">
                    </div>
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