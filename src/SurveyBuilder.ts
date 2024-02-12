import {
    RankingQuestion,
    SelectQuestion,
    SingleLineTextQuestion,
    MultiLineTextQuestion,
    YesNoQuestion
} from './question-types/index.ts';
import type { IQuestionComponent } from "./question-types/IQuestionComponent.ts";
import type { ISurveyBuilder } from './ISurveyBuilder.ts';
import type { IQuestion } from './IQuestion.ts';
import type { IQuestionResponse } from './question-types/IQuestionResponse.ts';
import { YesNoQuestion2 } from './question-types/YesNoQuestion.ts';
import { OneChoice } from './question-types/OneChoice.ts';
import { MultiChoice } from './question-types/MultiChoice.ts';
import { FollowUpQuestion } from './question-types/FollowUpQuestion.ts';


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
        this.createSurvey();
    }

    createSurvey() {
        this.createSurveyTitle(this.config.surveyTitle, this.surveyContainer);
        this.createSurveyDescription(this.config.surveyDescription, this.surveyContainer);

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

    private storeQuestionDependencies(question: IQuestion): void {
        const dependencies = this.extractDependencies(question.title);
        dependencies.forEach(dependency => {
            const currentDependencies = this.questionDependencies.get(dependency) || [];
            currentDependencies.push(question.name);
            this.questionDependencies.set(dependency, currentDependencies);
        });
    }


    /** 
     * Extracts question names from placeholders within a string, indicating dependencies.
     * Ex: "What activity do you like doing during the {{favorite-season}} season :"
    */
    private extractDependencies(title: string): string[] {
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
        this.updateDependentQuestionTitles(response.questionName, response.response);

    }

    // Go through each question and determine if it should be shown based on the visible_when condition
    evaluateVisibilityConditions(response: IQuestionResponse): void {
        console.log("evaluateVisibilityConditions for ", response.questionName);

        this.questionComponents.forEach((questionComponent: IQuestionComponent) => {
            const question = questionComponent.questionData;
            if (question.visible_when) {
                const [conditionQuestionName, conditionValue] = question.visible_when.split(" = ").map((s: string) => s.trim());
                // Check if the condition is related to the response question
                if (conditionQuestionName === response.questionName) {
                    console.log(" Evaluate Visibility for Question: ", question.name);
                    const actualAnswer = this.responses[conditionQuestionName];
                    console.log("condition  : " + conditionValue + " -  Answer : " + actualAnswer);

                    if (actualAnswer === conditionValue) {
                        questionComponent.show();
                    } else {
                        questionComponent.hide();
                    }
                }
            }
        });
    }

    /**
     * Update the question's title if it contains a placeholder with the answer of another question
     */
    private updateDependentQuestionTitles(questionName: string, response: any) {
        console.log("updateDependentQuestionTitles dependent on question: " + questionName)

        const dependentQuestions = this.questionDependencies.get(questionName);
        if (dependentQuestions) {
            dependentQuestions.forEach(dependentQuestionName => {
                const dependentQuestionComponent = this.questionComponents.find(questionComponent => questionComponent.questionData.name === dependentQuestionName);
                if (dependentQuestionComponent) {
                    const questionData = dependentQuestionComponent.questionData;
                    const newTitle = this.constructNewTitle(questionData.title, response);
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
        /*
                this.config.questions.forEach(element => {
                    const questionData = {
                        questionName: element.name,
                        questionTitle: element.title,
                        answer: null
                    };
        
                    switch (element.type) {
                        case 'single-line-text':
                            const textInput = this.surveyContainer.querySelector(`input[name="${element.name}"]`);
                            questionData.answer = textInput ? textInput.value : '';
                            break;
        
                        case 'ranking':
                            const rankingItems = Array.from(this.surveyContainer.querySelectorAll(`.${element.name} .ranking-item`));
                            console.log(rankingItems);
                            if (rankingItems.length) {
                                questionData.answer = rankingItems.map((item, idx) => ({
                                    rank: idx + 1,
                                    text: item.querySelector('.choice-text').textContent.trim()
                                }));
                            }
                            break;
                    }
        
                    surveyData.responses.push(questionData);
        
                });
                */
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
    /*
    
        addDragAndDrop() {
            const lists = document.querySelectorAll('.ranking-list');
    
            lists.forEach(list => {
                list.addEventListener('dragover', e => {
                    e.preventDefault();
                    const draggable = document.querySelector('.dragging');
                    const afterElement = this.getDragAfterElement(list, e.clientY);
                    if (afterElement) {
                        list.insertBefore(draggable, afterElement);
                    } else if (draggable) {
                        list.appendChild(draggable);
                    }
                    this.updateDraggedItemIndex(draggable, list);
                });
    
                list.addEventListener('dragstart', e => {
                    e.target.classList.add('dragging');
                });
    
                list.addEventListener('dragend', e => {
                    e.target.classList.remove('dragging');
                    this.updateAllIndexes(list);
                });
    
                // If you have a 'drop' event, you can also update indexes there
                list.addEventListener('drop', e => {
                    e.preventDefault();
                    this.updateAllIndexes(list);
                });
            });
        }
    
    
    
        // MOVE DRAG and Drop with the  necessary methods such as getDragAfterElement, updateDraggedItemIndex, updateAllIndexes into a separate file...
    
        getDragAfterElement(list, y) {
            const draggableElements = [...list.querySelectorAll('.ranking-item:not(.dragging)')];
    
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    
    
        updateDraggedItemIndex(draggedItem, list) {
            let newIndex = 0;
            Array.from(list.children).forEach((item, index) => {
                if (item !== draggedItem && item.getBoundingClientRect().top < draggedItem.getBoundingClientRect().bottom) {
                    newIndex = index + 1;
                }
            });
    
            const indexDiv = draggedItem.querySelector('.index');
            if (indexDiv) {
                indexDiv.textContent = newIndex + 1;
            }
        }
    
    
        updateAllIndexes(list) {
            const items = list.querySelectorAll('.ranking-item');
            items.forEach((item, index) => {
                const indexDiv = item.querySelector('.index');
                if (indexDiv) {
                    indexDiv.textContent = index + 1;
                }
            });
        }
    
        */



}

//export default SurveyBuilder;
// Attach SurveyBuilder to the window object to make it globally accessible
window.SurveyBuilder = SurveyBuilder;