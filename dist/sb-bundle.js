// src/question-types/AnswerSelectedEvent.ts
class AnswerSelectedEvent extends CustomEvent {
  constructor(response) {
    super("answerSelected", { detail: response });
  }
}

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
  questionData;
  constructor(surveyBuilder, question, index) {
    this.surveyBuilder = surveyBuilder;
    this.questionData = question;
    this.questionDiv = document.createElement("div");
    this.questionDiv.className = `question ${question.type}-question`;
    this.questionDiv.dataset.index = index.toString();
    this.questionDiv.dataset.questionName = question.name;
    this.surveyBuilder.addQuestionElement(this.questionDiv);
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
  updateTitle(newTitle) {
    const titleElement = document.querySelector(`[data-question-name="${this.questionData.name}"] .question-title`);
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
  }
}

// src/question-types/FollowUpQuestion.ts
class FollowUpQuestion extends QuestionType {
  detailQuestions;
  detailResponses = {};
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.detailQuestions = question.detailQuestions || [];
    this.renderDetailQuestions();
  }
  renderDetailQuestions() {
    this.detailQuestions.forEach((detailQuestion) => {
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "input-group";
      const labelElement = document.createElement("label");
      labelElement.textContent = detailQuestion.title;
      inputWrapper.appendChild(labelElement);
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = detailQuestion.placeholder;
      input.addEventListener("input", this.handleInputChange.bind(this, detailQuestion.name));
      inputWrapper.appendChild(input);
      this.questionDiv.appendChild(inputWrapper);
    });
  }
  handleInputChange(name, event) {
    const target = event.target;
    this.detailResponses[name] = target.value;
    const response = {
      questionName: this.questionData.name,
      response: this.detailResponses
    };
    console.log("Aggregated Input Change:", this.detailResponses);
    this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
  }
}
// src/question-types/multi-line.ts
class MultiLineTextQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    const textArea = document.createElement("textarea");
    textArea.name = question.name;
    textArea.required = question.isRequired;
    textArea.className = "multi-line-text-input";
    textArea.placeholder = "Enter your comments here...";
    this.questionDiv.appendChild(textArea);
    textArea.addEventListener("input", () => {
      const response = {
        questionName: question.name,
        response: textArea.value
      };
      this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    });
  }
}
// src/question-types/AbstractChoice.ts
class AbstractChoice extends QuestionType {
  items = [];
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    this.items = question.items;
    this.renderChoices();
  }
  createLabel(forId, text) {
    const label = document.createElement("label");
    label.htmlFor = forId;
    label.textContent = text;
    return label;
  }
}

