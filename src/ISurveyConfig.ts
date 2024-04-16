import type { IQuestion } from './IQuestion';

export interface ISurveyConfig {
  surveyTitle: string;
  surveyDescription: string;
  questions: IQuestion[];
}