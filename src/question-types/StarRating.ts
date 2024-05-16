import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import { StarRatingComponent } from '../component/StarRatingComponent.ts';
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

/**
 * Star Rating Question
 */
export class StarRating  extends QuestionComponent {
    constructor(question: IQuestion, index: number) {
        super(question, index);

        const component = document.createElement('star-rating-component') as StarRatingComponent;
        this.questionDiv.appendChild(component);

        component.addEventListener('SelectionChanged', (event) => {
            const customEvent = event as CustomEvent<{ value: number }>;

            const response: IQuestionResponse = {
                questionName: question.name,
                response: parseInt(customEvent.detail.value.toString())
            };
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }
}
