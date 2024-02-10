import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';


export interface ISurveyBuilder {
    questionNumber: any;
    surveyContainer: HTMLElement;
    setResponse: (response: IQuestionResponse) => void;
    evaluateVisibilityConditions(response: IQuestionResponse): void;
    responses: { [key: string]: any };
}