export interface IQuestion {

    title: string;
    name: string;
    isRequired: boolean;
    type: string;
    items : string[];
    options : string[];
    options_source: string[];
    visible_when: string;
    detailQuestions?: Array<{label: string, placeholder: string}>;
}