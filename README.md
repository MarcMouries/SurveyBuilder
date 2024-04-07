# SurveyBuilder 

## Overview 

SurveyBuilder is designed to simplify the creation and management of surveys within web applications. It supports a wide range of question types to cater to various data collection needs.

### Supported Question Types

#### OneChoice:
Represents a question that requires users to select one, and only one, option from a list of options. 
It is represented as a list of radio buttons, ideal for questions where a single choice is necessary.
##### Example:
What is your favorite season?<br>
◯ Spring<br>
◯ Summer<br>
◯ Fall<br>
◯ Winter

#### MultiChoice:
Allows users to select multiple options from a list of checkboxes, suitable for questions that can have more than one answer.
##### Example Question:
Which of the following fruits do you like? (Select all that apply)<br>
☐ Apples<br>
☐ Bananas<br>
☐ Cherries<br>
☐ Dates

#### SelectQuestion:
Offers a dropdown list for users to choose from, efficiently handling long lists of options. 

It can be configured with a static list of options using "options" or dynamically populated from a service using "options_source". 
##### Example:
Name of the federal agency you work for? 

#### SingleLineTextQuestion:
Provides a textbox for short, open-ended responses, perfect for concise answers that don't fit predefined options.
##### Example:
Enter your email if you want to be contacted about this. Placeholder: "name@example.com".


#### FollowUpQuestion:
Represents a question that collects detailed information based on a previous question's answer, allowing for deeper insights and personalized questioning paths.
##### Example:
If the user selects "Winter" in the "What is your favorite season?" question, a follow-up question might be:<br>
What activity do you like doing during the Winter season?<br>
◯ Skiing<br>
◯ Ice Skating<br>
◯ Reading by the fireplace<br>
◯ Winter Hiking


#### YesNoQuestion:
A question type specifically designed for Yes/No questions, providing a binary choice between two radio buttons labeled 'Yes' and 'No'.
##### Example Question:
Do you have any previous experience with our products?<br>
◯ Yes<br>
◯ No
 
### Visibility

Visibility of questions can be controlled with "visible_when", specifying conditions under which the question appears. This feature enables dynamic surveys that adapt based on participant responses, ensuring relevancy and conciseness in the questionnaire.

##### Example:
Suppose you have a Yes/No question asking if the participant has any dietary restrictions, followed by a question that asks for specifics if they answer "Yes". Here's how the JSON configuration for these questions might look:

```json
{
  "questions": [
    {
      "name": "dietary_restrictions",
      "type": "yes-no",
      "title": "Do you have any dietary restrictions?",
      "isRequired": true
    },
    {
      "name": "specific_dietary_restrictions",
      "type": "single-line-text",
      "title": "Please specify your dietary restrictions.",
      "isRequired": true,
      "visible_when": "dietary_restrictions == Yes"
    }
  ]
}
```


## Demonstration

[Demonstration](https://marcmouries.github.io/SurveyBuilder/test/)


## Development 
1. Build with ```bun build ./src/SurveyBuilder.ts --outfile=./dist/sb-bundle.js```
2. Start a local web server. For example: ```python3 -m http.server```
3. Open a tab in Google Chrome and go to the URL ``localhost:8000``. The exact port number may be different.

## Notes on data model

AbstractChoice: The base class for all choice-type questions. It might define common properties and methods that apply to all choice questions, such as rendering choices from an array or handling common events.

OneChoice: Extends AbstractChoice and adds functionality specific to questions that allow only one choice to be selected. This class can manage the radio button logic.

YesNoQuestion: Extends OneChoice and is specialized for yes/no questions, which are essentially single-choice questions with only two options.
