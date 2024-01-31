import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";


export function     createQuestionTitle(
       questionText: string): HTMLElement {
    
    const title = document.createElement('h3');
    title.className = 'question-title';

    const questionNumberSpan = document.createElement('span');
    questionNumberSpan.className = 'question-number';
    //questionNumberSpan.textContent = `Q${this.questionNumber}. `;
    //title.appendChild(questionNumberSpan);

    title.append(questionText);

    //this.questionNumber++;

    return title;
}