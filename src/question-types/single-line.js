import { createQuestionTitle } from './common.js';

export function createSingleLineTextQuestion(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.dataset.index = index.toString();

    const title = createQuestionTitle(element.title);
    questionDiv.appendChild(title);

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.name = element.name;
    inputField.required = element.isRequired;
    inputField.className = 'single-line-text-input';
    questionDiv.appendChild(inputField);

    this.surveyContainer.appendChild(questionDiv);

    // Event listener for input change
    inputField.addEventListener('input', () => {
        this.setResponse(element.name, inputField.value);
    });
}
