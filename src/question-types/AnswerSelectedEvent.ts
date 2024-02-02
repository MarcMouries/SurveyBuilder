import type { IQuestionResponse } from "./IQuestionResponse.ts";


export class AnswerSelectedEvent extends CustomEvent<IQuestionResponse> {
    constructor(response: IQuestionResponse) {
        super("answerSelected", { detail: response });
    }
}