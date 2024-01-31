// src/question-types/common.ts
function createQuestionTitle(questionText) {
  const title = document.createElement("h3");
  title.className = "question-title";
  const questionNumberSpan = document.createElement("span");
  questionNumberSpan.className = "question-number";
  title.append(questionText);
  return title;
}

// src/question-types/QuestionType.ts
class QuestionType {
  surveyBuilder;
  questionDiv;
  question;
  constructor(surveyBuilder, question, index) {
    this.surveyBuilder = surveyBuilder;
    this.question = question;
    this.questionDiv = document.createElement("div");
    this.questionDiv.className = "question";
    this.questionDiv.dataset.index = index.toString();
    const title = createQuestionTitle(question.title);
    this.questionDiv.appendChild(title);
    this.setupResponseListener();
  }
  setupResponseListener() {
    this.questionDiv.addEventListener("answerSelected", (event) => {
      const customEvent = event;
      const response = customEvent.detail;
      this.surveyBuilder.setResponse(response);
    });
  }
  show() {
    this.questionDiv.style.display = "block";
  }
  hide() {
    this.questionDiv.style.display = "none";
  }
}

// src/question-types/select.ts
class SelectQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.questionDiv.className += " select-question";
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    const searchComponent = document.createElement("search-input");
    this.questionDiv.appendChild(searchComponent);
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    const config = {
      static_options: question.options || [],
      dynamic_options_service: question.options_source
    };
    searchComponent.setConfig(config);
    searchComponent.addEventListener("optionSelected", (event) => {
      const customEvent = event;
      const selectedOption = customEvent.detail.option;
      console.log("In searchComponent optionSelected: ", selectedOption);
      const response = {
        questionName: question.name,
        response: selectedOption
      };
      const answerEvent = new CustomEvent("answerSelected", { detail: response });
      this.questionDiv.dispatchEvent(answerEvent);
    });
  }
}
// src/question-types/multi-line.ts
class MultiLineTextQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.questionDiv.className += " multi-line-question";
    const textArea = document.createElement("textarea");
    textArea.name = question.name;
    textArea.required = question.isRequired;
    textArea.className = "multi-line-text-input";
    textArea.placeholder = "Enter your comments here...";
    this.questionDiv.appendChild(textArea);
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    textArea.addEventListener("input", () => {
      const response = {
        questionName: question.name,
        response: textArea.value
      };
      console.log("MultiLineTextQuestion input change", response);
      const answerEvent = new CustomEvent("answerSelected", { detail: response });
      this.questionDiv.dispatchEvent(answerEvent);
    });
  }
}
// src/question-types/ranking.ts
class RankingQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.questionDiv.className += " ranking-question";
    const rankingList = document.createElement("div");
    rankingList.className = `ranking-list ${question.name}`;
    question.choices.forEach((choice, index2) => {
      const listItem = document.createElement("div");
      listItem.setAttribute("draggable", "true");
      listItem.className = "ranking-item";
      const dragIcon = document.createElement("div");
      dragIcon.className = "drag-icon";
      dragIcon.textContent = "\u2261";
      listItem.appendChild(dragIcon);
      const indexDiv = document.createElement("div");
      indexDiv.className = "index";
      indexDiv.textContent = `${index2 + 1}`;
      listItem.appendChild(indexDiv);
      const choiceText = document.createElement("div");
      choiceText.className = "choice-text";
      choiceText.textContent = choice;
      listItem.appendChild(choiceText);
      rankingList.appendChild(listItem);
    });
    this.questionDiv.appendChild(rankingList);
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
  }
}
// src/question-types/yes-no.ts
class YesNoQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.questionDiv.className += " yes-no-question";
    const yesNoField = document.createElement("div");
    yesNoField.className = "yes-no";
    const yesRadio = this.createRadio("Yes", question.name, `${question.name}-yes`);
    const yesLabel = this.createLabel(`${question.name}-yes`, "Yes");
    yesNoField.appendChild(yesRadio);
    yesNoField.appendChild(yesLabel);
    const noRadio = this.createRadio("No", question.name, `${question.name}-no`);
    const noLabel = this.createLabel(`${question.name}-no`, "No");
    yesNoField.appendChild(noRadio);
    yesNoField.appendChild(noLabel);
    this.questionDiv.appendChild(yesNoField);
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    yesNoField.addEventListener("change", (event) => {
      const target = event.target;
      const response = {
        questionName: question.name,
        response: target.value
      };
      const answerEvent = new CustomEvent("answerSelected", { detail: response });
      this.questionDiv.dispatchEvent(answerEvent);
    });
  }
  createRadio(value, name, id) {
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.id = id;
    radioInput.name = name;
    radioInput.value = value;
    return radioInput;
  }
  createLabel(forId, text) {
    const label = document.createElement("label");
    label.htmlFor = forId;
    label.textContent = text;
    return label;
  }
}
// src/question-types/single-line.ts
class SingleLineTextQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.questionDiv.className += " single-line-question";
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.name = question.name;
    inputField.required = question.isRequired;
    inputField.className = "single-line-text-input";
    this.questionDiv.appendChild(inputField);
    this.surveyBuilder.surveyContainer.appendChild(this.questionDiv);
    inputField.addEventListener("input", () => {
      const response = {
        questionName: question.name,
        response: inputField.value
      };
      const answerEvent = new CustomEvent("answerSelected", { detail: response });
      this.questionDiv.dispatchEvent(answerEvent);
    });
  }
}
// src/component/SearchInput.ts
class SearchInput extends HTMLElement {
  _config;
  inputValue;
  modalContainer;
  filterInput;
  clearButton;
  optionsContainer;
  cancelButton;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.build();
    this.bindEvents();
  }
  build() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
            <style>
                .search-input-wrapper {
                    position: relative;
                }

                .input-value, .modal-container {
                    width: 100%;
                }

                .input-value input, .header-filter-container input {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: inherit;
                }

                .modal-container {
                    display: none; /* Initially hidden */
                    position: fixed;
                    justify-content: space-between;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 1000;
                    flex-direction: column;
                }

                .header-filter-container {
                    display: flex;
                    padding: 12px;
                }

                .main-options-container {
                    overflow-y: auto;
                    flex-grow: 1;
                    border: 1px solid #ccc;
                    margin: 10px 0;
                }
                .main-options-container .option {
                    padding: 8px; /* Add padding to each option */
                    margin: 2px 0; /* Small margin between options */
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.3s; /* Smooth transition for hover effect */
                }
                .main-options-container .option:hover {
                    background-color: #f0f0f0;
                }

                .footer-actions-container {
                    background-color: whitesmoke;
                    padding: 12px;
                    text-align: center;
                }
                .footer-actions-container .button {
                    padding: 10px 20px;
                    background-color: #4CAF50; /* Green background */
                    color: white; /* White text */
                    border: none;
                    border-radius: 4px;
                    cursor: pointer; /* Change cursor to indicate clickability */
                    transition: background-color 0.3s; /* Smooth transition for hover effect */
                }

                .footer-actions-container .button:hover {
                    background-color: #45a049; /* Slightly darker green on hover */
                }

            </style>
            <div class="search-input-wrapper">
                <div class="input-value">
                    <input type="text" autocomplete="off" placeholder="Type to search...">
                </div>
                <div class="modal-container">
                    <div class="header-filter-container">
                        <input type="text" autocomplete="off" placeholder="Type to search...">
                        <button type="button" class="clear-icon" aria-label="Clear">&#x274C;</button>
                    </div>
                    <div class="main-options-container"></div>
                    <div class="footer-actions-container">
                        <button class="button cancel" type="button" title="Cancel" tabindex="0" role="button"><span>Cancel</span></button>
                    </div>
                </div>
            </div>
        `;
      this.inputValue = this.shadowRoot.querySelector(".input-value input");
      this.modalContainer = this.shadowRoot.querySelector(".modal-container");
      this.filterInput = this.shadowRoot.querySelector(".header-filter-container input");
      this.clearButton = this.shadowRoot.querySelector(".clear-icon");
      this.optionsContainer = this.shadowRoot.querySelector(".main-options-container");
      this.cancelButton = this.shadowRoot.querySelector(".button.cancel");
    }
  }
  bindEvents() {
    this.inputValue.addEventListener("focus", () => this.showModal());
    this.cancelButton.addEventListener("click", () => this.hideModal());
    this.filterInput.addEventListener("input", (e) => this.handleFilterInput(e.target.value));
    this.clearButton.addEventListener("click", () => {
      this.filterInput.value = "";
      this.optionsContainer.innerHTML = "";
      this.filterInput.focus();
    });
  }
  showModal() {
    this.inputValue.style.display = "none";
    this.modalContainer.style.display = "flex";
    this.filterInput.focus();
  }
  hideModal() {
    this.modalContainer.style.display = "none";
    this.inputValue.style.display = "block";
  }
  setConfig(config) {
    this._config = config;
  }
  handleFilterInput(inputValue) {
    this.optionsContainer.innerHTML = "";
    if (inputValue.length >= 2) {
      this.fetchOptions(inputValue).then((options) => {
        options.forEach((option) => {
          const optionDiv = document.createElement("div");
          optionDiv.textContent = option;
          optionDiv.classList.add("option");
          optionDiv.addEventListener("click", () => this.onSelectOption(option));
          this.optionsContainer.appendChild(optionDiv);
        });
      });
    }
  }
  onSelectOption(optionSelected) {
    this.inputValue.value = optionSelected;
    this.hideModal();
    const event = new CustomEvent("optionSelected", {
      detail: { option: optionSelected }
    });
    this.dispatchEvent(event);
  }
  fetchOptions(searchText) {
    return new Promise((resolve, reject) => {
      if (this._config.dynamic_options_service) {
        const serviceUrl = `${this._config.dynamic_options_service}${encodeURIComponent(searchText)}`;
        console.log("serviceUrl : ", serviceUrl);
        fetch(serviceUrl).then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        }).then((data) => {
          console.log("data received : ", data);
          const options = data.result.map((item) => item.name);
          resolve(options);
        }).catch((error) => {
          console.error("Error fetching dynamic options:", error);
          reject(error);
        });
      } else if (this._config.static_options) {
        const filteredOptions = this._config.static_options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()));
        resolve(filteredOptions);
      } else {
        resolve([]);
      }
    });
  }
  onClear() {
    this.filterInput.value = "";
    this.clearButton.style.visibility = "hidden";
    this.clearOptions();
    this.dispatchEvent(new CustomEvent("clear"));
  }
  clearOptions() {
    this.optionsContainer.innerHTML = "";
    this.optionsContainer.style.display = "none";
  }
}
customElements.define("search-input", SearchInput);
// src/SurveyBuilder.ts
class SurveyBuilder {
  surveyContainer;
  config;
  questionNumber;
  questions;
  responses;
  completeCallback;
  constructor(config, containerId) {
    this.config = config;
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
    }
    this.surveyContainer = containerElement;
    this.questionNumber = 1;
    this.responses = {};
    this.questions = [];
    this.createSurvey();
  }
  createSurvey() {
    this.createSurveyTitle(this.config.surveyTitle, this.surveyContainer);
    this.createSurveyDescription(this.config.surveyDescription, this.surveyContainer);
    this.config.questions.forEach((question, index) => {
      switch (question.type) {
        case "ranking":
          this.questions.push(new RankingQuestion(this, question, index));
          break;
        case "single-line-text":
          this.questions.push(new SingleLineTextQuestion(this, question, index));
          break;
        case "multi-line-text":
          this.questions.push(new MultiLineTextQuestion(this, question, index));
          break;
        case "yes-no":
          this.questions.push(new YesNoQuestion(this, question, index));
          break;
        case "select":
          this.questions.push(new SelectQuestion(this, question, index));
          break;
        default:
          console.error("Unsupported question type: " + question.type);
      }
    });
    this.createCompleteButton(this.surveyContainer);
  }
  setResponse(response) {
    this.responses[response.questionName] = response.response;
    this.evaluateVisibilityConditions(response);
  }
  evaluateVisibilityConditions(response) {
    console.log("evaluateVisibilityConditions for ", response.questionName);
    this.questions.forEach((questionComponent) => {
      const question = questionComponent.question;
      if (question.visible_when) {
        const [conditionQuestionName, conditionValue] = question.visible_when.split(" = ").map((s) => s.trim());
        console.log("  question: ", question.name);
        if (conditionQuestionName === response.questionName) {
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
  getQuestionElement(index) {
    let allQuestionElements = this.surveyContainer.getElementsByClassName(".question");
    console.log("allQuestionElements", allQuestionElements);
    console.log(allQuestionElements.length);
    return this.surveyContainer.querySelector(`.question[data-index="${index}"]`);
  }
  createSurveyTitle(surveyTitle, container) {
    const title = document.createElement("h3");
    title.className = "survey-title";
    title.textContent = surveyTitle;
    container.appendChild(title);
  }
  createSurveyDescription(surveyDescription, container) {
    const description = document.createElement("p");
    description.className = "survey-description";
    description.innerHTML = surveyDescription;
    container.appendChild(description);
  }
  createCompleteButton(container) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    const completeButton = document.createElement("button");
    completeButton.className = "complete-button";
    completeButton.textContent = "Complete";
    completeButton.addEventListener("click", () => this.finishSurvey());
    buttonContainer.appendChild(completeButton);
    container.appendChild(buttonContainer);
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
  onComplete(callbackFunction) {
    this.completeCallback = callbackFunction;
  }
  displayThankYouPage() {
    this.surveyContainer.innerHTML = "";
    const thankYouContainer = document.createElement("div");
    thankYouContainer.className = "thank-you-container";
    thankYouContainer.innerHTML = `
        <h2>Thank you for your input.</h2>
        <p>You can close this page. </p>
        <p>Learn more about <a href="https://servicenow.com">Creator Workflows</a>.</>
        <div class="button-container">
            <button class="secondary-button">Prev</button>
            <button class="primary-button">Done</button>
        </div>
    `;
    this.surveyContainer.appendChild(thankYouContainer);
  }
}
window.SurveyBuilder = SurveyBuilder;
