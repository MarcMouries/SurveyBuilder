
import { OneChoice } from "./OneChoice.ts";
import type { IQuestion } from "../IQuestion.ts";

/**
 * A subclass of OneChoice specifically designed for Yes/No questions. 
 * It provides a binary choice between two radio buttons labeled 'Yes' and 'No'.
 * Example Question: "Do you have any previous experience with our products?"
 * (*) Yes () No
 */
export class YesNoQuestion2 extends OneChoice {
    constructor(question: IQuestion, index: number) {
        // Temporarily adjust the items for Yes/No questions
        const modifiedQuestion = { ...question, items: ['Yes', 'No'] };
        super(modifiedQuestion, index);
    }
}
