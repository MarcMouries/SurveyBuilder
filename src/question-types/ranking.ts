import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class RankingQuestion extends QuestionComponent {
    placeholder: HTMLDivElement;

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);

        const rankingList = document.createElement('div');
        rankingList.className = `ranking-list ${question.name}`;

        // Initialize placeholder
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'placeholder';
        this.placeholder.textContent = 'Drop here...';


        question.items.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.setAttribute('draggable', 'true');
            listItem.className = 'ranking-item';
            listItem.setAttribute('data-rank', `${index} + 1`);


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

        this.setupDragAndDropListeners(rankingList, question);

    }
    private setupDragAndDropListeners(rankingList: HTMLElement, question: IQuestion) {
        let draggedItem: HTMLElement | null = null;
        let lastAfterElement: Element | null = null; // Track the last element before which the placeholder was inserted
    
        rankingList.addEventListener('dragstart', (event) => {
            draggedItem = event.target as HTMLElement;
            draggedItem.classList.add('dragging');
        });
    

        rankingList.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (!draggedItem) return;
        
            const afterElement = this.getDragAfterElement(rankingList, event.clientY);
            // Only move the placeholder if afterElement has changed
            if (afterElement !== lastAfterElement) {
                lastAfterElement = afterElement; // Update lastAfterElement
                if (afterElement) {
                    rankingList.insertBefore(this.placeholder, afterElement);
                } else {
                    // If afterElement is null, place the placeholder at the end of the list
                    rankingList.appendChild(this.placeholder);
                }
            }
        });
        
        rankingList.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null; 
                this.placeholder.remove();
                lastAfterElement = null; 
            }
        });

        rankingList.addEventListener('drop', (event) => {
            event.preventDefault();
            if (!draggedItem) return;
        
            // Move the draggedItem to its new position
            if (this.placeholder.parentNode) {
                rankingList.insertBefore(draggedItem, this.placeholder);
            }
        
            // Cleanup: Remove the placeholder
            this.placeholder.remove();
        
            // Update the ranks based on the new order
            const rankingItems = rankingList.querySelectorAll('.ranking-item');
            rankingItems.forEach((item, index) => {
                const itemText = item.querySelector('.item-text')?.textContent ?? 'Unknown Item';
                const indexDiv = item.querySelector('.index');
                if (indexDiv) {
                    indexDiv.textContent = `${index + 1}`;
                }
                item.setAttribute('data-rank', `${index + 1}`);
            });
        
            // Construct the updated order for the response
            const updatedOrder = Array.from(rankingItems).map((item, index) => ({
                rank: index + 1,
                item: item.querySelector('.item-text')?.textContent ?? 'Unknown Item'
            }));
        
            // Dispatch the updated order
            const response: IQuestionResponse = {
                questionName: question.name,
                response: updatedOrder
            };
            console.log("Updated Order: ", response);
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
        
    }


    getDragAfterElement(container: HTMLElement, y: number) {
        const draggableElements = Array.from(container.querySelectorAll('.ranking-item:not(.dragging)'));
        let closestElement = null;
        let closestDistance = Number.POSITIVE_INFINITY; // Use POSITIVE_INFINITY for comparison

        draggableElements.forEach(element => {
            const box = element.getBoundingClientRect();
            const offset = y - box.bottom; // Difference from the cursor to the bottom of the element

            // When offset is positive, the cursor is below the element
            // We're looking for the element with the smallest positive offset
            if (offset < closestDistance && offset > 0) {
                closestDistance = offset;
                closestElement = element;
            }
        });

        return closestElement; // This could be null if no element is below the cursor
    }

    private collectUpdatedOrder(rankingList: HTMLElement): IQuestionResponse['response'] {
        return Array.from(rankingList.querySelectorAll('.ranking-item'))
            .map((item, index) => ({
                rank: index + 1,
                item: (item as HTMLElement).querySelector('.item-text')?.textContent ?? 'Unknown Item',
            }));
    }
}