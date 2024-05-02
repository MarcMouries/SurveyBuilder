import {
    FollowUpQuestion, RankingQuestion, SelectQuestion, SingleLineTextQuestion,
    MultiChoice, OneChoice, MultiLineTextQuestion, YesNoQuestion2
} from './question-types/index.js';
import type { IQuestionComponent } from "./question-types/IQuestionComponent.ts";
import type { ISurveyBuilder } from './ISurveyBuilder.ts';
import type { IQuestion } from './IQuestion.ts';
import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';
import { SurveyModel } from './SurveyModel.ts';
import { EventEmitter } from './EventEmitter.ts'
import { TITLE_UPDATED, ANSWER_SELECTED } from './EventTypes';
import { SurveyPage } from "./SurveyPage";

class SurveyBuilder {
    private VERSION: String = "0.05.02.1";

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

        this.initializeSurveyPages();

        this.questionComponents = [];

        EventEmitter.on(TITLE_UPDATED, (index: number, newTitle: string) => this.handleTitleUpdate(index, newTitle));
        EventEmitter.on(ANSWER_SELECTED, (response: IQuestionResponse) => this.handleResponse(response));
    }
    private initializeSurveyPages() {

        // LANDING PAGE
        this.landingPage = new SurveyPage('landing-page');
        this.landingPage.setTitle(this.surveyModel.getTitle());
        this.landingPage.setContent(this.surveyModel.getDescription());
        this.surveyContainer.appendChild(this.landingPage.pageContainer);

        // Setup Questions Page
        this.questionsPage = new SurveyPage('survey-questions');
        this.questionsPage.hide();
        this.surveyContainer.appendChild(this.questionsPage.pageContainer);

        // Setup Thank You Page
        this.thankYouPage = new SurveyPage('thank-you-page');
        this.thankYouPage.setTitle("Thank you for your input");
        this.thankYouPage.setContent(
            `<p style="text-align: center; margin: 20px; font-size: 1.3rem;">
            You can safely close this page.</p>
            <p style="text-align: center; margin: 20px; font-size: 1.1rem;">
            If you wish to discover how ServiceNow Creator Workflows 
            can streamline your business processes and enhance automation,  
            please follow this link to learn more about 
            <a href=http://URL_TO_SERVICE_NOW_CREATOR_WORKFLOWS>ServiceNow Creator Workflows</a>.</p>`);
        this.thankYouPage.hide();
        this.surveyContainer.appendChild(this.thankYouPage.pageContainer);

        // NAVIGATION
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'survey-nav';
        this.buttonsContainer.role = 'navigation';
        this.surveyContainer.appendChild(this.buttonsContainer);

        this.buttons.set('start', this.createButton('Start Survey', 'survey-button', () => this.startSurvey(), 'block'));
        this.buttons.set('prev', this.createButton('Previous', 'survey-button', () => this.showPreviousQuestion(), 'none'));
        this.buttons.set('next', this.createButton('Next', 'survey-button', () => this.showNextQuestion(), 'none'));
        this.buttons.set('complete', this.createButton('Complete', 'survey-button', () => this.finishSurvey(), 'none'));
    }

    private setUpSurveyModel(config: any): boolean {
        try {
            if (typeof config === 'string' && config.trim() === '') {
                this.displayErrorMessage('empty');
                console.error("SurveyModel config is empty!");
                return false;
            } else if (typeof config === 'string') {
                this.surveyModel = SurveyModel.fromJSON(config);
            } else {
                this.surveyModel = new SurveyModel(config);
            }
            return true;
        } catch (error) {
            const errorType = (error as Error).message.includes('JSON') ? 'invalid' : 'empty';
            this.displayErrorMessage(errorType);
            return false;
        }
    }



    private displayPage(page: SurveyPage) {
        this.surveyContainer.innerHTML = '';
        this.surveyContainer.appendChild(page.pageContainer);
    }

    private displayErrorMessage(errorType: 'empty' | 'invalid') {
        const errorMessage = errorType === 'empty'
            ? "The survey configuration is missing. Please ensure it is provided."
            : "The survey configuration is invalid. Please check the format and try again.";

        const errorIcon = errorType === 'empty' ? "❗" : "⚠️";

        const errorPage = new SurveyPage('error-page');
        //errorPage.setTitle("Error Encountered");
        errorPage.setContent(`
            <div id="error-message" class="error-container">
                <div class="error-icon">${errorIcon}</div>
                <h1>Error!</h1>
                <p>Oh no, something went wrong.</p>
                <p>${errorMessage}</p>
                <button onclick="location.reload()"><h1 class="red">try again</h1></button>
            </div>
        `);

        // this.surveyContainer.innerHTML = '';
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
            case "ranking": return new RankingQuestion(question, index);
            case "single-line-text": return new SingleLineTextQuestion(question, index);
            case "multi-line-text": return new MultiLineTextQuestion(question, index);
            case "yes-no": return new YesNoQuestion2(question, index);
            case "YesNoQuestion2": return new YesNoQuestion2(question, index);
            case "single-choice": return new OneChoice(question, index);
            case "multi-choice": return new MultiChoice(question, index);
            case "select": return new SelectQuestion(question, index);
            case "followup": return new FollowUpQuestion(question, index);
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
        console.log("showQuestion: ", question);
        console.log("showQuestion: ", this.questionComponents);
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

    handleResponse(response: IQuestionResponse): void {
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


    getQuestionElement(index: number): any {
        let allQuestionElements = this.questionsPage.pageContainer.getElementsByClassName(".question");

        console.log("allQuestionElements", allQuestionElements);
        console.log(allQuestionElements.length);

        return this.questionsPage.pageContainer.querySelector(`.question[data-index="${index}"]`);
    }


    finishSurvey() {
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
// Attach SurveyBuilder to the window object to make it globally accessible
window.SurveyBuilder = SurveyBuilder;