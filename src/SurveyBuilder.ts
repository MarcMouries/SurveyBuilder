import {
    MultiChoice, MultiLineTextQuestion, NPS, FollowUpQuestion, RankingQuestion,
    SelectQuestion, SingleLineTextQuestion, SingleChoice, StarRating, YesNoQuestion2
} from './question-types/index.js';
import type { IQuestion } from './IQuestion';
import type { IQuestionComponent } from "./component/IQuestionComponent";
import type { IQuestionResponse } from './question-types/IQuestionResponse';
import { SurveyModel } from './SurveyModel';
import { EventEmitter } from './EventEmitter'
import { TITLE_UPDATED, ANSWER_SELECTED } from './EventTypes';
import { SurveyPage } from "./SurveyPage";
import { SurveyPageFactory } from "./SurveyPageFactory"

class SurveyBuilder {
    private VERSION: String = "2024.05.17.1";

    private ERROR_CONFIG_MISSING = "The survey configuration is missing.";

    // "The survey configuration is missing. <br>Please ensure it is provided."

    private ERROR_CONFIG_INVALID = "The survey configuration is invalid.";

    private surveyModel!: SurveyModel;

    private surveyContainer!: HTMLElement;

    // PAGES
    private landingPage!: SurveyPage;
    private questionsPage!: SurveyPage;
    private thankYouPage!: SurveyPage;

    // NAVIGATION
    private buttonsContainer!: HTMLElement;
    private buttons: Map<string, HTMLElement> = new Map();

    private questionComponents: IQuestionComponent[] = [];
    private completeCallback: any;

    constructor(config: any, containerId: string) {
        console.log("SurveyBuilder: " + this.VERSION);

        // init the container
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
        }
        this.surveyContainer = containerElement;

        if (!this.setUpSurveyModel(config)) {
            return;
        }

        // initialize Survey Pages
        this.initializeSurveyPages();

        this.questionComponents = [];

