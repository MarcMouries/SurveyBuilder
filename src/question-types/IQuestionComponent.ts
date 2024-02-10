import type { IQuestion } from "../IQuestion";

export interface IQuestionComponent {
    questionData: IQuestion;
    show() : void;
    hide() : void;
}