import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { SearchInput } from '../component/SearchInput.ts';
import { QuestionComponent } from "./QuestionComponent.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class SelectQuestion extends QuestionComponent {

    constructor(question: IQuestion, index: number) {
        super(question, index);

        // Specific implementation for select question
        const component = document.createElement('search-input') as SearchInput;
        component.setQuestion(question);
        this.questionDiv.appendChild(component);        

        // Listen for selection from search-input and handle it
        component.addEventListener('optionSelected', (event) => {
            const customEvent = event as CustomEvent<{ option: string }>;
            const selectedOption = customEvent.detail.option;
            console.log("In component optionSelected: ", selectedOption);
            const response: IQuestionResponse = {
                questionName: question.name,
                response: selectedOption
            };
            this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
        });
    }
}