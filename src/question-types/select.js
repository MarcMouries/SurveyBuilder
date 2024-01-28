import { createQuestionTitle } from './common.js';
import { SearchInput } from './search-input.js';


export function createSelectQuestion(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question select-question';
    questionDiv.dataset.index = index;

    const title = createQuestionTitle(element.title);
    questionDiv.appendChild(title);


    // Instantiate the search-input component
    const searchComponent = document.createElement('search-input');
    questionDiv.appendChild(searchComponent);
    this.surveyContainer.appendChild(questionDiv);

    // Create configuration object for search-input
    const config = {
        static_options: element.options || [],
        dynamic_options_service: element.options_source
    };

    // Apply the configuration to the search-input component
    searchComponent.setConfig(config);

    // Listen for selection from search-input and handle it
    searchComponent.addEventListener('optionSelected', (event) => {
        const selectedOption = event.detail.option;
        // Handle the selected option (e.g., set the response)
        this.setResponse(element.name, selectedOption);
    });
}


export function createSelectQuestion_2(element, index) {
    // Create the container, input field, and options container
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question custom-select-container';
    questionDiv.dataset.index = index; // Store index for visibility conditions

    const searchInput = document.createElement('input');
    searchInput.className = 'custom-select-search';
    searchInput.placeholder = 'Type to search...';

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options-container';

    questionDiv.appendChild(searchInput);
    questionDiv.appendChild(optionsContainer);
    this.surveyContainer.appendChild(questionDiv);

    // Event listener for focus to show the options container
    searchInput.addEventListener('focus', () => {
        optionsContainer.style.display = 'block'; // Show the options container
        if (element.options) {
            populateOptions.call(this, optionsContainer, element.name, element.options, searchInput);
        }
    });

    // Event listener for input to handle dynamic search/filtering
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.trim();
        if (searchText.length >= 2) {
            if (element.options_source) {
                // Fetch options dynamically if options_source is provided
                fetchAndUpdateOptions.call(this, element.options_source, searchText, optionsContainer);
            } else if (element.options) {
                // Filter static options based on search text
                filterOptions.call(this, searchText, element.name, element.options, optionsContainer, searchInput);
            }
        }  else {
            if (element.options) {
                populateOptions.call(this, optionsContainer, element.name, element.options, searchInput);
            } else {
                optionsContainer.innerHTML = '';
            }
        }
    });

    // Ensure that clicking outside the options container will close it
    document.addEventListener('click', (event) => {
        if (!questionDiv.contains(event.target)) {
            optionsContainer.style.display = 'none';
        }
    });
}

function fetchAndUpdateOptions(url, query, container) {
    // Fetch options from the API and update the options container
    // Implementation here...
}

function filterOptions(searchText, elementName, options, container, inputField) {
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchText.toLowerCase())
    );
    populateOptions.call(this, container, elementName, filteredOptions, inputField);
}


function populateOptions(container, elementName, options, inputField) {

    container.innerHTML = ''; // Clear existing options

    options.forEach(optionValue => {
        const optionDiv = document.createElement('div');
        optionDiv.textContent = optionValue;
        optionDiv.className = 'custom-option';
        optionDiv.addEventListener('click', () => {
            this.setResponse(elementName, optionValue);
            inputField.value = optionValue; // Set the selected value to the input field
            container.style.display = 'none'; // Hide options container
        });
        container.appendChild(optionDiv);
    });
}


export function createSelectQuestion_OLD(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question select-question';
    questionDiv.dataset.index = index.toString();

    const title = createQuestionTitle(element.title);
    questionDiv.appendChild(title);

    const input = document.createElement('input');
    input.setAttribute('list', `${element.name}-list`);
    input.name = element.name;
    input.placeholder = "Start typing";

    const dataList = document.createElement('datalist');
    dataList.id = `${element.name}-list`;

    questionDiv.appendChild(input);
    questionDiv.appendChild(dataList);
    this.surveyContainer.appendChild(questionDiv);

    if (element.options) {
        element.options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            dataList.appendChild(option);
        });
    } else if (element.options_source) {
        input.addEventListener('input', () => {
            const inputValue = input.value.trim();
            if (inputValue.length >= 2) { // Check if input length is at least 2
                this.fetchAndUpdateOptions(element.options_source, inputValue, dataList);
            } else {
                dataList.innerHTML = ''; // Clear the datalist if input is too short
            }
        });
    }
}


function fetchAndUpdateOptions(url, query, dataList) {
    if (!url || !dataList) return;

    fetch(`${url}${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            dataList.innerHTML = ''; // Clear existing options
            data.result.forEach(item => {
                const option = document.createElement('option');
                option.value = item.abbreviation;
                dataList.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching options:', error));
}