import { createQuestionTitle } from './common.ts';
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionComponent } from "./IQuestionComponent.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";


export abstract class QuestionType implements IQuestionComponent {
    protected questionDiv: HTMLDivElement;
    public question: IQuestion;

    constructor(protected surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        this.question = question;
        this.questionDiv = document.createElement('div');
        this.questionDiv.className = 'question';
        this.questionDiv.dataset.index = index.toString();

        const title = createQuestionTitle(question.title);
        this.questionDiv.appendChild(title);

        this.setupResponseListener();
    }

    protected setupResponseListener() {
        this.questionDiv.addEventListener("answerSelected", (event: Event) => {
            // Use a type assertion to treat the event as a CustomEvent with detail of type IQuestionResponse
            const customEvent = event as CustomEvent<IQuestionResponse>;
            const response = customEvent.detail;
            this.surveyBuilder.setResponse(response);
        });
    }
    

    public show () {
        this.questionDiv.style.display = 'block';
    }
    public hide () {
        this.questionDiv.style.display = 'none';
    }

}
