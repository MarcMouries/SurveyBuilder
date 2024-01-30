import { createQuestionTitle } from './common.js';


export function createRankingQuestion(element, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.dataset.index = index.toString();

    const title = createQuestionTitle(element.title);
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
