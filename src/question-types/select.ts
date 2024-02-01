import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { SearchInput } from '../component/SearchInput.ts';
import { QuestionType } from "./QuestionType.ts";

export class SelectQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        //this.questionDiv.className += ' select-question';

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
            const answerEvent = new CustomEvent<IQuestionResponse>(
                'answerSelected', { detail: response });

            this.questionDiv.dispatchEvent(answerEvent);
        });
    }
}