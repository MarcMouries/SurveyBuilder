import { createQuestionTitle } from './common.js';

export function createMultiLineTextQuestion(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.dataset.index = index.toString();

    const title = createQuestionTitle(element.title);
    questionDiv.appendChild(title);

    const textArea = document.createElement('textarea');
    textArea.name = element.name;
    textArea.required = element.isRequired;
    textArea.className = 'multi-line-text-input';
    textArea.placeholder = 'Enter your comments here...';
    questionDiv.appendChild(textArea);

    this.surveyContainer.appendChild(questionDiv);

    textArea.addEventListener('input', () => {
        this.setResponse(element.name, textArea.value);
    });
}