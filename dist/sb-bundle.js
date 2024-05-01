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

// src/EventEmitter.ts
class EventEmitter {
  static listeners = new Map;
  static on(event, listener) {
    if (!EventEmitter.listeners.has(event)) {
      EventEmitter.listeners.set(event, []);
    }
    EventEmitter.listeners.get(event)?.push(listener);
  }
  static off(event, listener) {
    const listeners = EventEmitter.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  static emit(event, ...args) {
    const listeners = EventEmitter.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        listener(...args);
      });
    }
  }
}

// src/EventTypes.ts
var TITLE_UPDATED = "title-updated";
var ANSWER_SELECTED = "answer-selected";
var SURVEY_STARTED = "survey-started";

// src/question-types/QuestionComponent.ts
class QuestionComponent {
  questionDiv;
  questionData;
  constructor(question, index) {
    this.questionData = question;
    this.questionDiv = document.createElement("div");
    this.questionDiv.className = `question ${question.type}-question`;
    this.questionDiv.dataset.index = index.toString();
    this.questionDiv.dataset.questionName = question.name;
    const titleElement = createQuestionTitle(question.title);
    titleElement.classList.add("question-title");
    this.questionDiv.appendChild(titleElement);
    this.setupResponseListener();
  }
  setTitle(newTitle) {
    this.questionData.title = newTitle;
    const titleElement = this.questionDiv.querySelector(".question-title");
    if (titleElement) {
      titleElement.textContent = newTitle;
    } else {
      console.error("Title element not found for question:", this.questionData.name);
    }
  }
  setupResponseListener() {
    this.questionDiv.addEventListener("answerSelected", (event) => {
      const responseEvent = event;
      EventEmitter.emit(ANSWER_SELECTED, responseEvent.detail);
    });
  }
  show() {
    this.questionDiv.style.display = "block";
  }
  hide() {
    this.questionDiv.style.display = "none";
  }
  getQuestionDiv() {
    return this.questionDiv;
  }
}

