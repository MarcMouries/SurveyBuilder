import type { IQuestion } from './IQuestion.ts';

export class Question implements IQuestion {
  static currentQuestionNumber: number = 0;

  index: number;
  name: string;
  title: string;
  description: string;
  isRequired?: boolean;
  isVisible?: boolean;
  type: string;
  items?: string[];
  options?: string[];
  dynamic_options_service?: string;
  visible_when?: string;
  includeOtherOption?: any;
  placeholder?: string;
  detailQuestions?: IQuestion[];

  constructor(data: Omit<IQuestion, 'index'>) {
    this.index = Question.currentQuestionNumber++;
    this.title = data.title;
    this.name = data.name;
    this.description = data.description !== undefined ? data.description : "";
    this.type = data.type;
    this.isRequired = data.isRequired !== undefined ? data.isRequired : false;
    this.isVisible = typeof data.isVisible === 'boolean' ? data.isVisible : true;
    this.items = data.items;
    this.options = data.options;
    this.dynamic_options_service = data.dynamic_options_service;
    this.visible_when = data.visible_when;
    this.includeOtherOption = data.includeOtherOption;
    this.placeholder = data.placeholder;
    this.detailQuestions = data.detailQuestions;
  }

  addItem(item: string) {
    this.items?.push(item);
  }
}