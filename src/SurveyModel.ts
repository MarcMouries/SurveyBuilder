import { Parser } from "./engine/Parser";
import { Interpreter } from "./engine/Interpreter";
import { Environment } from "./engine/Environment";
import { Question } from './Question.ts';
import { EventEmitter } from './EventEmitter.ts'
import { SURVEY_STARTED, TITLE_UPDATED } from './EventTypes';

const QUESTION_REFERENCE_REGEX = /{{\s*(.+?)\s*}}/g;

export class SurveyModel {
    private started: boolean = false;
    private completed: boolean = false;

    private surveyTitle: any;
    private surveyDescription: any;
    private questionList: Question[];
    private currentQuestion!: Question;

    private responseMap: { [key: string]: any };

    private interpreter: Interpreter;
    private parser: Parser;
    private environment: Environment;
    private originalTitles: Map<string, string>;
    private compiledConditions: Map<string, any>;
    private titleDependencies: Map<string, Question[]> = new Map();
    private visibilityDependencies: Map<string, Question[]> = new Map();

    constructor(config: any) {
        console.log("SurveyModel: building for config = ", config);
        this.validateSurveySetup(config);
        this.surveyTitle = config.surveyTitle;
        this.surveyDescription = config.surveyDescription;
        this.questionList = this.initializeQuestions(config.questions);


        this.environment = new Environment();
        this.parser = new Parser();
        this.interpreter = new Interpreter(this.environment);

        this.responseMap = {};
        this.originalTitles = new Map();
        this.compiledConditions = new Map();

        this.initializeDynamicContent();
    }

