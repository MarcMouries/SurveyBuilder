# SurveyJS

## Overview 

This survey library supports the following question types:

AbstractChoice: The base class for all choice-type questions. It might define common properties and methods that apply to all choice questions, such as rendering choices from an array or handling common events.

OneChoice: Extends AbstractChoice and adds functionality specific to questions that allow only one choice to be selected. This class can manage the radio button logic.

YesNoQuestion: Extends OneChoice and is specialized for yes/no questions, which are essentially single-choice questions with only two options.


## Demonstration

[Demonstration](https://marcmouries.github.io/SurveyBuilder/test/)


## Development 
1. Start a local web server. For example: ```python3 -m http.server```
2. Open a tab in Google Chrome and go to the URL ``localhost:8000``. The exact port number may be different.
3. 

## Notes on data model

AbstractChoice: The base class for all choice-type questions. It might define common properties and methods that apply to all choice questions, such as rendering choices from an array or handling common events.

OneChoice: Extends AbstractChoice and adds functionality specific to questions that allow only one choice to be selected. This class can manage the radio button logic.

YesNoQuestion: Extends OneChoice and is specialized for yes/no questions, which are essentially single-choice questions with only two options.