        EventEmitter.on(TITLE_UPDATED, (index: number, newTitle: string) => this.handleTitleUpdate(index, newTitle));
        EventEmitter.on(ANSWER_SELECTED, (response: IQuestionResponse) => this.handleResponse(response));
    }
    private initializeSurveyPages() {

        // LANDING PAGE
        this.landingPage = SurveyPageFactory.createLandingPage(
            this.surveyModel.getTitle(), this.surveyModel.getDescription());
        this.surveyContainer.appendChild(this.landingPage.pageContainer);

        // Setup Questions Page
        this.questionsPage = new SurveyPage('survey-questions');
        this.questionsPage.hide();
        this.surveyContainer.appendChild(this.questionsPage.pageContainer);

        // Setup Thank You Page
        this.thankYouPage = SurveyPageFactory.createThankYouPage();
        this.thankYouPage.hide();
        this.surveyContainer.appendChild(this.thankYouPage.pageContainer);

        // NAVIGATION
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'survey-nav';
        this.buttonsContainer.role = 'navigation';
        this.surveyContainer.appendChild(this.buttonsContainer);

        this.buttons.set('start', this.createButton('Start Survey', 'survey-button -primary', () => this.startSurvey(), 'block'));
        this.buttons.set('prev', this.createButton('Previous', 'survey-button -secondary', () => this.showPreviousQuestion(), 'none'));
        this.buttons.set('next', this.createButton('Next', 'survey-button -primary', () => this.showNextQuestion(), 'none'));
        this.buttons.set('complete', this.createButton('Complete', 'survey-button -primary', () => this.finishSurvey(), 'none'));

    }

    private setUpSurveyModel(config: any): boolean {
        try {
            if (typeof config === 'string' && config.trim() === '') {
                this.displayErrorPage(this.ERROR_CONFIG_MISSING, "");
                console.error("SurveyModel config is empty!");
                return false;
            } else if (typeof config === 'string') {
                this.surveyModel = SurveyModel.fromJSON(config);
            } else {
                this.surveyModel = new SurveyModel(config);
            }
            return true;
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                this.displayErrorPage(this.ERROR_CONFIG_INVALID, error.message);
            } else {
                this.displayErrorPage(this.ERROR_CONFIG_INVALID, "An unexpected error occurred");
            } 
            return false;
        }
    }

    private displayErrorPage(message_one: string, message_two: string) {
        const errorPage = SurveyPageFactory.createErrorPage(message_one, message_two);
        this.surveyContainer.appendChild(errorPage.pageContainer);
    }

    private displayThankYouPage() {
        this.questionsPage.hide();
        this.thankYouPage.show();
    }

    private showButton(id: string): void {
        const button = this.buttons.get(id);
        if (button) {
            button.style.display = 'block';
        }
    }

    private hideButton(id: string): void {
        const button = this.buttons.get(id);
        if (button) {
            button.style.display = 'none';
        }
    }

    private updateButtonsVisibility() {
        console.log(`Updating buttons for current question`);
        console.log(this.surveyModel.getStateDetails());

        // Show 'Start' only if the survey hasn't started
        if (!this.surveyModel.isStarted()) {
            this.showButton('start');
            this.hideButton('prev');
            this.hideButton('next');
            this.hideButton('complete');
            return;
        }
        else {
            this.hideButton('start');
        }

        this.showButton('prev');
        this.showButton('next');

        if (this.surveyModel.isFirstQuestion()) {
            this.hideButton('prev');
        }

        if (this.surveyModel.isLastQuestion()) {
            this.hideButton('next');
            this.showButton('complete');
        }

        // Hide all buttons if the survey is completed
        if (this.surveyModel.isCompleted()) {
            this.buttonsContainer.style.display = 'none';
            // this.hideButton('start');
            // this.hideButton('prev');
            // this.hideButton('next');
            // this.hideButton('complete');
        }
    }


    private startSurvey() {
        console.log(`START SURVEY`);

        this.surveyModel.startSurvey();
        this.landingPage.hide();
        this.questionsPage.show();

        this.initializeQuestions();
        this.showQuestion(this.surveyModel.getCurrentQuestion());
    }

    private initializeQuestions() {
        this.surveyModel.getQuestions().forEach((question: IQuestion, index: number) => {
            const questionComponent = this.createQuestionComponent(question, index);
            // Initially, hide all questions
            questionComponent.hide();
            this.addQuestionElement(questionComponent.getQuestionDiv())
            this.questionComponents.push(questionComponent);
        });
    }

    createQuestionComponent(question: IQuestion, index: number): IQuestionComponent {
        switch (question.type) {
            case "followup": return new FollowUpQuestion(question, index);
            case "multi-choice": return new MultiChoice(question, index);
            case "multi-line-text": return new MultiLineTextQuestion(question, index);
            case "nps": return new NPS(question, index);
            case "select": return new SelectQuestion(question, index);
            case "single-line-text": return new SingleLineTextQuestion(question, index);
            case "single-choice": return new SingleChoice(question, index);
            case "star-rating": return new StarRating(question, index);
            case "ranking": return new RankingQuestion(question, index);
            case "yes-no": return new YesNoQuestion2(question, index);
            case "YesNoQuestion2": return new YesNoQuestion2(question, index);
            default: console.error("Unsupported question type: " + question.type);
        }
        return null!;
    }

    private showNextQuestion() {
        const nextQuestion = this.surveyModel.getNextVisibleQuestion();
        console.log(`showNextQuestion: ${nextQuestion?.title}`);

        if (nextQuestion) {
            this.showQuestion(nextQuestion);
        } else {
            console.log("No more questions available or end of survey.");
        }
    }

    private showPreviousQuestion() {
        const prevQuestion = this.surveyModel.getPreviousVisibleQuestion();
        if (prevQuestion) {
            this.showQuestion(prevQuestion);
        } else {
            console.log("This is the first question, no previous question available.");
        }
    }

    private showQuestion(question: IQuestion) {
        console.log("showQuestion: " + question.name);

        // First, hide all questions to ensure only one is shown at a time
        this.questionComponents.forEach(component => component.hide());

        // Then, show the targeted question
        this.questionComponents[question.index!].show();

        // Update navigation buttons based on the new index
        this.updateButtonsVisibility();
    }

    public addQuestionElement(questionDiv: HTMLDivElement) {
        this.questionsPage.pageContainer.appendChild(questionDiv);
    }

    private handleResponse(response: IQuestionResponse): void {
        console.log("SurveyBuilder.handleResponse: ", response);
        this.surveyModel.updateResponse(response.questionName, response.response);
    }

    private handleTitleUpdate(index: number, newTitle: string) {
        console.log("SurveyBuilder.handleTitleUpdate : " + newTitle);

        const questionComponent = this.questionComponents.at(index)
        questionComponent?.setTitle(newTitle);
    }

    private createButton(text: string, className: string, onClick: () => void, displayStyle: 'none' | 'block') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        button.style.display = displayStyle;
        this.buttonsContainer.appendChild(button);
        return button;
    }


    __DELETE_getQuestionElement(index: number): any {
        let allQuestionElements = this.questionsPage.pageContainer.getElementsByClassName(".question");

        console.log("allQuestionElements", allQuestionElements);
        console.log(allQuestionElements.length);

        return this.questionsPage.pageContainer.querySelector(`.question[data-index="${index}"]`);
    }


    private finishSurvey() {
        this.surveyModel.completeSurvey();

        this.updateButtonsVisibility();

        const responses = this.surveyModel.getResponses();
        console.log("SurveyBuilder.finishSurvey: ", responses)

        if (this.completeCallback) {
            this.completeCallback(responses);
        }

        this.displayThankYouPage();
    }

    onComplete(callbackFunction: any) {
        this.completeCallback = callbackFunction;
    }
}

//export default SurveyBuilder;
window.SurveyBuilder = SurveyBuilder;