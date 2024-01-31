export interface IQuestion {
    title: string;
    name: string;
    isRequired: boolean;
    type: string;
    choices : string[];
    options : string[];
    options_source: string[];
    visible_when: string;
}