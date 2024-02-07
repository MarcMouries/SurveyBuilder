import type { IQuestion } from "../IQuestion.ts";
import type { ISurveyBuilder } from "../ISurveyBuilder.ts";
import type { IQuestionResponse } from "./IQuestionResponse.ts";
import { AnswerSelectedEvent } from "./AnswerSelectedEvent.ts";
import { QuestionType } from "./QuestionType.ts";

/**
 * An abstract base class for creating choice-based question elements. 
 * It cannot be instantiated directly but provides common functionality 
 * for its subclasses to generate input elements and their associated labels.
 */
export abstract class AbstractChoice extends QuestionType {
    protected items: string[] = [];

    constructor(surveyBuilder: ISurveyBuilder, question: IQuestion, index: number) {
        super(surveyBuilder, question, index);
        this.items = question.items;
        this.renderChoices();
    }

    protected abstract renderChoices(): void;

    protected createLabel(forId: string, text: string) {
        const label = document.createElement('label');
        label.htmlFor = forId;
        label.textContent = text;
        return label;
    }
}