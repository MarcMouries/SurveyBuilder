import { createQuestionTitle } from './common.ts';
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionComponent } from "./IQuestionComponent.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";


export abstract class QuestionType implements IQuestionComponent {
    protected questionDiv: HTMLDivElement;
    public questionData: IQuestion;

    constructor(protected surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        this.questionData = question;
        this.questionDiv = document.createElement('div');
        this.questionDiv.className = `question ${question.type}-question`;
        
        this.questionDiv.dataset.index = index.toString();
        this.questionDiv.dataset.questionName = question.name;

        this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);

        const title = createQuestionTitle(question.title);
        this.questionDiv.appendChild(title);

        this.setupResponseListener();
    }

    protected setupResponseListener() {
        this.questionDiv.addEventListener("answerSelected", (event: Event) => {
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

    updateTitle(newTitle: string) {
        const titleElement = document.querySelector(`[data-question-name="${this.questionData.name}"] .question-title`);
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }
    

}
