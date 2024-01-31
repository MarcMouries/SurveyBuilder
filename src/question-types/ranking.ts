import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import { QuestionType } from "./QuestionType.ts";

export class RankingQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        this.questionDiv.className += ' ranking-question';

        const rankingList = document.createElement('div');
        rankingList.className = `ranking-list ${question.name}`;

        question.choices.forEach((choice, index) => {
            const listItem = document.createElement('div');
            listItem.setAttribute('draggable', 'true');
            listItem.className = 'ranking-item';

            const dragIcon = document.createElement('div');
            dragIcon.className = 'drag-icon';
            dragIcon.textContent = '≡';
            listItem.appendChild(dragIcon);

            const indexDiv = document.createElement('div');
            indexDiv.className = 'index';
            indexDiv.textContent = `${index + 1}`;
            listItem.appendChild(indexDiv);

            const choiceText = document.createElement('div');
            choiceText.className = 'choice-text';
            choiceText.textContent = choice;
            listItem.appendChild(choiceText);

            rankingList.appendChild(listItem);
        });

        this.questionDiv.appendChild(rankingList);
        this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    }
}
