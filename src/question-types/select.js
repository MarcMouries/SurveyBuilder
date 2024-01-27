import { createQuestionTitle } from './common.js';

export function    createSelectQuestion(element, index) {
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