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
import { TITLE_UPDATED } from './EventTypes';

class SurveyBuilder implements ISurveyBuilder {

    private surveyModel: SurveyModel;

    private surveyContainer: HTMLElement;
    private questionsContainer: HTMLElement;
    private navigationContainer!: HTMLElement;

    private nextButton!: HTMLElement;
    private prevButton!: HTMLElement;
    private completeButton!: HTMLElement;

    private questionComponents: any[];
    private completeCallback: any;

    private currentQuestion: IQuestion | null;


    constructor(config: any, containerId: string) {
        this.surveyModel = new SurveyModel(config);
        EventEmitter.on(TITLE_UPDATED, (index: number, newTitle: string) => this.handleTitleUpdate(index, newTitle));

        this.currentQuestion = null;
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
        }
        this.surveyContainer = containerElement;
        this.questionComponents = [];

        // FIRST PAGE
        const initialPage = document.createElement('div');
        initialPage.id = 'initial-page';
        this.surveyContainer.appendChild(initialPage);
        this.createInitialPage(initialPage);

        // SURVEY DIV
        this.questionsContainer = document.createElement('div');
        this.questionsContainer.id = 'survey-questions';
        this.questionsContainer.style.display = 'none'; // Hide until the survey starts
        this.surveyContainer.appendChild(this.questionsContainer);
    }

    private createInitialPage(container: HTMLElement) {
        this.createSurveyTitle(this.surveyModel.getTitle(), container);
        this.createSurveyDescription(this.surveyModel.getDescription(), container);
        this.createStartButton(container);
    }

    private createStartButton(container: HTMLElement) {
        const startButtonWrapper = document.createElement('div');
        startButtonWrapper.className = 'start-button-wrapper';

        const startButton = document.createElement('button');
        startButton.textContent = 'Start Survey';
        startButton.className = 'survey-button';
        startButton.addEventListener('click', () => {
            // Hide initial content and show questions
            container.style.display = 'none';
            this.questionsContainer.style.display = 'block';
            this.startSurvey();
        });

        startButtonWrapper.appendChild(startButton);
        container.appendChild(startButtonWrapper);
    }

    /*
    private shouldShowQuestion(question: IQuestion): boolean {
        // Placeholder: Implement actual condition evaluation logic here
        if (!question.visible_when) {
            return true;
        }
        // Evaluate the condition based on the current responses
        // Return true if the condition is met, false otherwise
        return true;
    }
*/
    private startSurvey() {
        this.questionsContainer.style.display = 'block'; // Make questions visible
        this.initializeQuestions();
        this.initNavigationButtons();
        this.showNextQuestion();
    }

    private initializeQuestions() {
        this.surveyModel.getQuestions().forEach((question: IQuestion, index: number) => {
            switch (question.type) {
                case "ranking": 
                    this.questionComponents.push(new RankingQuestion(this, question, index));
                    break;
                case "single-line-text":
                    this.questionComponents.push(new SingleLineTextQuestion(this, question, index));
                    break;
                case "multi-line-text":
                    this.questionComponents.push(new MultiLineTextQuestion(this, question, index));
                    break;
                case "yes-no":
                    //this.questions.push(new YesNoQuestion(this, question, index));
                    this.questionComponents.push(new YesNoQuestion2(this, question, index));
                    break;
                case "YesNoQuestion2":
                    this.questionComponents.push(new YesNoQuestion2(this, question, index));
                    break;
                case "one-choice":
                    this.questionComponents.push(new OneChoice(this, question, index));
                    break;
                case "multi-choice":
                    this.questionComponents.push(new MultiChoice(this, question, index));
                    break;
                case "select":
                    this.questionComponents.push(new SelectQuestion(this, question, index));
                    break;
                case "followup":
                    this.questionComponents.push(new FollowUpQuestion(this, question, index));
                    break;
                default:
                    console.error("Unsupported question type: " + question.type);
            }
        });

        // Initially, hide all questions
        this.questionComponents.forEach(component => component.hide());
    }

    private showNextQuestion() {
        // Use the index if available, otherwise fallback to a default value (e.g., 0)
        const nextQuestion = this.surveyModel.getNextVisibleQuestion();
        console.log(`showNextQuestion: ${nextQuestion?.title}`);

        if (nextQuestion) {
            this.currentQuestion = nextQuestion;
            this.showQuestion(nextQuestion);
        } else {
            this.handleEndOfSurvey();
        }
    }


    private showPreviousQuestion() {
        const prevQuestion = this.surveyModel.getPreviousVisibleQuestion();
        if (prevQuestion) {
            this.currentQuestion = prevQuestion; // Update the currentQuestion reference
            this.showQuestion(prevQuestion); // Implement showing the question as appropriate
        } else {
            // Optionally handle the case if this is the first question or no previous visible question
        }
    }

    private showQuestion(question: IQuestion) {
        console.log("showQuestion: " + question.name);

        // First, hide all questions to ensure only one is shown at a time
        this.questionComponents.forEach(component => component.hide());

        // Then, show the targeted question
        this.questionComponents[question.index!].show();

        // Update navigation buttons based on the new index
        this.updateNavigationButtons();
    }

    private updateNavigationButtons() {
        const index = this.currentQuestion!.index;
        console.log(`Updating buttons for index: ${index}`);

        const numberOfQuestions = this.surveyModel.getNumberOfQuestions();

        // Determine button visibility based on the current index
        const showPrevButton = index! > 0;
        const showNextButton = index! < numberOfQuestions - 1;
        const showCompleteButton = index === numberOfQuestions - 1;

        // Update button displays based on the determined conditions
        this.prevButton.style.display = showPrevButton ? 'block' : 'none';
        this.nextButton.style.display = showNextButton ? 'block' : 'none';
        this.completeButton.style.display = showCompleteButton ? 'block' : 'none';
    }


    private createSurveyTitle(surveyTitle: string, container: HTMLElement) {
        const title = document.createElement('h3');
        title.className = 'survey-title';
        title.textContent = surveyTitle;

        container.appendChild(title);
    }

    private createSurveyDescription(surveyDescription: string, container: HTMLElement) {
        const description = document.createElement('p');
        description.className = 'survey-description';
        description.innerHTML = surveyDescription;

        container.appendChild(description);
    }

    public addQuestionElement(questionDiv: HTMLDivElement) {
        this.questionsContainer.appendChild(questionDiv);
    }

    setResponse(response: IQuestionResponse): void {
        this.surveyModel.updateResponse(response.questionName, response.response);
    }


    private handleTitleUpdate(index: number, newTitle: string) {
        console.log("SurveyBuilder.handleTitleUpdate : " + newTitle);

        const questionComponent = this.questionComponents.at(index)
        questionComponent.setTitle(newTitle);
    }

    private initNavigationButtons() {
        if (!this.navigationContainer) {
            this.navigationContainer = document.createElement('div');
            this.navigationContainer.id = 'navigation-buttons';
            this.navigationContainer.role = 'navigation';
            this.surveyContainer.appendChild(this.navigationContainer);
        } else {
            this.navigationContainer.innerHTML = '';
        }

        this.prevButton = this.createButton('Previous', 'survey-button', () => this.showPreviousQuestion(), 'none');
        this.nextButton = this.createButton('Next', 'survey-button', () => this.showNextQuestion(), 'block');
        this.completeButton = this.createButton('Complete', 'survey-button', () => this.finishSurvey(), 'none');
    }

    private createButton(text: string, className: string, onClick: () => void, displayStyle: 'none' | 'block') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        button.style.display = displayStyle;
        this.navigationContainer.appendChild(button);
        return button;
    }


    getQuestionElement(index: number): any {
        let allQuestionElements = this.questionsContainer.getElementsByClassName(".question");
        console.log("allQuestionElements", allQuestionElements);
        console.log(allQuestionElements.length);

        return this.questionsContainer.querySelector(`.question[data-index="${index}"]`);
    }


    private handleEndOfSurvey(): void {
        console.log("handleEndOfSurvey");
        this.nextButton.style.display = 'none'; // Hide Next button
        // Show a Complete or Submit button, or take any action to finalize the survey
    }


    finishSurvey() {
        const responses = this.surveyModel.getResponses();
        console.log("SurveyBuilder.finishSurvey: ", responses)
        if (this.completeCallback) {
            this.completeCallback(responses);
        }
        this.displayThankYouPage();
    }

    /*
    __getResponses() {
        const surveyData = {     responses: []
        };
        return surveyData;
    }
*/

    onComplete(callbackFunction: any) {
        this.completeCallback = callbackFunction;
    }
    
    displayThankYouPage() {
        // Clear the survey container
        this.surveyContainer.innerHTML = '';
        // Create the thank you message container
        const thankYouContainer = document.createElement('div');
        thankYouContainer.className = 'thank-you-container';

        // Add content to the thank you container
        thankYouContainer.innerHTML = `
        <h2>Thank you for your input.</h2>
        <p>You can close this page. </p>
        <p>Learn more about <a href="https://servicenow.com">Creator Workflows</a>.</>
        <div class="button-container">
            <button class="secondary-button">Prev</button>
            <button class="primary-button">Done</button>
        </div>
    `;
        // Append the thank you container to the survey container
        this.surveyContainer.appendChild(thankYouContainer);
    }
}

//export default SurveyBuilder;
// Attach SurveyBuilder to the window object to make it globally accessible
window.SurveyBuilder = SurveyBuilder;