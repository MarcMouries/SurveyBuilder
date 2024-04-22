import { createQuestionTitle } from './common.js';
import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionComponent } from "./IQuestionComponent.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";


export abstract class QuestionComponent implements IQuestionComponent {
    protected questionDiv: HTMLDivElement;
    public questionData: IQuestion;

    constructor(protected surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        this.questionData = question;
        this.questionDiv = document.createElement('div');
        this.questionDiv.className = `question ${question.type}-question`;
        this.questionDiv.dataset.index = index.toString();
        this.questionDiv.dataset.questionName = question.name;

        // Append the question to the survey
        this.surveyBuilder.addQuestionElement(this.questionDiv);

        // Create and append the question title
        const titleElement = createQuestionTitle(question.title);
        titleElement.classList.add('question-title');
        this.questionDiv.appendChild(titleElement);

        this.setupResponseListener();
    }

    setTitle(newTitle: string): void {
        this.questionData.title = newTitle;

        // Find the title element within this question component's div and update its text content
        const titleElement = this.questionDiv.querySelector('.question-title');
        if (titleElement) {
            titleElement.textContent = newTitle;
        } else {
            console.error('Title element not found for question:', this.questionData.name);
        }
    }

    protected setupResponseListener() {
        this.questionDiv.addEventListener("answerSelected", (event: Event) => {
            const customEvent = event as CustomEvent<IQuestionResponse>;
            const response = customEvent.detail;
            this.surveyBuilder.setResponse(response);
        });
    }

    public show() {
        this.questionDiv.style.display = 'block';
    }

    public hide() {
        this.questionDiv.style.display = 'none';
    }
}
