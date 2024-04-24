import type { IQuestion } from "../IQuestion";

export interface IQuestionComponent {
    questionData: IQuestion;
    getQuestionDiv(): HTMLDivElement;
    show() : void;
    hide() : void;
    setTitle(title: string): void;
}