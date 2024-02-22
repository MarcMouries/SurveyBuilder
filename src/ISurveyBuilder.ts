import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';


export interface ISurveyBuilder {
    addQuestionElement(questionDiv: HTMLDivElement): void;
    setResponse (response: IQuestionResponse): void;
    evaluateVisibilityConditions(response: IQuestionResponse): void;
}