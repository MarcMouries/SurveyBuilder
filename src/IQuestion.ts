export interface IQuestion {
    index?: number; 
    title: string;
    name: string;
    isRequired?: boolean;
    isVisible? : boolean;
    type: string;
    items? : string[];
    options? : string[];
    options_source?: string[];
    visible_when?: string;
    includeOtherOption?: any;
    placeholder? : string;
    detailQuestions?: IQuestion[];
}