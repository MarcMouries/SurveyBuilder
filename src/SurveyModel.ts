import { Parser } from "./engine/Parser";
import { Interpreter } from "./engine/Interpreter";
import { Environment } from "./engine/Environment";
import type { IQuestion } from './IQuestion.ts';

const QUESTION_REFERENCE_REGEX = /{{\s*(.+?)\s*}}/g;

export class SurveyModel {

    private surveyTitle: any;
    private surveyDescription: any;
    private questionList: IQuestion[];
    private responseMap: { [key: string]: any };

    private interpreter: Interpreter;
    private parser: Parser;
    private environment: Environment;
    private originalTitles: Map<string, string>;
    private compiledConditions: Map<string, any>;
    private titleDependencies: Map<string, IQuestion[]> = new Map();
    private visibilityDependencies: Map<string, IQuestion[]> = new Map();

    constructor(config: any) {
        this.validateSurveySetup(config);
        this.surveyTitle = config.surveyTitle;
        this.surveyDescription = config.surveyDescription;
        this.questionList = config.questions;

        this.environment = new Environment();
        this.parser = new Parser();
        this.interpreter = new Interpreter(this.environment);
        this.responseMap = {};
        this.originalTitles = new Map();
        this.compiledConditions = new Map();

        this.initialize();
    }

    private initialize() {
        this.questionList.forEach(question => {

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

    public getQuestions(): IQuestion[] {
        return this.questionList.slice();
    }

    public getQuestionByName(questionName: string): IQuestion | undefined {
        return this.questionList.find(question => question.name === questionName);
    }

    public updateResponse(questionName: string, response: any) {
        this.responseMap[questionName] = response;
        this.environment.set(questionName, response);
        this.updateDynamicTitles(questionName);
        this.updateVisibility(questionName);
    }

    private updateVisibility(updatedQuestionName: string) {
        const dependentQuestions = this.visibilityDependencies.get(updatedQuestionName);

        dependentQuestions?.forEach(question => {
            if (this.compiledConditions.has(question.name)) {
                const compiledCondition = this.compiledConditions.get(question.name);
                question.isVisible = this.interpreter.interpret(compiledCondition);
            }
        });
    }

    private updateDynamicTitles(updatedQuestionName: string) {
        const dependentQuestions = this.titleDependencies.get(updatedQuestionName);


        dependentQuestions?.forEach(question => {
            const originalTitle = this.originalTitles.get(question.name);
            if (originalTitle) {
                question.title = this.constructNewTitle(originalTitle);
            }
        });

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
     * 
     */
    private extractTitleDependency(title: string): string[] {
        const matches = Array.from(title.matchAll(QUESTION_REFERENCE_REGEX));
        const dependencies = matches.map(match => {
            const dependency = match[1].trim();
            return dependency;
        });
        return dependencies;
    }

    public nextVisibleQuestion(currentIndex: number): IQuestion | null {
        for (let i = currentIndex + 1; i < this.questionList.length; i++) {
            if (this.questionList[i].isVisible) {
                return this.questionList[i];
            }
        }
        return null;
    }
    
    public prevVisibleQuestion(currentIndex: number): IQuestion | null {
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (this.questionList[i].isVisible) {
                return this.questionList[i];
            }
        }
        return null;
    }
    
    
    

    private validateSurveySetup(config: any) {
        if (!config) throw new Error('Config object is required');

        if (typeof config.surveyTitle !== 'string') throw new Error('Invalid or missing surveyTitle');
        if (typeof config.surveyDescription !== 'string') throw new Error('Invalid or missing surveyDescription');

        if (!Array.isArray(config.questions)) throw new Error('Invalid or missing questions array');

        const allowedTypes = ['yes-no', 'select', 'one-choice', 'followup', 'multi-choice', 'ranking', 'multi-line-text', 'single-line-text'];

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


}