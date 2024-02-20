import {
    RankingQuestion,
    SelectQuestion,
    SingleLineTextQuestion,
    OneChoice,
    MultiLineTextQuestion,
    YesNoQuestion2
} from './question-types/index.ts';
import type { IQuestionComponent } from "./question-types/IQuestionComponent.ts";
import type { ISurveyBuilder } from './ISurveyBuilder.ts';
import type { IQuestion } from './IQuestion.ts';
import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';
import { MultiChoice } from './question-types/MultiChoice.ts';
import { FollowUpQuestion } from './question-types/FollowUpQuestion.ts';
import { ConditionParser } from './ConditionParser.ts';


class SurveyBuilder implements ISurveyBuilder {

    static readonly RESPONSE_PLACEHOLDER_REGEX = /{{\s*(.+?)\s*}}/g;

    surveyContainer: HTMLElement;
    config: any;
    questionNumber: number;
    questionComponents: any[];
    responses: { [key: string]: any };
    completeCallback: any;
    questionDependencies: Map<string, string[]> = new Map();



    constructor(config: any, containerId: string) {
        this.config = config;
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
        }
        this.surveyContainer = containerElement;
        this.questionNumber = 1;
        this.responses = {};
        this.questionComponents = [];
        //this.createSurvey();
        this.createInitialPage();

    }

    createInitialPage() {
        this.createSurveyTitle(this.config.surveyTitle, this.surveyContainer);
        this.createSurveyDescription(this.config.surveyDescription, this.surveyContainer);
        this.createStartButton(); // Method to create the start button
    }
    createStartButton() {
        const startButtonWrapper = document.createElement('div');
        startButtonWrapper.className = 'start-button-wrapper';

        const startButton = document.createElement('button');
        startButton.textContent = 'Start Survey';
        startButton.className = 'start-survey-button';

        startButton.addEventListener('click', () => {
            this.surveyContainer.innerHTML = ''; // Clear the container
            this.initializeQuestions();
        });

        startButtonWrapper.appendChild(startButton);
        this.surveyContainer.appendChild(startButtonWrapper);
    }


    initializeQuestions() {
        this.config.questions.forEach((question: IQuestion, index: number) => {
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

        this.createCompleteButton(this.surveyContainer);
    }

    createSurveyTitle(surveyTitle: string, container: HTMLElement) {
        const title = document.createElement('h3');
        title.className = 'survey-title';
        title.textContent = surveyTitle;

        container.appendChild(title);
    }

    createSurveyDescription(surveyDescription: string, container: HTMLElement) {
        const description = document.createElement('p');
        description.className = 'survey-description';
        description.innerHTML = surveyDescription;

        container.appendChild(description);
    }


    private storeQuestionDependencies(question: IQuestion): void {
        const titleDependencies = this.extractTitleDependency(question.title);
        this.updateQuestionDependencies(question.name, titleDependencies);

        if (question.visible_when) {
            const conditionDependencies = ConditionParser.extractQuestionNamesFromCondition(question.visible_when);
            this.updateQuestionDependencies(question.name, conditionDependencies);
        }

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
            console.log(" - question: " +  dependentQuestionName);

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
        console.log("updateDependentQuestionTitles dependent on question: " +  response.questionName);

        const dependentQuestions = this.questionDependencies.get(response.questionName);
        if (dependentQuestions) {
            dependentQuestions.forEach(dependentQuestionName => {
                const dependentQuestionComponent = this.questionComponents.find(questionComponent => questionComponent.questionData.name === dependentQuestionName);
                if (dependentQuestionComponent) {
                    const questionData = dependentQuestionComponent.questionData;
                    console.log(" - question: " +  response.questionName);

                    const newTitle = this.constructNewTitle(questionData.title, response.response);
                    dependentQuestionComponent.updateTitle(newTitle);
                }
            });
        }
    }

    getQuestionElement(index: number): any {
        let allQuestionElements = this.surveyContainer.getElementsByClassName(".question");
        console.log("allQuestionElements", allQuestionElements);
        console.log(allQuestionElements.length);

        return this.surveyContainer.querySelector(`.question[data-index="${index}"]`);
    }



    createCompleteButton(container: HTMLElement) {
        const footer = document.createElement('footer');
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-button';
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', () => this.finishSurvey());
        footer.appendChild(completeButton);
        container.appendChild(footer);
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