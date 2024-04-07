import {
    FollowUpQuestion, 
    RankingQuestion,
    SelectQuestion,
    SingleLineTextQuestion,
    MultiChoice, OneChoice,
    MultiLineTextQuestion,
    YesNoQuestion2} from './question-types/index.js';
import type { IQuestionComponent } from "./question-types/IQuestionComponent.ts";
import type { ISurveyBuilder } from './ISurveyBuilder.ts';
import type { IQuestion } from './IQuestion.ts';
import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';
import { ConditionParser } from './ConditionParser.ts';

class SurveyBuilder implements ISurveyBuilder {

    static readonly RESPONSE_PLACEHOLDER_REGEX = /{{\s*(.+?)\s*}}/g;

    private surveyContainer: HTMLElement;
    private questionsContainer: HTMLElement;
    private navigationContainer!: HTMLElement;

    private nextButton!: HTMLElement;
    private prevButton!: HTMLElement;
    private completeButton!: HTMLElement;

    private questionComponents: any[];
    private responses: { [key: string]: any };
    private completeCallback: any;
    private questionDependencies: Map<string, string[]> = new Map();

    private currentQuestionIndex: number = -1;

    private questions: any;
    private surveyTitle: any;
    private surveyDescription: any;


    constructor(config: any, containerId: string) {
        this.validateConfig(config);

        this.surveyTitle = config.surveyTitle;
        this.surveyDescription = config.surveyDescription;
        this.questions = config.questions;


        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
        }
        this.surveyContainer = containerElement;
        this.responses = {};
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
        this.createSurveyTitle(this.surveyTitle, container);
        this.createSurveyDescription(this.surveyDescription, container);
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

    private shouldShowQuestion(question: IQuestion): boolean {
        // Placeholder: Implement actual condition evaluation logic here
        if (!question.visible_when) {
            return true;
        }
        // Evaluate the condition based on the current responses
        // Return true if the condition is met, false otherwise
        return true;
    }
    private getNextQuestion() {
        for (let i = this.currentQuestionIndex + 1; i < this.questions.length; i++) {
            if (this.shouldShowQuestion(this.questions[i])) {
                this.currentQuestionIndex = i;
                return this.questions[i];
            }
        }
        return null; // No more questions
    }

    private getPreviousQuestion() {
        for (let i = this.currentQuestionIndex - 1; i >= 0; i--) {
            if (this.shouldShowQuestion(this.questions[i])) {
                this.currentQuestionIndex = i;
                return this.questions[i];
            }
        }
        return null; // This was the first question
    }


    private startSurvey() {
        this.questionsContainer.style.display = 'block'; // Make questions visible
        this.initializeQuestions();
        this.showNextQuestion();
        this.initNavigationButtons();
    }



