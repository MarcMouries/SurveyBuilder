export interface IQuestion {
    index: number; 
    title: string;
    description?: string;
    name: string;
    isRequired?: boolean;
    isVisible? : boolean;
    type: string;
    items? : string[];
    options? : string[];
    dynamic_options_service?: string;
    visible_when?: string;
    includeOtherOption?: any;
    placeholder? : string;
    detailQuestions?: IQuestion[];
}