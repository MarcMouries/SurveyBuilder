import { Parser } from "./engine/Parser";
import { Interpreter } from "./engine/Interpreter";
import { Environment } from "./engine/Environment";
import type { IQuestion } from './IQuestion.ts';

const QUESTION_REFERENCE_REGEX = /{{\s*(.+?)\s*}}/g;

export class SurveyModel {
    private questionList: IQuestion[];
    private interpreter: Interpreter;
    private parser: Parser;
    private environment: Environment;
    private responseMap: { [key: string]: any };
    private originalTitles: Map<string, string>;
    private compiledConditions: Map<string, any>;
    private visibilityDependencies: Map<string, string[]> = new Map();
    private titleDependencies: Map<string, string[]> = new Map();


    constructor(questionList: IQuestion[]) {
        this.questionList = questionList;
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
            // If a "visible_when" condition is specified, the question should initially be hidden (false).
            // Otherwise, the question is visible by default (true).
            question.isVisible = question.visible_when ? false : true;

            if (question.visible_when) {
                const compiledCondition = this.parser.parse(question.visible_when);
                this.compiledConditions.set(question.name, compiledCondition);
            }
        });
    }


    public getQuestionByName(questionName: string): IQuestion | undefined {
        return this.questionList.find(question => question.name === questionName);
    }

    public updateResponse(questionName: string, response: any) {
        this.responseMap[questionName] = response;
        this.environment.set(questionName, response);
        this.evaluateVisibilityConditions();
        this.updateDynamicTitles();
    }

    private evaluateVisibilityConditions() {
        this.questionList.forEach(question => {
            if (this.compiledConditions.has(question.name)) {
                const compiledCondition = this.compiledConditions.get(question.name);
                question.isVisible = this.interpreter.interpret(compiledCondition);
            }
        });
    }

    private updateDynamicTitles() {
        this.questionList.forEach(question => {
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
            // If no value is found (undefined), it falls back to the original placeholder syntax.
            return this.responseMap[placeholderName.trim()] || `{{${placeholderName.trim()}}}`;
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
            console.log(`Dependency '${dependency}' found in title: ${title}`);
            return dependency;
        });
        return dependencies;
    }

}