    static fromJSON(jsonString: string): SurveyModel {
        let config;
        try {
            config = JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Invalid JSON string provided. Details: ${(error as Error).message}`);
        }
        return new SurveyModel(config);
    }

    private initializeQuestions(questionsData: any[]): Question[] {
        return questionsData.map(questionData => new Question(questionData));
    }


    private initializeDynamicContent() {
        this.questionList.forEach((question, index) => {
            this.originalTitles.set(question.name, question.title);

            // Extract dependencies from the question's title
            const dependencyList = this.extractTitleDependency(question.title);

            // Update the titleDependencies map
            dependencyList.forEach(dependencyName => {
                let dependencies = this.titleDependencies.get(dependencyName) || [];
                dependencies.push(question);
                this.titleDependencies.set(dependencyName, dependencies);
            });

            // If a "visible_when" condition is specified, the question should initially be hidden (false).
            // Otherwise, the question is visible by default (true).
            question.isVisible = question.visible_when ? false : true;

            if (question.visible_when) {
                // compile the expression
                const compiledCondition = this.parser.parse(question.visible_when);
                this.compiledConditions.set(question.name, compiledCondition);

                // Extract dependencies from the visibility condition
                const visibilityDependencyList = Interpreter.extractIdentifiers(compiledCondition);
                visibilityDependencyList.forEach(dependencyName => {
                    let dependencies = this.visibilityDependencies.get(dependencyName) || [];
                    dependencies.push(question);
                    this.visibilityDependencies.set(dependencyName, dependencies);
                });
            }
        });
    }

    public startSurvey(): void {
        this.started = true;
        this.currentQuestion = this.questionList[0];
        EventEmitter.emit(SURVEY_STARTED);
    }
    public completeSurvey(): void {
        this.completed = true;
    }

    public getCurrentQuestion(): Question { return this.currentQuestion; }
    public getDescription(): string { return this.surveyDescription; }
    public getNumberOfQuestions(): number { return this.questionList.length; }
    public getQuestions(): Question[] { return this.questionList.slice(); }
    public getResponses(): { [key: string]: any } { return this.responseMap; }
    public getTitle(): string { return this.surveyTitle; }
    public getQuestionByName(questionName: string): Question | undefined {
        return this.questionList.find(question => question.name === questionName);
    }
    public isCompleted(): boolean { return this.completed; }
    public isStarted(): boolean { return this.started; }
    public updateResponse(questionName: string, response: any) {
        console.log(`SurveyModel.updateResponse: Received Response: '${response}' from Question '${questionName}'`)
        this.responseMap[questionName] = response;
        this.environment.set(questionName, response);
        this.updateDynamicTitles(questionName);
        this.updateVisibility(questionName);
    }

    private updateVisibility(updatedQuestionName: string) {
        const dependentQuestions = this.visibilityDependencies.get(updatedQuestionName);

        if (dependentQuestions && dependentQuestions.length > 0) {
            console.log(`Updating visibility for question: '${updatedQuestionName}'. List of dependent questions: ${dependentQuestions.map(q => q.name).join(', ')}`);
            dependentQuestions.forEach(question => {
                if (this.compiledConditions.has(question.name)) {
                    const compiledCondition = this.compiledConditions.get(question.name);
                    question.isVisible = this.interpreter.interpret(compiledCondition);
                }
            });
        } else {
            console.log(`Updating visibility for question: '${updatedQuestionName}'. No dependent questions found.`);
        }
    }

    private updateDynamicTitles(updatedQuestionName: string) {
        const dependentQuestions = this.titleDependencies.get(updatedQuestionName);

        if (dependentQuestions && dependentQuestions.length > 0) {
            console.log(`Updating dynamic titles for question: '${updatedQuestionName}'. List of dependent questions: ${dependentQuestions.map(q => q.name).join(', ')}`);
            dependentQuestions.forEach(question => {
                const originalTitle = this.originalTitles.get(question.name);
                if (originalTitle) {
                    const newTitle = this.constructNewTitle(originalTitle);
                    question.title = newTitle;
                    EventEmitter.emit(TITLE_UPDATED, question.index, newTitle);
                }
            });
        } else {
            console.log(`Updating dynamic titles for question: '${updatedQuestionName}'. No dependent questions found.`);
        }
    }

    /**
     * Replace placeholders in the format {{placeholderName}} in the template with the actual response.
     * This function is designed to handle multiple matches correctly.
     */
    private constructNewTitle(template: string): string {
        return template.replace(QUESTION_REFERENCE_REGEX, (_, placeholderName) => {
            // This callback function is called for each match found by the regex.
            // `placeholderName` is the captured group from `QUESTION_REFERENCE_REGEX`, representing the placeholder's name.
            // For each placeholder found, this attempts to find its value in `this.responseMap`.
            // If a value is found, it's used to replace the placeholder in the template.
            return this.responseMap[placeholderName.trim()];
        });
    }

    /**
     * Extracts question names from placeholders within a string, indicating dependencies.
     * Ex: "What activity do you like doing during the {{favorite-season}} season :"
     */
    private extractTitleDependency(title: string): string[] {
        const matches = Array.from(title.matchAll(QUESTION_REFERENCE_REGEX));
        const dependencies = matches.map(match => {
            const dependency = match[1].trim();
            return dependency;
        });
        return dependencies;
    }

    // Check if the current question is the first one
    public isFirstQuestion(): boolean {
        return this.currentQuestion.index === 0;
    }

    // Check if the current question is the last one
    public isLastQuestion(): boolean {
        return this.currentQuestion.index === this.questionList.length - 1;
    }

    public getNextVisibleQuestion(): Question | null {
        for (let i = this.currentQuestion.index + 1; i < this.questionList.length; i++) {
            if (this.questionList[i].isVisible) {
                this.currentQuestion = this.questionList[i];
                return this.currentQuestion;
            }
        }
        return null;
    }

    public getPreviousVisibleQuestion(): Question | null {
        // Start looking from the question immediately before the current question
        for (let i = this.currentQuestion.index - 1; i >= 0; i--) {
            if (this.questionList[i].isVisible) {
                this.currentQuestion = this.questionList[i];
                return this.currentQuestion;
            }
        }
        return null;
    }

    private validateSurveySetup(config: any) {
        if (!config) throw new Error('Config object is required');

        if (typeof config.surveyTitle !== 'string')
             throw new Error(`Invalid or missing surveyTitle: ${config.surveyTitle}`);

        if (typeof config.surveyDescription !== 'string') throw new Error('Invalid or missing surveyDescription');

        if (!Array.isArray(config.questions)) throw new Error('Invalid or missing questions array');

        const allowedTypes = ['yes-no', 'select', 'single-choice', 'followup', 'multi-choice', 'ranking', 'multi-line-text', 'single-line-text'];

        config.questions.forEach((question: any, index: number) => {

            if (typeof question !== 'object') throw new Error(`Question at index ${index} is not an object`);
            if (typeof question.name !== 'string' || question.name.trim() === '') {
                throw new Error(`Question at index ${index} is missing a valid name`);
            }
            if (typeof question.title !== 'string' || question.title.trim() === '') {
                throw new Error(`Question at index ${index} is missing a valid title`);
            }
            if (!allowedTypes.includes(question.type)) {
                const allowedTypesString = allowedTypes.join(', '); // Convert the array of allowed types to a string
                throw new Error(`Question type "${question.type}" at index ${index} is not allowed. Allowed types are: ${allowedTypesString}`);
            }

            if ('isRequired' in question && typeof question.isRequired !== 'boolean') throw new Error(`"isRequired" must be boolean at index ${index}`);

            if (question.options && !Array.isArray(question.options)) throw new Error(`"options" must be an array at index ${index}`);
            if (question.items && !Array.isArray(question.items)) throw new Error(`"items" must be an array at index ${index}`);

            if (question.options_source && typeof question.options_source !== 'string') throw new Error(`"options_source" must be a string URL at index ${index}`);

        });
    }


    public getStateDetails(): string {
        let state = `Survey State: ${this.started ? "Started" : "Not Started"}, `;
        state += `Completed: ${this.completed ? "Yes" : "No"}, `;
        if (this.started) {
            state += `Current Question Index: ${this.currentQuestion ? this.currentQuestion.index : "None"}`;
        } else {
            state += "Current Question Index: None";
        }
        return state;
    }
}