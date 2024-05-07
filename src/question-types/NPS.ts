import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionComponent } from "./QuestionComponent.ts";
import { NpsComponent } from '../component/NpsComponent.ts';
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

/**
 * NPS Question
 */
export class NPS  extends QuestionComponent {
    constructor(question: IQuestion, index: number) {
        super(question, index);

        const npsComponent = document.createElement('nps-component') as NpsComponent;
        this.questionDiv.appendChild(npsComponent);


        npsComponent.addEventListener('optionSelected', (event) => {
            const customEvent = event as CustomEvent<{ option: string }>;
            const selectedOption = customEvent.detail.option;
            console.log("In searchComponent optionSelected: ", selectedOption);
            const response: IQuestionResponse = {
                questionName: question.name,
                response: selectedOption
            };
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }
}
