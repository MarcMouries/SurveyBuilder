export interface IQuestionResponse {
    questionName: string;
    response: number| string | boolean | string[] | { [key: string]: any };
}