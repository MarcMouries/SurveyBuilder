import type { IQuestionResponse } from "./IQuestionResponse";


export class AnswerSelectedEvent extends CustomEvent<IQuestionResponse> {
    constructor(response: IQuestionResponse) {
        super("answerSelected", { detail: response });
    }
}