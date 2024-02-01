import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { QuestionType } from "./QuestionType.ts";


export class MultiLineTextQuestion extends QuestionType {

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        //this.questionDiv.className += ' multi-line-question';

        const textArea = document.createElement('textarea');
        textArea.name = question.name;
        textArea.required = question.isRequired;
        textArea.className = 'multi-line-text-input';
        textArea.placeholder = 'Enter your comments here...';
        this.questionDiv.appendChild(textArea);


        // Event listener for input change
        textArea.addEventListener('input', () => {
            
            const response: IQuestionResponse = {
                questionName: question.name,
                response: textArea.value
            };

            const answerEvent = new CustomEvent<IQuestionResponse>(
                'answerSelected', { detail: response });
            this.questionDiv.dispatchEvent(answerEvent);

        });
    }
}