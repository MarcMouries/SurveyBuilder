import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { SearchInput } from '../component/SearchInput.ts';
import { QuestionComponent } from "./QuestionComponent.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";

export class SelectQuestion extends QuestionComponent {

    constructor(question: IQuestion, index: number) {
        super(question, index);

        // Specific implementation for select question
        const searchComponent = document.createElement('search-input') as SearchInput;

        this.questionDiv.appendChild(searchComponent);

        // Create configuration object for search-input
        const config = {
            static_options: question.options || [],
            dynamic_options_service: question.options_source
        };

        // Apply the configuration to the search-input component
        searchComponent.setConfig(config);

        // Listen for selection from search-input and handle it
        searchComponent.addEventListener('optionSelected', (event) => {
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