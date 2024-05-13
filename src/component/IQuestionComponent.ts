import type { IQuestion } from "../IQuestion";

export interface IQuestionComponent {
    question: IQuestion;
    getQuestionDiv(): HTMLDivElement;
    show() : void;
    hide() : void;
    setTitle(title: string): void;
    
}