    private initializeQuestions() {
        this.questions.forEach((question: IQuestion, index: number) => {
            this.storeQuestionDependencies(question);
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

       // this.addNavigationControls();
    }

    private showPreviousQuestion() {
        let foundQuestion = false;
        this.currentQuestionIndex--; // Start checking from the previous question
        while (this.currentQuestionIndex >= 0) {
            if (this.shouldShowQuestion(this.questions[this.currentQuestionIndex])) {
                foundQuestion = true;
                break;
            }
            this.currentQuestionIndex--;
        }

        if (foundQuestion) {
            this.showQuestion(this.currentQuestionIndex);
            // Adjust navigation buttons accordingly
        } else {
            // Handle case where we're at the beginning of the survey
            // This could be resetting to the survey start or hiding the "Previous" button
        }
        this.updateNavigationButtons();
    }


    private showNextQuestion() {
        console.log("showNextQuestion");
        console.log(`  - currentQuestionIndex: ${this.currentQuestionIndex}`);

        let foundQuestion = false;
        let nextIndex = this.currentQuestionIndex + 1; // Start from the next question
        while (nextIndex < this.questions.length) {
            if (this.shouldShowQuestion(this.questions[nextIndex])) {
                foundQuestion = true;
                this.currentQuestionIndex = nextIndex; // Update the current index to the found question
                break;
            }
            nextIndex++;
        }

        if (foundQuestion) {
            this.showQuestion(this.currentQuestionIndex);
        } else {
            this.handleEndOfSurvey();
        }
        this.updateNavigationButtons();
    }



    private showQuestion(index: number) {
        console.log("showQuestion: " + index);

        // First, hide all questions to ensure only one is shown at a time
        this.questionComponents.forEach(component => component.hide());

        // Then, show the targeted question
        this.questionComponents[index].show();

        // Update navigation buttons based on the new index
        this.updateNavigationButtons();
    }

    private updateNavigationButtons() {
        console.log(`Updating buttons for index: ${this.currentQuestionIndex}`);
        this.prevButton.style.display = this.currentQuestionIndex > 0 ? 'block' : 'none';
        this.nextButton.style.display = this.currentQuestionIndex < this.questions.length - 1 ? 'block' : 'none';
        this.completeButton.style.display = this.currentQuestionIndex == this.questions.length - 1 ? 'block' : 'none';
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

    private storeQuestionDependencies(question: IQuestion): void {
        const titleDependencies = this.extractTitleDependency(question.title);
        this.updateQuestionDependencies(question.name, titleDependencies);

        if (question.visible_when) {
            const conditionDependencies = ConditionParser.extractQuestionNamesFromCondition(question.visible_when);
            this.updateQuestionDependencies(question.name, conditionDependencies);
        }

    }

    private handleEndOfSurvey(): void {
        console.log("handleEndOfSurvey");
        this.nextButton.style.display = 'none'; // Hide Next button
        // Show a Complete or Submit button, or take any action to finalize the survey

    }


    private updateQuestionDependencies(questionName: string, dependencies: string[]): void {
        dependencies.forEach(dependency => {
            const currentDependencies = this.questionDependencies.get(dependency) || [];
            if (!currentDependencies.includes(questionName)) {
                currentDependencies.push(questionName);
            }
            this.questionDependencies.set(dependency, currentDependencies);
        });
    }

    /**
     * Extracts question names from placeholders within a string, indicating dependencies.
     * Ex: "What activity do you like doing during the {{favorite-season}} season :"
    */
    private extractTitleDependency(title: string): string[] {
        const matches = Array.from(title.matchAll(SurveyBuilder.RESPONSE_PLACEHOLDER_REGEX));
        const dependencies = matches.map(match => {
            const dependency = match[1].trim();
            console.log(`Dependency '${dependency}' found in title: ${title}`);
            return dependency;
        });
        return dependencies;
    }



    /**
     * Replace placeholders in the format {{placeholderName}} in the template with the actual response
     */
    private constructNewTitle(template: string, response: any): string {
        return template.replace(SurveyBuilder.RESPONSE_PLACEHOLDER_REGEX, (_, placeholderName) => {
            return response;
        });
    }


    setResponse(response: IQuestionResponse): void {
        this.responses[response.questionName] = response.response;
        this.evaluateVisibilityConditions(response);
        this.updateDependentQuestionTitles(response);

    }

    /**
     * Evaluate visibility conditions for dependent questions based on the given response.
     */
    evaluateVisibilityConditions(response: IQuestionResponse): void {
        console.log("Evaluating visibility conditions based on response to question: ", response.questionName);

        // Get the list of questions whose visibility depends on the question responded to
        const dependentQuestions = this.questionDependencies.get(response.questionName);
        console.log("dependentQuestions: ", dependentQuestions);


        if (dependentQuestions) {
            const conditionParser = new ConditionParser(this.responses);

            // Go through each dependent question and determine if it should be shown or hidden
            dependentQuestions.forEach(dependentQuestionName => {
                console.log(" - question: " + dependentQuestionName);

                const questionComponent = this.questionComponents.find(qc => qc.questionData.name === dependentQuestionName);
                if (questionComponent) {
                    const visible_when = questionComponent.questionData.visible_when;
                    if (visible_when) {
                        const shouldShow = conditionParser.evaluateCondition(visible_when);
                        if (shouldShow) {
                            questionComponent.show();
                        } else {
                            questionComponent.hide();

                        }
                    }
                }
            });
        }
    }


    /**
     * Update the question's title if it contains a placeholder with the answer of another question
     */
    private updateDependentQuestionTitles(response: IQuestionResponse) {
        console.log("updateDependentQuestionTitles dependent on question: " + response.questionName);

        const dependentQuestions = this.questionDependencies.get(response.questionName);
        if (dependentQuestions) {
            dependentQuestions.forEach(dependentQuestionName => {
                const dependentQuestionComponent = this.questionComponents.find(questionComponent => questionComponent.questionData.name === dependentQuestionName);
                if (dependentQuestionComponent) {
                    const questionData = dependentQuestionComponent.questionData;
                    console.log(" - question: " + response.questionName);

                    const newTitle = this.constructNewTitle(questionData.title, response.response);
                    dependentQuestionComponent.updateTitle(newTitle);
                }
            });
        }
    }

    private validateConfig(config: any) {
        if (!config) {
            throw new Error('Config object is required');
        }
        if (typeof config.surveyTitle !== 'string') {
            throw new Error('Invalid or missing surveyTitle');
        }
        if (typeof config.surveyDescription !== 'string') {
            throw new Error('Invalid or missing surveyDescription');
        }
        if (!Array.isArray(config.questions)) {
            throw new Error('Invalid or missing questions array');
        }
        if (config.questions.some((question: any) => typeof question !== 'object')) {
            throw new Error('All items in questions array must be objects');
        }
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





    finishSurvey() {
        const responses = this.getResponses();
        if (this.completeCallback) {
            this.completeCallback(this.responses);
        }
        this.displayThankYouPage();
    }

    getResponses() {
        const surveyData = {
            responses: []
        };
        return surveyData;
    }

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