// src/question-types/FollowUpQuestion.ts
class FollowUpQuestion extends QuestionComponent {
  detailQuestions;
  detailResponses = {};
  constructor(question, index) {
    super(question, index);
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
      input.placeholder = detailQuestion.placeholder ?? "";
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
class MultiLineTextQuestion extends QuestionComponent {
  constructor(question, index) {
    super(question, index);
    const textArea = document.createElement("textarea");
    textArea.name = question.name;
    textArea.required = question.isRequired ?? false;
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
class AbstractChoice extends QuestionComponent {
  items = [];
  constructor(question, index) {
    super(question, index);
    this.items = question.items;
    this.renderChoices();
  }
  createLabel(forId, text) {
    const label = document.createElement("label");
    label.htmlFor = forId;
    label.textContent = text;
    label.classList.add("choice-label");
    return label;
  }
}

// src/question-types/MultiChoice.ts
class MultiChoice extends AbstractChoice {
  constructor(question, index) {
    super(question, index);
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
    otherInput.className = "other-specify-input";
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
  constructor(question, index) {
    super(question, index);
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
class RankingQuestion extends QuestionComponent {
  placeholder;
  constructor(question, index) {
    super(question, index);
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
class SelectQuestion extends QuestionComponent {
  constructor(question, index) {
    super(question, index);
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
class SingleLineTextQuestion extends QuestionComponent {
  constructor(question, index) {
    super(question, index);
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.name = question.name;
    inputField.required = question.isRequired ?? false;
    inputField.className = "single-line-text-input";
    inputField.placeholder = question.placeholder ?? "";
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
  constructor(question, index) {
    const modifiedQuestion = { ...question, items: ["Yes", "No"] };
    super(modifiedQuestion, index);
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
// src/engine/ast/ASTNode.ts
class AssignmentExpression {
  left;
  right;
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitAssignmentExpression(this);
  }
}

class ArrayLiteral {
  elements;
  constructor(elements) {
    this.elements = elements;
  }
  accept(visitor) {
    return visitor.visitArrayLiteral(this);
  }
}

class LogicalExpression {
  left;
  operator;
  right;
  constructor(left, operator, right) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitLogicalExpression(this);
  }
}

class Identifier {
  name;
  constructor(name) {
    this.name = name;
  }
  accept(visitor) {
    return visitor.visitIdentifier(this);
  }
}

class NumberNode {
  value;
  constructor(value) {
    this.value = value;
  }
  accept(visitor) {
    return visitor.visitNumberNode(this);
  }
}

class StringNode {
  value;
  constructor(value) {
    this.value = value;
  }
  accept(visitor) {
    return visitor.visitStringNode(this);
  }
}

class BooleanNode {
  value;
  constructor(value) {
    this.value = value;
  }
  accept(visitor) {
    return visitor.visitBooleanNode(this);
  }
}

class BinaryExpression {
  left;
  operator;
  right;
  constructor(left, operator, right) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitBinaryExpression(this);
  }
}

class GroupExpression {
  expression;
  constructor(expression) {
    this.expression = expression;
  }
  accept(visitor) {
    return visitor.visitGroupExpression(this);
  }
}

class MemberExpression {
  object;
  property;
  constructor(object, property) {
    this.object = object;
    this.property = property;
  }
  accept(visitor) {
    return visitor.visitMemberExpression(this);
  }
}

class UnaryExpression {
  operator;
  operand;
  constructor(operator, operand) {
    this.operator = operator;
    this.operand = operand;
  }
  accept(visitor) {
    return visitor.visitUnaryExpression(this);
  }
}

// src/engine/Token.ts
var Token = {
  ASSIGN: "ASSIGN",
  BOOLEAN: "BOOLEAN",
  DOT: "DOT",
  EQUALS: "EQUALS",
  NUMBER: "NUMBER",
  STRING: "STRING",
  IDENTIFIER: "IDENTIFIER",
  OPERATOR: "OP",
  NOT: "NOT",
  NOT_EQUAL: "NOT_EQUAL",
  AND: "AND",
  OR: "OR",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  CONTAINS: "CONTAINS",
  IN: "IN",
  COMMA: "COMMA",
  LBRACKET: "LBRACKET",
  RBRACKET: "RBRACKET"
};

// src/engine/Tokenizer.js
class Tokenizer {
  constructor() {
    this.compactOperators = [
      { match: "==", type: Token.EQUALS, value: "==" },
      { match: "=", type: Token.ASSIGN, value: "=" },
      { match: "!=", type: Token.NOT_EQUAL, value: "!=" },
      { match: "!", type: Token.NOT, value: "!" },
      { match: "+", type: Token.OPERATOR, value: "+" },
      { match: "-", type: Token.OPERATOR, value: "-" },
      { match: "*", type: Token.OPERATOR, value: "*" },
      { match: "/", type: Token.OPERATOR, value: "/" },
      { match: "^", type: Token.OPERATOR, value: "^" },
      { match: "(", type: Token.LPAREN, value: "(" },
      { match: ")", type: Token.RPAREN, value: ")" },
      { match: ",", type: Token.COMMA, value: "," },
      { match: ">=", type: Token.OPERATOR, value: ">=" },
      { match: "<=", type: Token.OPERATOR, value: "<=" },
      { match: ">", type: Token.OPERATOR, value: ">" },
      { match: "<", type: Token.OPERATOR, value: "<" },
      { match: ".", type: Token.DOT, value: "." },
      { match: "[", type: Token.LBRACKET, value: "[" },
      { match: "]", type: Token.RBRACKET, value: "]" }
    ];
    this.spaceSensitiveKeywords = [
      { match: "and", type: Token.AND },
      { match: "contains", type: Token.CONTAINS },
      { match: "in", type: Token.IN },
      { match: "or", type: Token.OR },
      { match: "not", type: Token.NOT },
      { match: "is between", type: "IS_BETWEEN" },
      { match: "is not", type: Token.NOT_EQUAL, value: "!=" },
      { match: "is", type: Token.EQUALS, value: "==" }
    ];
    this.booleans = [
      { match: "true", type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 }
    ];
    this.tokens = [];
  }
  isDigit(char) {
    return char >= "0" && char <= "9";
  }
  isAlpha(char) {
    return char >= "a" && char <= "z" || char >= "A" && char <= "Z";
  }
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char) || char === "_" || char === "-";
  }
  matchToken(input, position, tokenList) {
    for (const token of tokenList) {
      if (input.startsWith(token.match, position)) {
        return token;
      }
    }
    return null;
  }
  parseTokens(input) {
    this.tokens = [];
    let position = 0;
    let column = 1;
    let line = 1;
    while (position < input.length) {
      let char = input[position];
      if (char === "\n") {
        line++;
        column = 1;
      }
      if (/\s/.test(char)) {
        position++;
        column++;
        continue;
      }
      if (char === '"' || char === "'") {
        let endChar = char;
        let stringLiteral = "";
        position++;
        column++;
        char = input[position];
        while (position < input.length && char !== endChar) {
          stringLiteral += char;
          position++;
          column++;
          char = input[position];
        }
        if (char === endChar) {
          this.tokens.push({ type: Token.STRING, value: stringLiteral, line, column });
          position++;
          column++;
          continue;
        } else {
          throw new Error("Syntax error: unclosed string literal");
        }
      }
      if (this.isDigit(char)) {
        let number = "";
        let startColumn = column;
        while (this.isDigit(char) || char === ".") {
          number += char;
          position++;
          column++;
          char = input[position];
        }
        this.tokens.push({ type: Token.NUMBER, value: parseFloat(number), line, column: startColumn });
        continue;
      }
      const compactOp = this.matchToken(input, position, this.compactOperators);
      if (compactOp) {
        this.tokens.push({ type: compactOp.type, value: compactOp.match, line, column });
        position += compactOp.match.length;
        column += compactOp.match.length;
        continue;
      }
      const boolOp = this.matchToken(input, position, this.booleans);
      if (boolOp) {
        this.tokens.push({ type: Token.BOOLEAN, value: boolOp.match === "true", line, column });
        position += boolOp.match.length;
        column += boolOp.match.length;
        continue;
      }
      const keyword = this.matchToken(input, position, this.spaceSensitiveKeywords);
      if (keyword) {
        const operatorEndPosition = position + keyword.match.length;
        const charAfterMatch = input[operatorEndPosition];
        if (charAfterMatch === undefined || !this.isAlphaNumeric(charAfterMatch)) {
          let tokenValue = keyword.value ? keyword.value : keyword.match;
          this.tokens.push({ type: keyword.type, value: tokenValue, line, column });
          position += keyword.match.length;
          column += keyword.match.length;
          continue;
        }
      }
      if (this.isAlpha(char)) {
        let identifier = "";
        while (this.isAlphaNumeric(char)) {
          identifier += char;
          position++;
          column++;
          char = input[position];
        }
        this.tokens.push({ type: Token.IDENTIFIER, value: identifier, line, column });
        continue;
      }
      position++;
      column++;
    }
    return this.tokens;
  }
}

// src/engine/Logger.js
class Logger {
  static depth = 0;
  static isEnabled = true;
  static enableLogging() {
    Logger.isEnabled = true;
  }
  static disableLogging() {
    Logger.isEnabled = false;
  }
  static logStart(message) {
    if (!Logger.isEnabled)
      return;
    console.log(Logger.generatePrefix() + "\u250C\u2500 START " + message);
    Logger.depth++;
  }
  static log(message) {
    if (!Logger.isEnabled)
      return;
    console.log(Logger.generatePrefix() + "\u251C\u2500 " + message);
  }
  static logEnd(message) {
    if (!Logger.isEnabled)
      return;
    Logger.depth--;
    console.log(Logger.generatePrefix() + "\u2514\u2500 END " + message);
  }
  static generatePrefix() {
    return "\u2502  ".repeat(Logger.depth);
  }
}

// src/engine/Parser.js
class Parser {
  constructor() {
  }
  parse(input) {
    const tokenizer = new Tokenizer;
    const tokens = tokenizer.parseTokens(input);
    let current = 0;
    Logger.disableLogging();
    function formatToken(token) {
      if (!token)
        return "end of input";
      return `${token.type}(${token.value})`;
    }
    const isAtEnd = () => current >= tokens.length;
    const peek = () => {
      if (isAtEnd())
        return null;
      return tokens[current];
    };
    const previous = () => tokens[current - 1];
    const advance = () => {
      if (!isAtEnd()) {
        const fromToken = current > 0 ? previous() : { type: "START", value: "start of input" };
        const toToken = peek();
        Logger.log(`Advance: Next token to process is '${formatToken(toToken)}', moving from '${formatToken(fromToken)}'`);
        current++;
      } else {
        Logger.log(`Advance: At 'end of input', no more tokens to process.`);
      }
      return previous();
    };
    const check = (...expected) => {
      if (isAtEnd()) {
        Logger.log(`Check: Reached 'end of input', cannot match any more tokens.`);
        return false;
      }
      const nextToken = peek();
      let matchFound = expected.includes(nextToken.type) || expected.includes(nextToken.value);
      return matchFound;
    };
    const match = (...types) => {
      if (check(...types)) {
        Logger.log(`Match(): Matched  [${types.join(", ")}] -  and advanced to the next token`);
        advance();
        return true;
      }
      Logger.log(`Match(): No match found for tokens: '${types.join(", ")}'`);
      return false;
    };
    const consume = (tokenType, message) => {
      Logger.log(`Attempting to consume a '${tokenType}' token.`);
      if (check(tokenType)) {
        const token = advance();
        Logger.log(`Success: Consumed '${tokenType}' token with value: '${token.value}'.`);
        return token;
      } else {
        const actualToken = peek();
        Logger.log(`Failure: Expected '${tokenType}', but found '${actualToken ? actualToken.type : "end of input"}'. ${message}`);
        throw new Error(`Error: Expected '${tokenType}', found '${actualToken ? actualToken.type : "end of input"}'. ${message}`);
      }
    };
    const error = (token, message) => {
      const tokenDisplay = formatToken(token);
      throw new Error(`Error at token ${tokenDisplay}: ${message}`);
    };
    const parseNumber = (token) => {
      Logger.logStart(`parseNumber: token #${current} of type NUMBER with value: ${token.value}`);
      Logger.logEnd(`Completed parsing token #${current} as NUMBER with value: ${token.value}`);
      return new NumberNode(token.value);
    };
    const parseBoolean = (token) => {
      Logger.logStart(`Parsing : token #${current} of type BOOLEAN with value: ${token.value}`);
      Logger.logEnd(`Parsing BOOLEAN at position: ${current}`);
      return new BooleanNode(token.value);
    };
    const parseString = (token) => {
      Logger.logStart(`parseString: token #${current} of type STRING with value: ${token.value}`);
      Logger.logEnd(`Parsing STRING token at position: ${current}`);
      return new StringNode(token.value);
    };
    const parseIdentifier = (token) => {
      Logger.logStart(`parseIdentifier: token #${current} of type IDENTIFIER with value: ${token.value}`);
      Logger.logEnd(`Parsing IDENTIFIER token at position: ${current}`);
      return new Identifier(token.value);
    };
    function parseGroup() {
      Logger.logStart(`Parsing GROUP at position: ${current}`);
      let expr = parseExpression();
      if (expr === null) {
        throw new Error("Expect expression within parentheses.");
      }
      consume("RPAREN", "Expect ')' after expression.");
      Logger.log(`Parsing GROUP: expression = '${JSON.stringify(expr, null, 2)}'`);
      Logger.logEnd(`Parsing GROUP at position: ${current}`);
      return new GroupExpression(expr);
    }
    const parseLogicalOr = () => {
      let expr = parseLogicalAnd();
      while (match(Token.OR)) {
        const operator = Token.OR;
        const right = parseLogicalAnd();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    };
    const parseLogicalAnd = () => {
      let expr = parseEquality();
      while (match(Token.AND)) {
        const operator = Token.AND;
        const right = parseEquality();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    };
    const parsePrimary = () => {
      Logger.logStart(`parsePrimary`);
      let result = null;
      if (match(Token.NUMBER))
        result = parseNumber(previous());
      else if (match(Token.STRING))
        result = parseString(previous());
      else if (match(Token.BOOLEAN))
        result = parseBoolean(previous());
      else if (match(Token.LPAREN))
        result = parseGroup();
      else if (match(Token.LBRACKET))
        result = parseArrayLiteral();
      else if (match(Token.IDENTIFIER))
        result = parseIdentifier(previous());
      while (match(".")) {
        consume(Token.IDENTIFIER, "Expect property name after '.'.");
        const property = previous();
        result = new MemberExpression(result, new Identifier(property.value));
      }
      Logger.logEnd(`parsePrimary`);
      return result;
    };
    const parseTerm = (left) => {
      Logger.logStart(`Parsing term for potential addition/subtraction operations`);
      var expr = parseFactor();
      while (match("+", "-")) {
        Logger.log(`Matched + or -: ${previous().type}`);
        const operator = previous().value;
        const right = parseFactor();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}' `);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`Completed parsing term`);
      return expr;
    };
    const parseExponent = () => {
      Logger.logStart("Parsing exponentiation operations");
      let base = parseUnary();
      while (match("^")) {
        Logger.log("Found exponentiation operator ^");
        const operator = previous().value;
        const exponent = parseExponent();
        if (exponent === null) {
          throw new Error(`Missing exponent after '${operator}'`);
        }
        base = new BinaryExpression(base, operator, exponent);
      }
      Logger.logEnd("Parsed exponentiation operation");
      return base;
    };
    const parseFactor = () => {
      Logger.logStart("Parsing factors for multiplication/division");
      let expr = parseExponent();
      while (match("*", "/")) {
        const operator = previous().value;
        const right = parseExponent();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd("Parsed factor");
      return expr;
    };
    const parseUnary = () => {
      Logger.logStart("Parsing Unary");
      while (match("-", "!")) {
        const operator = previous().value;
        const right = parseUnary();
        return new UnaryExpression(operator, right);
      }
      Logger.logEnd("Parsed Unary");
      return parsePrimary();
    };
    const parseArrayLiteral = () => {
      const elements = [];
      if (!check(Token.RBRACKET)) {
        do {
          const element = parseExpression();
          elements.push(element);
        } while (match(Token.COMMA));
      }
      consume(Token.RBRACKET, "Expect ']' after array elements.");
      return new ArrayLiteral(elements);
    };
    const parseEquality = () => {
      Logger.logStart(`Parsing equality/non-equality operators between expressions`);
      var expr = parseComparison();
      while (match("==", "!=")) {
        const operator = previous().value;
        const right = parseComparison();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`parseEquality`);
      return expr;
    };
    const parseAssignment = () => {
      Logger.logStart(`parseAssignment`);
      let expr = parseLogicalOr();
      if (match("=")) {
        const equals = previous();
        const value = parseAssignment();
        if (value === null) {
          throw new Error(`Missing expression after '='`);
        }
        if (expr instanceof Identifier) {
          return new AssignmentExpression(expr, value);
        }
        if (expr instanceof MemberExpression) {
          return new AssignmentExpression(expr, value);
        }
        error(equals, "Invalid assignment target.");
      }
      Logger.logEnd(`parseAssignment`);
      return expr;
    };
    const parseExpression = () => {
      Logger.logStart(`parseExpression: '${input}'`);
      const result = parseAssignment();
      Logger.logEnd(`parseExpression`);
      return result;
    };
    const parseComparison = () => {
      Logger.logStart(`Parsing comparison operators between expressions`);
      var expr = parseTerm();
      while (match(">", ">=", "<", "<=", "contains", "in")) {
        const operator = previous().value;
        const right = parseTerm();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`parseComparison`);
      return expr;
    };
    return parseExpression();
  }
}

// src/engine/Environment.ts
class Environment {
  values = new Map;
  define(name, value) {
    this.values.set(name, value);
  }
  set(name, value) {
    this.values.set(name, value);
  }
  get(name) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    throw new Error(`Undefined variable name '${name}'`);
  }
  toString() {
    let result = "Environment {";
    if (this.values.size > 0) {
      const entries = Array.from(this.values).map(([key, value]) => `\n    "${key}": ${JSON.stringify(value, null, 4).replace(/\n/g, "\n    ")}`);
      result += entries.join(",") + "\n";
    }
    result += "}";
    return result;
  }
}

// src/engine/Interpreter.ts
class Interpreter {
  environment;
  constructor(environment) {
    this.environment = environment ? environment : new Environment;
  }
  static extractIdentifiers(node) {
    const identifiers = new Set;
    const traverse = (node2) => {
      if (!node2)
        return;
      if (node2 instanceof Identifier) {
        identifiers.add(node2.name);
      } else if (node2 instanceof BinaryExpression || node2 instanceof LogicalExpression || node2 instanceof AssignmentExpression) {
        traverse(node2.left);
        traverse(node2.right);
      } else if (node2 instanceof MemberExpression) {
        traverse(node2.object);
      } else if (node2 instanceof GroupExpression) {
        traverse(node2.expression);
      } else if (node2 instanceof ArrayLiteral) {
        node2.elements.forEach((element) => traverse(element));
      }
    };
    traverse(node);
    return Array.from(identifiers);
  }
  visitArrayLiteral(node) {
    return node.elements.map((element) => this.evaluate(element));
  }
  visitAssignmentExpression(expr) {
    const value = this.evaluate(expr.right);
    if (expr.left instanceof Identifier) {
      this.environment.set(expr.left.name, value);
      return value;
    }
    if (expr.left instanceof MemberExpression) {
      const objectExpr = expr.left.object;
      const propertyExpr = expr.left.property;
      if (!(propertyExpr instanceof Identifier)) {
        throw new Error("Only simple identifiers are supported for property names in assignments.");
      }
      if (objectExpr instanceof Identifier) {
        const objectName = objectExpr.name;
        const object = this.environment.get(objectName);
        if (object && typeof object === "object") {
          object[propertyExpr.name] = value;
          this.environment.set(objectName, object);
          return value;
        } else {
          throw new Error(`Object '${objectName}' not found or not an object`);
        }
      }
    }
  }
  visitMemberExpression(expr) {
    const object = this.evaluate(expr.object);
    if (!(expr.property instanceof Identifier)) {
      throw new Error("Only simple identifiers are supported for property names.");
    }
    const propertyName = expr.property.name;
    if (object && typeof object === "object" && propertyName in object) {
      return object[propertyName];
    }
    throw new Error(`Property '${propertyName}' not found`);
  }
  interpret(expression) {
    const value = this.evaluate(expression);
    return value;
  }
  evaluate(expression) {
    return expression.accept(this);
  }
  visitBinaryExpression(expr) {
    const leftVal = this.evaluate(expr.left);
    const rightVal = this.evaluate(expr.right);
    switch (expr.operator) {
      case "+":
        return leftVal + rightVal;
      case "-":
        return leftVal - rightVal;
      case "*":
        return leftVal * rightVal;
      case "/":
        if (rightVal === 0)
          throw new Error("Division by zero");
        return leftVal / rightVal;
      case ">":
        return leftVal > rightVal;
      case "<":
        return leftVal < rightVal;
      case ">=":
        return leftVal >= rightVal;
      case "<=":
        return leftVal <= rightVal;
      case "==":
        return leftVal == rightVal;
      case "^":
        return Math.pow(leftVal, rightVal);
      case "contains":
        if (!Array.isArray(leftVal)) {
          throw new Error("Operator 'contains' requires an array on the left side");
        }
        return leftVal.includes(rightVal);
      case "in":
        if (!Array.isArray(rightVal)) {
          throw new Error("Operator 'in' requires an array on the right side");
        }
        return rightVal.includes(leftVal);
      default:
        throw new Error(`Unsupported operator '${expr.operator}'`);
    }
  }
  visitBooleanNode(node) {
    return node.value;
  }
  visitGroupExpression(expr) {
    return this.evaluate(expr.expression);
  }
  visitLogicalExpression(expr) {
    const left = this.evaluate(expr.left);
    if (expr.operator === Token.OR) {
      if (left === true)
        return true;
    } else if (expr.operator === Token.AND) {
      if (left === false)
        return false;
    }
    return this.evaluate(expr.right);
  }
  visitNumberNode(node) {
    return node.value;
  }
  visitStringNode(node) {
    return node.value;
  }
  visitUnaryExpression(expr) {
    const right = this.evaluate(expr.operand);
    if (expr.operator == "-")
      return -right;
    if (expr.operator == "!")
      return !right;
  }
  visitIdentifier(node) {
    return this.environment.get(node.name);
  }
}

// src/Question.ts
class Question {
  static currentQuestionNumber = 0;
  index;
  name;
  title;
  description;
  isRequired;
  isVisible;
  type;
  items;
  options;
  options_source;
  visible_when;
  includeOtherOption;
  placeholder;
  detailQuestions;
  constructor(data) {
    this.index = Question.currentQuestionNumber++;
    this.title = data.title;
    this.name = data.name;
    this.description = data.description !== undefined ? data.description : "";
    this.type = data.type;
    this.isRequired = data.isRequired !== undefined ? data.isRequired : false;
    this.isVisible = typeof data.isVisible === "boolean" ? data.isVisible : true;
    this.items = data.items;
    this.options = data.options;
    this.options_source = data.options_source;
    this.visible_when = data.visible_when;
    this.includeOtherOption = data.includeOtherOption;
    this.placeholder = data.placeholder;
    this.detailQuestions = data.detailQuestions;
  }
  addItem(item) {
    this.items?.push(item);
  }
}

// src/SurveyModel.ts
var QUESTION_REFERENCE_REGEX = /{{\s*(.+?)\s*}}/g;

class SurveyModel {
  started = false;
  completed = false;
  surveyTitle;
  surveyDescription;
  questionList;
  currentQuestion;
  responseMap;
  interpreter;
  parser;
  environment;
  originalTitles;
  compiledConditions;
  titleDependencies = new Map;
  visibilityDependencies = new Map;
  constructor(config) {
    console.log("SurveyModel: building for config = ", config);
    this.validateSurveySetup(config);
    this.surveyTitle = config.surveyTitle;
    this.surveyDescription = config.surveyDescription;
    this.questionList = this.initializeQuestions(config.questions);
    this.environment = new Environment;
    this.parser = new Parser;
    this.interpreter = new Interpreter(this.environment);
    this.responseMap = {};
    this.originalTitles = new Map;
    this.compiledConditions = new Map;
    this.initializeDynamicContent();
  }
  static fromJSON(jsonString) {
    let config;
    try {
      config = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON string provided. Details: ${error.message}`);
    }
    return new SurveyModel(config);
  }
  initializeQuestions(questionsData) {
    return questionsData.map((questionData) => new Question(questionData));
  }
  initializeDynamicContent() {
    this.questionList.forEach((question, index) => {
      this.originalTitles.set(question.name, question.title);
      const dependencyList = this.extractTitleDependency(question.title);
      dependencyList.forEach((dependencyName) => {
        let dependencies = this.titleDependencies.get(dependencyName) || [];
        dependencies.push(question);
        this.titleDependencies.set(dependencyName, dependencies);
      });
      question.isVisible = question.visible_when ? false : true;
      if (question.visible_when) {
        const compiledCondition = this.parser.parse(question.visible_when);
        this.compiledConditions.set(question.name, compiledCondition);
        const visibilityDependencyList = Interpreter.extractIdentifiers(compiledCondition);
        visibilityDependencyList.forEach((dependencyName) => {
          let dependencies = this.visibilityDependencies.get(dependencyName) || [];
          dependencies.push(question);
          this.visibilityDependencies.set(dependencyName, dependencies);
        });
      }
    });
  }
  startSurvey() {
    this.started = true;
    this.currentQuestion = this.questionList[0];
    EventEmitter.emit(SURVEY_STARTED);
  }
  completeSurvey() {
    this.completed = true;
  }
  getCurrentQuestion() {
    return this.currentQuestion;
  }
  getDescription() {
    return this.surveyDescription;
  }
  getNumberOfQuestions() {
    return this.questionList.length;
  }
  getQuestions() {
    return this.questionList.slice();
  }
  getResponses() {
    return this.responseMap;
  }
  getTitle() {
    return this.surveyTitle;
  }
  getQuestionByName(questionName) {
    return this.questionList.find((question) => question.name === questionName);
  }
  isCompleted() {
    return this.completed;
  }
  isStarted() {
    return this.started;
  }
  updateResponse(questionName, response) {
    console.log(`SurveyModel.updateResponse: Received Response: '${response}' from Question '${questionName}'`);
    this.responseMap[questionName] = response;
    this.environment.set(questionName, response);
    this.updateDynamicTitles(questionName);
    this.updateVisibility(questionName);
  }
  updateVisibility(updatedQuestionName) {
    const dependentQuestions = this.visibilityDependencies.get(updatedQuestionName);
    if (dependentQuestions && dependentQuestions.length > 0) {
      console.log(`Updating visibility for question: '${updatedQuestionName}'. List of dependent questions: ${dependentQuestions.map((q) => q.name).join(", ")}`);
      dependentQuestions.forEach((question) => {
        if (this.compiledConditions.has(question.name)) {
          const compiledCondition = this.compiledConditions.get(question.name);
          question.isVisible = this.interpreter.interpret(compiledCondition);
        }
      });
    } else {
      console.log(`Updating visibility for question: '${updatedQuestionName}'. No dependent questions found.`);
    }
  }
  updateDynamicTitles(updatedQuestionName) {
    const dependentQuestions = this.titleDependencies.get(updatedQuestionName);
    if (dependentQuestions && dependentQuestions.length > 0) {
      console.log(`Updating dynamic titles for question: '${updatedQuestionName}'. List of dependent questions: ${dependentQuestions.map((q) => q.name).join(", ")}`);
      dependentQuestions.forEach((question) => {
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
  constructNewTitle(template) {
    return template.replace(QUESTION_REFERENCE_REGEX, (_, placeholderName) => {
      return this.responseMap[placeholderName.trim()];
    });
  }
  extractTitleDependency(title) {
    const matches = Array.from(title.matchAll(QUESTION_REFERENCE_REGEX));
    const dependencies = matches.map((match) => {
      const dependency = match[1].trim();
      return dependency;
    });
    return dependencies;
  }
  isFirstQuestion() {
    return this.currentQuestion.index === 0;
  }
  isLastQuestion() {
    return this.currentQuestion.index === this.questionList.length - 1;
  }
  getNextVisibleQuestion() {
    for (let i = this.currentQuestion.index + 1;i < this.questionList.length; i++) {
      if (this.questionList[i].isVisible) {
        this.currentQuestion = this.questionList[i];
        return this.currentQuestion;
      }
    }
    return null;
  }
  getPreviousVisibleQuestion() {
    for (let i = this.currentQuestion.index - 1;i >= 0; i--) {
      if (this.questionList[i].isVisible) {
        this.currentQuestion = this.questionList[i];
        return this.currentQuestion;
      }
    }
    return null;
  }
  validateSurveySetup(config) {
    if (!config)
      throw new Error("Config object is required");
    if (typeof config.surveyTitle !== "string")
      throw new Error(`Invalid or missing surveyTitle: ${config.surveyTitle}`);
    if (typeof config.surveyDescription !== "string")
      throw new Error("Invalid or missing surveyDescription");
    if (!Array.isArray(config.questions))
      throw new Error("Invalid or missing questions array");
    const allowedTypes = ["yes-no", "select", "single-choice", "followup", "multi-choice", "ranking", "multi-line-text", "single-line-text"];
    config.questions.forEach((question, index) => {
      if (typeof question !== "object")
        throw new Error(`Question at index ${index} is not an object`);
      if (typeof question.name !== "string" || question.name.trim() === "") {
        throw new Error(`Question at index ${index} is missing a valid name`);
      }
      if (typeof question.title !== "string" || question.title.trim() === "") {
        throw new Error(`Question at index ${index} is missing a valid title`);
      }
      if (!allowedTypes.includes(question.type)) {
        const allowedTypesString = allowedTypes.join(", ");
        throw new Error(`Question type "${question.type}" at index ${index} is not allowed. Allowed types are: ${allowedTypesString}`);
      }
      if ("isRequired" in question && typeof question.isRequired !== "boolean")
        throw new Error(`"isRequired" must be boolean at index ${index}`);
      if (question.options && !Array.isArray(question.options))
        throw new Error(`"options" must be an array at index ${index}`);
      if (question.items && !Array.isArray(question.items))
        throw new Error(`"items" must be an array at index ${index}`);
      if (question.options_source && typeof question.options_source !== "string")
        throw new Error(`"options_source" must be a string URL at index ${index}`);
    });
  }
  getStateDetails() {
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

// src/SurveyPage.ts
var BUTTON_CLASS = "survey-button";

class SurveyPage {
  pageContainer;
  title;
  content;
  buttonContainer;
  buttons;
  constructor(pageId) {
    this.pageContainer = document.createElement("div");
    this.pageContainer.className = "survey-page";
    this.pageContainer.id = pageId;
    this.title = document.createElement("h2");
    this.title.className = "survey-page-title";
    this.content = document.createElement("p");
    this.content.className = "survey-page-content";
    this.buttonContainer = document.createElement("div");
    this.buttonContainer.className = "button-container";
    this.pageContainer.appendChild(this.title);
    this.pageContainer.appendChild(this.content);
    this.pageContainer.appendChild(this.buttonContainer);
    this.buttons = new Map;
  }
  setTitle(text) {
    this.title.textContent = text;
  }
  setContent(html) {
    this.content.innerHTML = html;
  }
  addButton(id, text, onClick) {
    const button = document.createElement("button");
    button.id = id;
    button.textContent = text;
    button.className = BUTTON_CLASS;
    button.addEventListener("click", onClick);
    this.buttonContainer.appendChild(button);
    this.buttons.set(id, button);
    button.style.display = "none";
  }
  showButton(id) {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "block";
    }
  }
  hideButton(id) {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "none";
    }
  }
  show() {
    this.pageContainer.style.display = "block";
  }
  hide() {
    this.pageContainer.style.display = "none";
  }
}

// src/SurveyBuilder.ts
class SurveyBuilder {
  VERSION = "0.05.01";
  surveyModel;
  surveyContainer;
  landingPage;
  questionsPage;
  thankYouPage;
  buttonsContainer;
  buttons = new Map;
  questionComponents;
  completeCallback;
  constructor(config, containerId) {
    console.log("SurveyBuilder: " + this.VERSION);
    this.setUpSurveyModel(config);
    this.questionComponents = [];
    EventEmitter.on(TITLE_UPDATED, (index, newTitle) => this.handleTitleUpdate(index, newTitle));
    EventEmitter.on(ANSWER_SELECTED, (response) => this.handleResponse(response));
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      throw new Error(`SurveyBuilder: Element with ID '${containerId}' not found.`);
    }
    this.surveyContainer = containerElement;
    this.landingPage = new SurveyPage("landing-page");
    this.landingPage.setTitle(this.surveyModel.getTitle());
    this.landingPage.setContent(this.surveyModel.getDescription());
    this.surveyContainer.appendChild(this.landingPage.pageContainer);
    this.questionsPage = new SurveyPage("survey-questions");
    this.questionsPage.hide();
    this.surveyContainer.appendChild(this.questionsPage.pageContainer);
    this.thankYouPage = new SurveyPage("thank-you-page");
    this.thankYouPage.setTitle("Thank you for your input");
    this.thankYouPage.setContent(`<p style="text-align: center; margin: 20px; font-size: 1.3rem;">
            You can safely close this page.</p>
            <p style="text-align: center; margin: 20px; font-size: 1.1rem;">
            If you wish to discover how ServiceNow Creator Workflows 
            can streamline your business processes and enhance automation,  
            please follow this link to learn more about 
            <a href=http://URL_TO_SERVICE_NOW_CREATOR_WORKFLOWS>ServiceNow Creator Workflows</a>.</p>`);
    this.thankYouPage.hide();
    this.surveyContainer.appendChild(this.thankYouPage.pageContainer);
    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.className = "survey-nav";
    this.buttonsContainer.role = "navigation";
    this.surveyContainer.appendChild(this.buttonsContainer);
    this.buttons.set("start", this.createButton("Start Survey", "survey-button", () => this.startSurvey(), "block"));
    this.buttons.set("prev", this.createButton("Previous", "survey-button", () => this.showPreviousQuestion(), "none"));
    this.buttons.set("next", this.createButton("Next", "survey-button", () => this.showNextQuestion(), "none"));
    this.buttons.set("complete", this.createButton("Complete", "survey-button", () => this.finishSurvey(), "none"));
  }
  setUpSurveyModel(config) {
    this.surveyModel = new SurveyModel(config);
    if (typeof config === "string") {
      try {
        this.surveyModel = SurveyModel.fromJSON(config);
      } catch (error) {
        console.error("Failed to initialize from configuration:", error.message);
        throw error;
      }
    } else {
      this.surveyModel = new SurveyModel(config);
    }
  }
  displayPage(page) {
    this.surveyContainer.innerHTML = "";
    this.surveyContainer.appendChild(page.pageContainer);
  }
  displayThankYouPage() {
    this.questionsPage.hide();
    this.thankYouPage.show();
  }
  showButton(id) {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "block";
    }
  }
  hideButton(id) {
    const button = this.buttons.get(id);
    if (button) {
      button.style.display = "none";
    }
  }
  updateButtonsVisibility() {
    console.log(`Updating buttons for current question`);
    console.log(this.surveyModel.getStateDetails());
    if (!this.surveyModel.isStarted()) {
      this.showButton("start");
      this.hideButton("prev");
      this.hideButton("next");
      this.hideButton("complete");
      return;
    } else {
      this.hideButton("start");
    }
    this.showButton("prev");
    this.showButton("next");
    if (this.surveyModel.isFirstQuestion()) {
      this.hideButton("prev");
    }
    if (this.surveyModel.isLastQuestion()) {
      this.hideButton("next");
      this.showButton("complete");
    }
    if (this.surveyModel.isCompleted()) {
      this.buttonsContainer.style.display = "none";
    }
  }
  startSurvey() {
    console.log(`START SURVEY`);
    this.surveyModel.startSurvey();
    this.landingPage.hide();
    this.questionsPage.show();
    this.initializeQuestions();
    this.showQuestion(this.surveyModel.getCurrentQuestion());
  }
  initializeQuestions() {
    this.surveyModel.getQuestions().forEach((question, index) => {
      const questionComponent = this.createQuestionComponent(question, index);
      questionComponent.hide();
      this.addQuestionElement(questionComponent.getQuestionDiv());
      this.questionComponents.push(questionComponent);
    });
  }
  createQuestionComponent(question, index) {
    switch (question.type) {
      case "ranking":
        return new RankingQuestion(question, index);
      case "single-line-text":
        return new SingleLineTextQuestion(question, index);
      case "multi-line-text":
        return new MultiLineTextQuestion(question, index);
      case "yes-no":
        return new YesNoQuestion2(question, index);
      case "YesNoQuestion2":
        return new YesNoQuestion2(question, index);
      case "single-choice":
        return new OneChoice(question, index);
      case "multi-choice":
        return new MultiChoice(question, index);
      case "select":
        return new SelectQuestion(question, index);
      case "followup":
        return new FollowUpQuestion(question, index);
      default:
        console.error("Unsupported question type: " + question.type);
    }
    return null;
  }
  showNextQuestion() {
    const nextQuestion = this.surveyModel.getNextVisibleQuestion();
    console.log(`showNextQuestion: ${nextQuestion?.title}`);
    if (nextQuestion) {
      this.showQuestion(nextQuestion);
    } else {
      console.log("No more questions available or end of survey.");
    }
  }
  showPreviousQuestion() {
    const prevQuestion = this.surveyModel.getPreviousVisibleQuestion();
    if (prevQuestion) {
      this.showQuestion(prevQuestion);
    } else {
      console.log("This is the first question, no previous question available.");
    }
  }
  showQuestion(question) {
    console.log("showQuestion: " + question.name);
    console.log("showQuestion: ", question);
    console.log("showQuestion: ", this.questionComponents);
    this.questionComponents.forEach((component) => component.hide());
    this.questionComponents[question.index].show();
    this.updateButtonsVisibility();
  }
  addQuestionElement(questionDiv) {
    this.questionsPage.pageContainer.appendChild(questionDiv);
  }
  handleResponse(response) {
    console.log("SurveyBuilder.handleResponse: ", response);
    this.surveyModel.updateResponse(response.questionName, response.response);
  }
  handleTitleUpdate(index, newTitle) {
    console.log("SurveyBuilder.handleTitleUpdate : " + newTitle);
    const questionComponent = this.questionComponents.at(index);
    questionComponent.setTitle(newTitle);
  }
  createButton(text, className, onClick, displayStyle) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    button.addEventListener("click", onClick);
    button.style.display = displayStyle;
    this.buttonsContainer.appendChild(button);
    return button;
  }
  getQuestionElement(index) {
    let allQuestionElements = this.questionsPage.pageContainer.getElementsByClassName(".question");
    console.log("allQuestionElements", allQuestionElements);
    console.log(allQuestionElements.length);
    return this.questionsPage.pageContainer.querySelector(`.question[data-index="${index}"]`);
  }
  finishSurvey() {
    this.surveyModel.completeSurvey();
    this.updateButtonsVisibility();
    const responses = this.surveyModel.getResponses();
    console.log("SurveyBuilder.finishSurvey: ", responses);
    if (this.completeCallback) {
      this.completeCallback(responses);
    }
    this.displayThankYouPage();
  }
  onComplete(callbackFunction) {
    this.completeCallback = callbackFunction;
  }
}
window.SurveyBuilder = SurveyBuilder;
