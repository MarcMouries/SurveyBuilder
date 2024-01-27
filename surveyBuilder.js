class SurveyBuilder {

    constructor(json, containerId) {
        this.json = json;
        this.surveyContainer = document.getElementById(containerId);
        this.questionNumber = 1;
        this.responses = {};
        this.createSurvey();
    }

    createSurvey() {
        this.createSurveyTitle(this.json.surveyTitle, this.surveyContainer);
        this.createSurveyDescription(this.json.surveyDescription, this.surveyContainer);

        this.json.questions.forEach((element, index) => {
            switch (element.type) {
                case "ranking":
                    this.createRankingQuestion(element, index);
                    break;
                case "single-line-text":
                    this.createSingleLineTextQuestion(element, index);
                    break;
                case "multi-line-text":
                    this.createMultiLineTextQuestion(element, index);
                    break;
                case "yes-no":
                    this.createYesNoQuestion(element, index);
                    break;
                case "select":
                    this.createSelectQuestion(element, index);
                    break;

                default:
                    console.error("Unsupported question type: " + element.type);
            }
        });

        this.addDragAndDrop();
        this.createCompleteButton(this.surveyContainer);
    }

    setResponse(questionName, response) {
        this.responses[questionName] = response;
    }

    evaluateVisibilityConditions() {
        // Go through each question and determine if it should be shown based on the visible_when condition
        this.json.questions.forEach((question, index) => {
            const questionElement = this.surveyContainer.querySelector(`.question[data-index="${index}"]`);
            if (question.visible_when) {
                const condition = question.visible_when.split('=').map(s => s.trim());
                const questionToCheck = condition[0];
                const expectedAnswer = condition[1].toLowerCase();
                const actualAnswer = this.responses[questionToCheck] ? this.responses[questionToCheck].toLowerCase() : null;

                if (actualAnswer === expectedAnswer) {
                    questionElement.style.display = 'block';
                } else {
                    questionElement.style.display = 'none';
                }
            }
        });
    }
    createSurveyTitle(surveyTitle, container) {
        const title = document.createElement('h3');
        title.className = 'survey-title';
        title.textContent = surveyTitle;

        container.appendChild(title);
    }

    createSurveyDescription(surveyDescription, container) {
        const description = document.createElement('p');
        description.className = 'survey-description';
        description.innerHTML = surveyDescription;

        container.appendChild(description);
    }

    createQuestionTitle(questionText) {
        const title = document.createElement('h3');
        title.className = 'question-title';

        const questionNumberSpan = document.createElement('span');
        questionNumberSpan.className = 'question-number';
        questionNumberSpan.textContent = `Q${this.questionNumber}. `;
        //title.appendChild(questionNumberSpan);

        title.append(questionText);

        this.questionNumber++;

        return title;
    }


    createSelectQuestion(element, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question select-question';
        questionDiv.dataset.index = index.toString();

        const title = this.createQuestionTitle(element.title);
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
                clearTimeout(this.debounceTimer);
                if (inputValue.length >= 2) { // Check if input length is at least 2
                    this.debounceTimer = setTimeout(() => {
                        this.fetchAndUpdateOptions(element.options_source, inputValue, dataList);
                    }, 300); // Adjust debounce time as needed
                } else {
                    dataList.innerHTML = ''; // Clear the datalist if input is too short
                }
            });
        }
    }


    fetchAndUpdateOptions(url, query, dataList) {
        if (!url || !dataList) return;

        fetch(`${url}${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                dataList.innerHTML = ''; // Clear existing options
                data.result.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.name;
                    dataList.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching options:', error));
    }


    createYesNoQuestion(element, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question yes-no-question';
        questionDiv.dataset.index = index.toString();

        const title = this.createQuestionTitle(element.title);
        questionDiv.appendChild(title);

        // Create the switch-field container
        const yesNoField = document.createElement('div');
        yesNoField.className = 'yes-no';

        // Create Yes radio button
        const yesRadio = this.createRadio('Yes', element.name, `${element.name}-yes`);
        const yesLabel = this.createLabel(`${element.name}-yes`, 'Yes');
        yesNoField.appendChild(yesRadio);
        yesNoField.appendChild(yesLabel);

        // Create No radio button
        const noRadio = this.createRadio('No', element.name, `${element.name}-no`);
        const noLabel = this.createLabel(`${element.name}-no`, 'No');
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

    createRadio(value, name, id) {
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.id = id;
        radioInput.name = name;
        radioInput.value = value;
        return radioInput;
    }

    createLabel(forId, text) {
        const label = document.createElement('label');
        label.htmlFor = forId;
        label.textContent = text;
        return label;
    }


    createSingleLineTextQuestion(element, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.index = index.toString();

        const title = this.createQuestionTitle(element.title);
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

    createMultiLineTextQuestion(element, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.index = index.toString();

        const title = this.createQuestionTitle(element.title);
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

    createRankingQuestion(element, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.index = index.toString();

        const title = this.createQuestionTitle(element.title);
        questionDiv.appendChild(title);

        const rankingList = document.createElement('div');
        rankingList.className = `ranking-list ${element.name}`;


        element.choices.forEach((choice, index) => {
            const listItem = document.createElement('div');
            listItem.setAttribute('draggable', true);
            listItem.className = 'ranking-item';

            const dragIcon = document.createElement('div');
            dragIcon.className = 'drag-icon';
            dragIcon.textContent = '≡';
            listItem.appendChild(dragIcon);

            const indexDiv = document.createElement('div');
            indexDiv.className = 'index';
            indexDiv.textContent = index + 1;
            listItem.appendChild(indexDiv);

            const choiceText = document.createElement('div');
            choiceText.className = 'choice-text';
            choiceText.textContent = choice;
            listItem.appendChild(choiceText);

            rankingList.appendChild(listItem);
        });

        questionDiv.appendChild(rankingList);
        this.surveyContainer.appendChild(questionDiv);
    }


    addDragAndDrop() {
        const lists = document.querySelectorAll('.ranking-list');

        lists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                const afterElement = this.getDragAfterElement(list, e.clientY);
                if (afterElement) {
                    list.insertBefore(draggable, afterElement);
                } else if (draggable) {
                    list.appendChild(draggable);
                }
                this.updateDraggedItemIndex(draggable, list);
            });

            list.addEventListener('dragstart', e => {
                e.target.classList.add('dragging');
            });

            list.addEventListener('dragend', e => {
                e.target.classList.remove('dragging');
                this.updateAllIndexes(list);
            });

            // If you have a 'drop' event, you can also update indexes there
            list.addEventListener('drop', e => {
                e.preventDefault();
                this.updateAllIndexes(list);
            });
        });
    }

    createCompleteButton(container) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-button';
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', () => this.finishSurvey());
        buttonContainer.appendChild(completeButton);
        container.appendChild(buttonContainer);
    }

    finishSurvey() {
        const responses = this.getResponses();
        if (this.completeCallback) {
            this.completeCallback(this.responses);
        }
        this.displayThankYouPage();
    }

    getResponses() {
        const surveyData = {
            responses: []
        };

        this.json.questions.forEach(element => {
            const questionData = {
                questionName: element.name,
                questionTitle: element.title,
                answer: null
            };

            switch (element.type) {
                case 'single-line-text':
                    const textInput = this.surveyContainer.querySelector(`input[name="${element.name}"]`);
                    questionData.answer = textInput ? textInput.value : '';
                    break;

                case 'ranking':
                    const rankingItems = Array.from(this.surveyContainer.querySelectorAll(`.${element.name} .ranking-item`));
                    console.log(rankingItems);
                    if (rankingItems.length) {
                        questionData.answer = rankingItems.map((item, idx) => ({
                            rank: idx + 1,
                            text: item.querySelector('.choice-text').textContent.trim()
                        }));
                    }
                    break;

                // Handle other question types if necessary
            }

            surveyData.responses.push(questionData);

        });
        return surveyData;
    }

    onComplete(callbackFunction) {
        this.completeCallback = callbackFunction;
    }

    displayThankYouPage() {
        // Clear the survey container
        this.surveyContainer.innerHTML = '';
        // Create the thank you message container
        const thankYouContainer = document.createElement('div');
        thankYouContainer.className = 'thank-you-container';

        // Add content to the thank you container
        thankYouContainer.innerHTML = `
        <h2>Thank you for your input.</h2>
        <p>You can close this page. </p>
        <p>Learn more about <a href="https://servicenow.com">Creator Workflows</a>.</>
        <div class="button-container">
            <button class="secondary-button">Prev</button>
            <button class="primary-button">Done</button>
        </div>
    `;
        // Append the thank you container to the survey container
        this.surveyContainer.appendChild(thankYouContainer);
    }


    // MOVE DRAG and Drop with the  necessary methods such as getDragAfterElement, updateDraggedItemIndex, updateAllIndexes into a separate file...

    getDragAfterElement(list, y) {
        const draggableElements = [...list.querySelectorAll('.ranking-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    updateDraggedItemIndex(draggedItem, list) {
        let newIndex = 0;
        Array.from(list.children).forEach((item, index) => {
            if (item !== draggedItem && item.getBoundingClientRect().top < draggedItem.getBoundingClientRect().bottom) {
                newIndex = index + 1;
            }
        });

        const indexDiv = draggedItem.querySelector('.index');
        if (indexDiv) {
            indexDiv.textContent = newIndex + 1;
        }
    }


    updateAllIndexes(list) {
        const items = list.querySelectorAll('.ranking-item');
        items.forEach((item, index) => {
            const indexDiv = item.querySelector('.index');
            if (indexDiv) {
                indexDiv.textContent = index + 1;
            }
        });
    }

}

//export default SurveyBuilder;
// Attach SurveyBuilder to the window object to make it globally accessible
window.SurveyBuilder = SurveyBuilder;