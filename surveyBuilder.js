class SurveyBuilder {
    static create(json) {
        const surveyContainer = document.getElementById('survey-container');

        json.elements.forEach(element => {
            switch (element.type) {
                case "ranking":
                    this.createRankingQuestion(element, surveyContainer);
                    break;
                // Additional cases for other question types
                default:
                    console.warn("Unsupported question type:", element.type);
            }
        });

        this.addDragAndDrop();
        this.createCompleteButton(surveyContainer);
    }

    static createRankingQuestion(element, container) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        const title = document.createElement('h3');
        title.textContent = element.title;
        questionDiv.appendChild(title);

        const rankingList = document.createElement('div');
        rankingList.className = 'ranking-list';

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
        container.appendChild(questionDiv);
    }

    static addDragAndDrop() {
        const lists = document.querySelectorAll('.ranking-list');

        lists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                const afterElement = getDragAfterElement(list, e.clientY);
                if (afterElement) {
                    list.insertBefore(draggable, afterElement);
                } else if (draggable) {
                    list.appendChild(draggable);
                }
                updateDraggedItemIndex(draggable, list);
            });

            list.addEventListener('dragstart', e => {
                e.target.classList.add('dragging');
            });

            list.addEventListener('dragend', e => {
                e.target.classList.remove('dragging');
                updateAllIndexes(list);
            });

            // If you have a 'drop' event, you can also update indexes there
            list.addEventListener('drop', e => {
                e.preventDefault();
                updateAllIndexes(list);
            });
        });
    }

    static createCompleteButton(container) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-button';
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', () => this.printSurveyResults());
        buttonContainer.appendChild(completeButton);
        container.appendChild(buttonContainer);
    }

    static printSurveyResults() {
        const surveyData = {
            responses: []
        };

        const rankingLists = document.querySelectorAll('.ranking-list');
        rankingLists.forEach((list, index) => {
            const question = list.closest('.question').querySelector('h3').textContent;
            const answers = Array.from(list.querySelectorAll('.ranking-item')).map((item, idx) => ({
                rank: idx + 1,
                text: item.querySelector('.choice-text').textContent
            }));

            surveyData.responses.push({ question, answers });
        });

        console.log("Survey Results:", JSON.stringify(surveyData));
    }

    // ... Other necessary methods such as getDragAfterElement, updateDraggedItemIndex, updateAllIndexes ...
}

//export default SurveyBuilder;
// Attach SurveyBuilder to the window object to make it globally accessible
window.SurveyBuilder = SurveyBuilder;


function getDragAfterElement(list, y) {
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

function updateDraggedItemIndex(draggedItem, list) {
    let newIndex = 0;
    Array.from(list.children).forEach((item, index) => {
        if (item !== draggedItem && item.getBoundingClientRect().top < draggedItem.getBoundingClientRect().bottom) {
            newIndex = index + 1;
        }
    });

    const indexDiv = draggedItem.querySelector('.index');
    if (indexDiv) {
        indexDiv.textContent = newIndex + 1; // +1 because index is 0-based
    }
}


function updateAllIndexes(list) {
    const items = list.querySelectorAll('.ranking-item');
    items.forEach((item, index) => {
        const indexDiv = item.querySelector('.index');
        if (indexDiv) {
            indexDiv.textContent = index + 1;
        }
    });
}