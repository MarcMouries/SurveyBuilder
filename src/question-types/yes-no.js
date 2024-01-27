import { createQuestionTitle } from './common.js';

export function createYesNoQuestion(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question yes-no-question';
    questionDiv.dataset.index = index.toString();

    const title = createQuestionTitle(element.title);
    questionDiv.appendChild(title);

    // Create the switch-field container
    const yesNoField = document.createElement('div');
    yesNoField.className = 'yes-no';

    // Create Yes radio button
    const yesRadio = createRadio('Yes', element.name, `${element.name}-yes`);
    const yesLabel = createLabel(`${element.name}-yes`, 'Yes');
    yesNoField.appendChild(yesRadio);
    yesNoField.appendChild(yesLabel);

    // Create No radio button
    const noRadio = createRadio('No', element.name, `${element.name}-no`);
    const noLabel = createLabel(`${element.name}-no`, 'No');
    yesNoField.appendChild(noRadio);
    yesNoField.appendChild(noLabel);

    questionDiv.appendChild(yesNoField);
    this.surveyContainer.appendChild(questionDiv);

    // Event listener to store response
    yesNoField.addEventListener('change', (event) => {
        this.setResponse(element.name, event.target.value);
        this.evaluateVisibilityConditions();
    });
}

function createRadio(value, name, id) {
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.id = id;
    radioInput.name = name;
    radioInput.value = value;
    return radioInput;
}

function createLabel(forId, text) {
    const label = document.createElement('label');
    label.htmlFor = forId;
    label.textContent = text;
    return label;
}
