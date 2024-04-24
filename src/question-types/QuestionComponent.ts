import { createQuestionTitle } from './common.js';
import type { IQuestion } from "../IQuestion.ts";
import type { IQuestionComponent } from "./IQuestionComponent.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { EventEmitter} from '../EventEmitter.ts'
import { ANSWER_SELECTED } from '../EventTypes';


export abstract class QuestionComponent implements IQuestionComponent {
    protected questionDiv: HTMLDivElement;
    public questionData: IQuestion;

    constructor(question: IQuestion, index: number) {
        this.questionData = question;
        this.questionDiv = document.createElement('div');
        this.questionDiv.className = `question ${question.type}-question`;
        this.questionDiv.dataset.index = index.toString();
        this.questionDiv.dataset.questionName = question.name;

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
            const responseEvent = event as CustomEvent<IQuestionResponse>;
            EventEmitter.emit(ANSWER_SELECTED, responseEvent.detail);
        });
    }

    public show() {
        this.questionDiv.style.display = 'block';
    }

    public hide() {
        this.questionDiv.style.display = 'none';
    }

    public getQuestionDiv () : HTMLDivElement {
        return this.questionDiv;
    }
}
