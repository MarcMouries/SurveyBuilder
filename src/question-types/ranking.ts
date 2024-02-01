import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import { QuestionType } from "./QuestionType.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class RankingQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);

        const rankingList = document.createElement('div');
        rankingList.className = `ranking-list ${question.name}`;

        question.items.forEach((item, index) => {
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

            const itemText = document.createElement('div');
            itemText.className = 'item-text';
            itemText.textContent = item;
            listItem.appendChild(itemText);

            rankingList.appendChild(listItem);
        });

        this.questionDiv.appendChild(rankingList);

        // Setup drag-and-drop event listeners
        this.setupDragAndDropListeners(rankingList, question);

    }
    private setupDragAndDropListeners(rankingList: HTMLElement, question: IQuestion) {
        const dragOverHandler = (event: DragEvent) => {
            event.preventDefault(); // Necessary to allow dropping
            // Implement logic to visually indicate where the item will be dropped
        };

        const dropHandler = (event: DragEvent) => {
            event.preventDefault();
            // Implement logic to update the DOM based on the drop
            // Then, collect the updated order and dispatch the event

            const updatedOrder = Array.from(rankingList.querySelectorAll('.ranking-item'))
                .map((item, index) => {
                    // Assuming itemText is directly contained in the item
                    // If it's nested further, you may need to adjust the selector
                    const itemText = (item as HTMLElement).querySelector('.item-text')?.textContent ?? 'Unknown Item';
                    return {
                        rank: index + 1,
                        item: itemText
                    };
                });

            const response: IQuestionResponse = {
                questionName: question.name,
                response: updatedOrder
            };

            console.log(response)
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        };

        // Add event listeners to the ranking list
        rankingList.addEventListener('dragover', dragOverHandler);
        rankingList.addEventListener('drop', dropHandler);
    }
}