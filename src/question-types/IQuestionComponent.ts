import type { IQuestion } from "../IQuestion";

export interface IQuestionComponent {
    question: IQuestion;
    show() : void;
    hide() : void;
}