// src/question-types/MultiChoice.ts
class MultiChoice extends AbstractChoice {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
  }
  renderChoices() {
    const choiceContainer = document.createElement("div");
    choiceContainer.className = "items";
    this.items.forEach((item, i) => {
      this.appendChoice(item, i, choiceContainer);
    });
    if (this.questionData.includeOtherOption) {
      this.appendOtherOption(choiceContainer);
    }
    this.questionDiv.appendChild(choiceContainer);
    choiceContainer.addEventListener("change", this.handleResponseChange.bind(this));
  }
  appendChoice(item, index, container) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "item";
    const checkboxId = `${this.questionData.name}-${index}`;
    const checkbox = this.createCheckbox(item, this.questionData.name, checkboxId);
    const label = this.createLabel(checkboxId, item);
    wrapperDiv.appendChild(checkbox);
    wrapperDiv.appendChild(label);
    container.appendChild(wrapperDiv);
  }
  appendOtherOption(container) {
    const otherWrapperDiv = document.createElement("div");
    otherWrapperDiv.className = "item other-item";
    const checkboxId = `${this.questionData.name}-other`;
    const checkbox = this.createCheckbox("Other", this.questionData.name, checkboxId);
    checkbox.dataset.other = "true";
    const label = this.createLabel(checkboxId, "Other");
    label.htmlFor = checkboxId;
    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.id = `${checkboxId}-specify`;
    otherInput.name = `${this.questionData.name}-other-specify`;
    otherInput.placeholder = "Specify";
    otherInput.className = "other-specify-input hidden";
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        otherInput.style.display = "block";
        label.style.color = "transparent";
        otherInput.focus();
      } else {
        otherInput.style.display = "none";
        label.style.color = "";
        otherInput.value = "";
      }
    });
    otherWrapperDiv.appendChild(checkbox);
    otherWrapperDiv.appendChild(label);
    otherWrapperDiv.appendChild(otherInput);
    container.appendChild(otherWrapperDiv);
  }
  handleResponseChange() {
    const selectedOptions = this.items.filter((_, i) => {
      const checkbox = document.getElementById(`${this.questionData.name}-${i}`);
      return checkbox && checkbox.checked;
    }).map((item, i) => ({ value: item }));
    const otherInput = document.getElementById(`${this.questionData.name}-other-specify`);
    if (otherInput && otherInput.style.display !== "none") {
      selectedOptions.push({ value: otherInput.value });
    }
    const response = {
      questionName: this.questionData.name,
      response: selectedOptions
    };
    this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
  }
  createCheckbox(value, name, id) {
    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = id;
    checkboxInput.name = name;
    checkboxInput.value = value;
    return checkboxInput;
  }
}
// src/question-types/OneChoice.ts
class OneChoice extends AbstractChoice {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
  }
  renderChoices() {
    const choiceContainer = document.createElement("div");
    choiceContainer.className = "items";
    if (this.items) {
      this.items.forEach((item, i) => {
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "item";
        const radioId = `${this.questionData.name}-${i}`;
        const radio = this.createRadio(item, this.questionData.name, radioId);
        const label = this.createLabel(radioId, item);
        wrapperDiv.appendChild(radio);
        wrapperDiv.appendChild(label);
        choiceContainer.appendChild(wrapperDiv);
      });
    } else {
      console.warn("Items are undefined for question:", this.questionData.name);
    }
    this.questionDiv.appendChild(choiceContainer);
    choiceContainer.addEventListener("change", (event) => {
      const target = event.target;
      const response = {
        questionName: this.questionData.name,
        response: target.value
      };
      this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
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
}
// src/question-types/ranking.ts
class RankingQuestion extends QuestionType {
  placeholder;
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    const rankingList = document.createElement("div");
    rankingList.className = `ranking-list ${question.name}`;
    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder";
    this.placeholder.textContent = "Drop here...";
    question.items.forEach((item, index2) => {
      const listItem = document.createElement("div");
      listItem.setAttribute("draggable", "true");
      listItem.className = "ranking-item";
      listItem.setAttribute("data-rank", `${index2} + 1`);
      const dragIcon = document.createElement("div");
      dragIcon.className = "drag-icon";
      dragIcon.textContent = "\u2261";
      listItem.appendChild(dragIcon);
      const indexDiv = document.createElement("div");
      indexDiv.className = "index";
      indexDiv.textContent = `${index2 + 1}`;
      listItem.appendChild(indexDiv);
      const itemText = document.createElement("div");
      itemText.className = "item-text";
      itemText.textContent = item;
      listItem.appendChild(itemText);
      rankingList.appendChild(listItem);
    });
    this.questionDiv.appendChild(rankingList);
    this.setupDragAndDropListeners(rankingList, question);
  }
  setupDragAndDropListeners(rankingList, question) {
    let draggedItem = null;
    let lastAfterElement = null;
    rankingList.addEventListener("dragstart", (event) => {
      draggedItem = event.target;
      draggedItem.classList.add("dragging");
    });
    rankingList.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!draggedItem)
        return;
      const afterElement = this.getDragAfterElement(rankingList, event.clientY);
      if (afterElement !== lastAfterElement) {
        lastAfterElement = afterElement;
        if (afterElement) {
          rankingList.insertBefore(this.placeholder, afterElement);
        } else {
          rankingList.appendChild(this.placeholder);
        }
      }
    });
    rankingList.addEventListener("dragend", () => {
      if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        this.placeholder.remove();
        lastAfterElement = null;
      }
    });
    rankingList.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!draggedItem)
        return;
      if (this.placeholder.parentNode) {
        rankingList.insertBefore(draggedItem, this.placeholder);
      }
      this.placeholder.remove();
      const rankingItems = rankingList.querySelectorAll(".ranking-item");
      rankingItems.forEach((item, index) => {
        const itemText = item.querySelector(".item-text")?.textContent ?? "Unknown Item";
        const indexDiv = item.querySelector(".index");
        if (indexDiv) {
          indexDiv.textContent = `${index + 1}`;
        }
        item.setAttribute("data-rank", `${index + 1}`);
      });
      const updatedOrder = Array.from(rankingItems).map((item, index) => ({
        rank: index + 1,
        item: item.querySelector(".item-text")?.textContent ?? "Unknown Item"
      }));
      const response = {
        questionName: question.name,
        response: updatedOrder
      };
      console.log("Updated Order: ", response);
      this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    });
  }
  getDragAfterElement(container, y) {
    const draggableElements = Array.from(container.querySelectorAll(".ranking-item:not(.dragging)"));
    let closestElement = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    draggableElements.forEach((element) => {
      const box = element.getBoundingClientRect();
      const offset = y - box.bottom;
      if (offset < closestDistance && offset > 0) {
        closestDistance = offset;
        closestElement = element;
      }
    });
    return closestElement;
  }
  collectUpdatedOrder(rankingList) {
    return Array.from(rankingList.querySelectorAll(".ranking-item")).map((item, index) => ({
      rank: index + 1,
      item: item.querySelector(".item-text")?.textContent ?? "Unknown Item"
    }));
  }
}
// src/question-types/select.ts
class SelectQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    const searchComponent = document.createElement("search-input");
    this.questionDiv.appendChild(searchComponent);
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
      this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    });
  }
}
// src/question-types/single-line.ts
class SingleLineTextQuestion extends QuestionType {
  constructor(surveyBuilder, question, index) {
    super(surveyBuilder, question, index);
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.name = question.name;
    inputField.required = question.isRequired;
    inputField.className = "single-line-text-input";
    this.questionDiv.appendChild(inputField);
    inputField.addEventListener("input", () => {
      const response = {
        questionName: question.name,
        response: inputField.value
      };
      this.questionDiv.dispatchEvent(new AnswerSelectedEvent(response));
    });
  }
}
// src/question-types/YesNoQuestion.ts
class YesNoQuestion2 extends OneChoice {
  constructor(surveyBuilder, question, index) {
    const modifiedQuestion = { ...question, items: ["Yes", "No"] };
    super(surveyBuilder, modifiedQuestion, index);
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
                .search-input {
                    position: relative;
                }

                .search-input .input-value {
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
                    z-index: 9999;
                    flex-direction: column;
                }

                .input-value input, .header-filter-container input {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: inherit;
                }

                .header-filter-container {
                    display: flex;
                    padding: 8px;
                }

                .header-filter-container .search-icon {
                    position: absolute;
                    left: 10px; 
                    pointer-events: none;
                }

                .header-filter-container .input-with-clear {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .header-filter-container .input-with-clear input {
                    flex-grow: 1;
                    _width: 100%;
                    padding-left: 40px; /* Space for the search icon */
                    padding-right: 30px; /* Space for the clear icon */

                    _padding: 12px 16px 12px 12px; /* padding to not overlap with the clear icon */
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }

                /* Additional styles to ensure the clear button only shows when there's text */
                .header-filter-container input:valid + .clear-icon {
                    display: block;
                }

                .header-filter-container .input-with-clear .magnifier-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    fill: #293E41; 
                }
                
                .header-filter-container .clear-icon {
                    position: absolute;
                    right: 10px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 0;
                    color: #293E40;
                }
                                
                .header-filter-container .clear-icon svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .main-options-container {
                    overflow-y: auto;
                    flex-grow: 1;                    
                    margin-left: 8px;
                    margin-right: 8px;
                }
                .main-options-container .option {
                    padding: 8px; 
                    margin: 2px 0;
                    cursor: pointer;
                    border: 1px solid lightgray;
                    border-radius: 4px;

                    transition: background-color 0.3s;
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
                    cursor: pointer; 
                    transition: background-color 0.3s; 
                }
                .footer-actions-container .button:hover {
                    background-color: #45a049;
                }
            </style>
            <div class="search-input">
                <div class="input-value">
                    <input type="text" autocomplete="off" placeholder="Type to search...">
                </div>
                <div class="modal-container">
                    <div class="header-filter-container">
                        <div class="input-with-clear">
                            <svg class="search-icon" width="28px" height="28px" viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Group-6" transform="translate(1.000000, 1.000000)" stroke="#293E41" stroke-width="1.8">
                                        <ellipse id="Oval" transform="translate(11.982318, 12.085276) rotate(-45.000000) translate(-11.982318, -12.085276) " cx="11.9823181" cy="12.0852763" rx="7.8125" ry="7.90909091"></ellipse>
                                        <path d="M21.0889963,17.3736826 L21.0889963,25.0067188" id="Line-2" stroke-linecap="square" transform="translate(21.088996, 21.139916) rotate(-45.000000) translate(-21.088996, -21.139916) "></path>
                                    </g>
                                </g>
                            </svg>
                            <input type="text" autocomplete="off" placeholder="Type to search...">
                            <button type="button" class="clear-icon" aria-label="Clear">
                                <svg width="19px" height="19px" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg">
                                    <g stroke-linecap="square" stroke="#293E40" stroke-width="1.8">
                                        <path d="M15.5361199,15.5563492 L0,0"></path>
                                        <path d="M0,15.5563492 L15.5361199,0"></path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="main-options-container">
                    </div>
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
// src/ConditionParser.ts
class ConditionParser {
  responses;
  constructor(responses) {
    this.responses = responses;
  }
  static extractQuestionNamesFromCondition(conditionStr) {
    console.log(`extractQuestionNamesFromCondition`);
    console.log(`  - conditionStr : ${conditionStr}`);
    const questionNames = [];
    const regex = /([^\s=<>!]+)\s*(=|<=|>=|<|>|!=)/g;
    let match;
    while (match = regex.exec(conditionStr)) {
      if (match[1] && !questionNames.includes(match[1])) {
        questionNames.push(match[1]);
      }
    }
    console.log(`  - references questions: ${questionNames.join(", ")}`);
    return questionNames;
  }
  evaluateCondition(conditionStr) {
    const orConditions = conditionStr.split("Or").map((s) => s.trim());
    for (const orCondition of orConditions) {
      const andConditions = orCondition.split("And").map((s) => s.trim());
      if (andConditions.every((cond) => this.evaluateAndCondition(cond))) {
        return true;
      }
    }
    return false;
  }
  evaluateAndCondition(conditionStr) {
    const conditions = this.parseConditions(conditionStr);
    return conditions.every(({ questionName, operator, value }) => {
      const answer = this.responses[questionName];
      switch (operator) {
        case "=":
          return answer == value;
        case "<":
          return answer < value;
        case ">":
          return answer > value;
        default:
          throw new Error(`Unsupported operator ${operator}`);
      }
    });
  }
  parseConditions(conditionStr) {
    return conditionStr.split("And").map((condStr) => {
      const [questionName, operator, valueStr] = condStr.split(/\s*(=|<)\s*/).map((s) => s.trim());
      const value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
      return {
        questionName,
        operator,
        value
      };
    });
  }
}

// src/SurveyBuilder.ts
class SurveyBuilder {
  static RESPONSE_PLACEHOLDER_REGEX = /{{\s*(.+?)\s*}}/g;
  surveyContainer;
  questionsContainer;
  config;
  questionNumber;
  questionComponents;
  responses;
  completeCallback;
  questionDependencies = new Map;
  constructor(config, containerId) {
    this.config = config;
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
    }
    this.surveyContainer = containerElement;
    this.questionNumber = 1;
    this.responses = {};
    this.questionComponents = [];
    const initialPage = document.createElement("div");
    initialPage.id = "initial-page";
    this.surveyContainer.appendChild(initialPage);
    this.createInitialPage(initialPage);
    this.questionsContainer = document.createElement("div");
    this.questionsContainer.id = "survey-questions";
    this.questionsContainer.style.display = "none";
    this.surveyContainer.appendChild(this.questionsContainer);
  }
  createInitialPage(container) {
    this.createSurveyTitle(this.config.surveyTitle, container);
    this.createSurveyDescription(this.config.surveyDescription, container);
    this.createStartButton(container);
  }
  createStartButton(container) {
    const startButtonWrapper = document.createElement("div");
    startButtonWrapper.className = "start-button-wrapper";
    const startButton = document.createElement("button");
    startButton.textContent = "Start Survey";
    startButton.className = "start-survey-button";
    startButton.addEventListener("click", () => {
      container.style.display = "none";
      this.questionsContainer.style.display = "block";
      this.startSurvey();
    });
    startButtonWrapper.appendChild(startButton);
    container.appendChild(startButtonWrapper);
  }
  startSurvey() {
    this.questionsContainer.style.display = "block";
    this.initializeQuestions();
  }
  initializeQuestions() {
    this.config.questions.forEach((question, index) => {
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
  addQuestionElement(questionDiv) {
    this.questionsContainer.appendChild(questionDiv);
  }
  storeQuestionDependencies(question) {
    const titleDependencies = this.extractTitleDependency(question.title);
    this.updateQuestionDependencies(question.name, titleDependencies);
    if (question.visible_when) {
      const conditionDependencies = ConditionParser.extractQuestionNamesFromCondition(question.visible_when);
      this.updateQuestionDependencies(question.name, conditionDependencies);
    }
  }
  updateQuestionDependencies(questionName, dependencies) {
    dependencies.forEach((dependency) => {
      const currentDependencies = this.questionDependencies.get(dependency) || [];
      if (!currentDependencies.includes(questionName)) {
        currentDependencies.push(questionName);
      }
      this.questionDependencies.set(dependency, currentDependencies);
    });
  }
  extractTitleDependency(title) {
    const matches = Array.from(title.matchAll(SurveyBuilder.RESPONSE_PLACEHOLDER_REGEX));
    const dependencies = matches.map((match) => {
      const dependency = match[1].trim();
      console.log(`Dependency '${dependency}' found in title: ${title}`);
      return dependency;
    });
    return dependencies;
  }
  constructNewTitle(template, response) {
    return template.replace(SurveyBuilder.RESPONSE_PLACEHOLDER_REGEX, (_, placeholderName) => {
      return response;
    });
  }
  setResponse(response) {
    this.responses[response.questionName] = response.response;
    this.evaluateVisibilityConditions(response);
    this.updateDependentQuestionTitles(response);
  }
  evaluateVisibilityConditions(response) {
    console.log("Evaluating visibility conditions based on response to question: ", response.questionName);
    const dependentQuestions = this.questionDependencies.get(response.questionName);
    console.log("dependentQuestions: ", dependentQuestions);
    if (dependentQuestions) {
      const conditionParser = new ConditionParser(this.responses);
      dependentQuestions.forEach((dependentQuestionName) => {
        console.log(" - question: " + dependentQuestionName);
        const questionComponent = this.questionComponents.find((qc) => qc.questionData.name === dependentQuestionName);
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
  updateDependentQuestionTitles(response) {
    console.log("updateDependentQuestionTitles dependent on question: " + response.questionName);
    const dependentQuestions = this.questionDependencies.get(response.questionName);
    if (dependentQuestions) {
      dependentQuestions.forEach((dependentQuestionName) => {
        const dependentQuestionComponent = this.questionComponents.find((questionComponent) => questionComponent.questionData.name === dependentQuestionName);
        if (dependentQuestionComponent) {
          const questionData = dependentQuestionComponent.questionData;
          console.log(" - question: " + response.questionName);
          const newTitle = this.constructNewTitle(questionData.title, response.response);
          dependentQuestionComponent.updateTitle(newTitle);
        }
      });
    }
  }
  getQuestionElement(index) {
    let allQuestionElements = this.questionsContainer.getElementsByClassName(".question");
    console.log("allQuestionElements", allQuestionElements);
    console.log(allQuestionElements.length);
    return this.questionsContainer.querySelector(`.question[data-index="${index}"]`);
  }
  createCompleteButton(container) {
    const footer = document.createElement("footer");
    const completeButton = document.createElement("button");
    completeButton.className = "complete-button";
    completeButton.textContent = "Complete";
    completeButton.addEventListener("click", () => this.finishSurvey());
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
