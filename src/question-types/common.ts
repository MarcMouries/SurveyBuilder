import type { IQuestion } from "../IQuestion";
import type { ISurveyBuilder } from "../ISurveyBuilder";


export function     createQuestionTitle(
       questionText: string): HTMLElement {

    const title = document.createElement('div');
    title.className = 'question-title';

    const questionNumberSpan = document.createElement('span');
    questionNumberSpan.className = 'question-number';
    //questionNumberSpan.textContent = `Q${this.questionNumber}. `;
    //title.appendChild(questionNumberSpan);

    title.append(questionText);
    return title;
}