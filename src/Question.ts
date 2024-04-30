import type { IQuestion } from './IQuestion.ts';

export class Question implements IQuestion {
  static currentQuestionNumber: number = 0;

  index: number;
  title: string;
  name: string;
  isRequired?: boolean | undefined;
  isVisible?: boolean | undefined;
  type: string;
  items?: string[] | undefined;
  options?: string[] | undefined;
  options_source?: string[] | undefined;
  visible_when?: string | undefined;
  includeOtherOption?: any;
  placeholder?: string | undefined;
  detailQuestions?: IQuestion[] | undefined;

  constructor(data: Omit<IQuestion, 'index'>) {
    this.index = Question.currentQuestionNumber++;
    this.title = data.title;
    this.name = data.name;
    this.type = data.type;
    this.isRequired = data.isRequired !== undefined ? data.isRequired : false;
    this.isVisible = typeof data.isVisible === 'boolean' ? data.isVisible : true;
    this.items = data.items;
    this.options = data.options;
    this.options_source = data.options_source;
    this.visible_when = data.visible_when;
    this.includeOtherOption = data.includeOtherOption;
    this.placeholder = data.placeholder;
    this.detailQuestions = data.detailQuestions;
  }

  addItem(item: string) {
    this.items?.push(item);
  }
}