export interface IQuestionResponse {
    questionName: string;
    response: string | boolean | string[] | { [key: string]: any };
}