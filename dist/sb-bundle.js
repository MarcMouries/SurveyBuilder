// src/question-types/common.js
function createQuestionTitle(questionText) {
  const title = document.createElement("h3");
  title.className = "question-title";
  const questionNumberSpan = document.createElement("span");
  questionNumberSpan.className = "question-number";
  questionNumberSpan.textContent = `Q${this.questionNumber}. `;
  title.append(questionText);
  this.questionNumber++;
  return title;
}

// src/question-types/yes-no.js
function createYesNoQuestion(element, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question yes-no-question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element.title);
  questionDiv.appendChild(title);
  const yesNoField = document.createElement("div");
  yesNoField.className = "yes-no";
  const yesRadio = createRadio("Yes", element.name, `${element.name}-yes`);
  const yesLabel = createLabel(`${element.name}-yes`, "Yes");
  yesNoField.appendChild(yesRadio);
  yesNoField.appendChild(yesLabel);
  const noRadio = createRadio("No", element.name, `${element.name}-no`);
  const noLabel = createLabel(`${element.name}-no`, "No");
  yesNoField.appendChild(noRadio);
  yesNoField.appendChild(noLabel);
  questionDiv.appendChild(yesNoField);
  this.surveyContainer.appendChild(questionDiv);
  yesNoField.addEventListener("change", (event) => {
    this.setResponse(element.name, event.target.value);
    this.evaluateVisibilityConditions();
  });
}
var createRadio = function(value, name, id) {
  const radioInput = document.createElement("input");
  radioInput.type = "radio";
  radioInput.id = id;
  radioInput.name = name;
  radioInput.value = value;
  return radioInput;
};
var createLabel = function(forId, text) {
  const label = document.createElement("label");
  label.htmlFor = forId;
  label.textContent = text;
  return label;
};
// src/question-types/search-input.js
class SearchInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.build();
    this.bindEvents();
  }
  build() {
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
          optionDiv.addEventListener("click", () => this.selectOption(option));
          this.optionsContainer.appendChild(optionDiv);
        });
      });
    }
  }
  fetchOptions(searchText) {
    return new Promise((resolve, reject) => {
      if (this._config.dynamic_options_service) {
        const serviceUrl = `${this._config.dynamic_options_service}?query=${encodeURIComponent(searchText)}`;
        fetch(serviceUrl).then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        }).then((data) => {
          const options = data.map((item) => item.name);
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
  selectOption(option) {
    this.inputValue.value = option;
    this.hideModal();
  }
  onInput(event) {
    const searchText = event.target.value.trim();
    this.clearButton.style.visibility = searchText ? "visible" : "hidden";
    if (searchText.length >= 2) {
      this.updateOptions(searchText);
      this.optionsContainer.style.display = "block";
    } else {
      this.clearOptions();
    }
  }
  onClear() {
    this.inputField.value = "";
    this.clearButton.style.visibility = "hidden";
    this.hideOptions();
    this.dispatchEvent(new CustomEvent("clear"));
  }
  clearOptions() {
    this.optionsContainer.innerHTML = "";
    this.optionsContainer.style.display = "none";
  }
}
customElements.define("search-input", SearchInput);

// src/question-types/select.js
function createSelectQuestion(element, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question select-question";
  questionDiv.dataset.index = index;
  const title = createQuestionTitle(element.title);
  questionDiv.appendChild(title);
  const searchComponent = document.createElement("search-input");
  questionDiv.appendChild(searchComponent);
  this.surveyContainer.appendChild(questionDiv);
  const config = {
    static_options: element.options || [],
    dynamic_options_service: element.options_source
  };
  searchComponent.setConfig(config);
  searchComponent.addEventListener("optionSelected", (event) => {
    const selectedOption = event.detail.option;
    this.setResponse(element.name, selectedOption);
  });
}
// src/question-types/single-line.js
function createSingleLineTextQuestion(element, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element.title);
  questionDiv.appendChild(title);
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = element.name;
  inputField.required = element.isRequired;
  inputField.className = "single-line-text-input";
  questionDiv.appendChild(inputField);
  this.surveyContainer.appendChild(questionDiv);
  inputField.addEventListener("input", () => {
    this.setResponse(element.name, inputField.value);
  });
}
// src/question-types/multi-line.js
function createMultiLineTextQuestion(element, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element.title);
  questionDiv.appendChild(title);
  const textArea = document.createElement("textarea");
  textArea.name = element.name;
  textArea.required = element.isRequired;
  textArea.className = "multi-line-text-input";
  textArea.placeholder = "Enter your comments here...";
  questionDiv.appendChild(textArea);
  this.surveyContainer.appendChild(questionDiv);
  textArea.addEventListener("input", () => {
    this.setResponse(element.name, textArea.value);
  });
}

// src/question-types/index.js
function createRankingQuestion(element, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element.title);
  questionDiv.appendChild(title);
  const rankingList = document.createElement("div");
  rankingList.className = `ranking-list ${element.name}`;
  element.choices.forEach((choice, index2) => {
    const listItem = document.createElement("div");
    listItem.setAttribute("draggable", true);
    listItem.className = "ranking-item";
    const dragIcon = document.createElement("div");
    dragIcon.className = "drag-icon";
    dragIcon.textContent = "\u2261";
    listItem.appendChild(dragIcon);
    const indexDiv = document.createElement("div");
    indexDiv.className = "index";
    indexDiv.textContent = index2 + 1;
    listItem.appendChild(indexDiv);
    const choiceText = document.createElement("div");
    choiceText.className = "choice-text";
    choiceText.textContent = choice;
    listItem.appendChild(choiceText);
    rankingList.appendChild(listItem);
  });
  questionDiv.appendChild(rankingList);
  this.surveyContainer.appendChild(questionDiv);
}

// src/surveyBuilder.js
class SurveyBuilder {
  constructor(json, containerId) {
    this.json = json;
    this.surveyContainer = document.getElementById(containerId);
    this.questionNumber = 1;
    this.responses = {};
    this.createSurvey();
  }
  createSurvey() {
    this.createSurveyTitle(this.json.surveyTitle, this.surveyContainer);
    this.createSurveyDescription(this.json.surveyDescription, this.surveyContainer);
    this.json.questions.forEach((element, index) => {
      switch (element.type) {
        case "ranking":
          createRankingQuestion.call(this, element, index);
          break;
        case "single-line-text":
          createSingleLineTextQuestion.call(this, element, index);
          break;
        case "multi-line-text":
          createMultiLineTextQuestion.call(this, element, index);
          break;
        case "yes-no":
          createYesNoQuestion.call(this, element, index);
          break;
        case "select":
          createSelectQuestion.call(this, element, index);
          break;
        default:
          console.error("Unsupported question type: " + element.type);
      }
    });
    this.addDragAndDrop();
    this.createCompleteButton(this.surveyContainer);
  }
  setResponse(questionName, response) {
    this.responses[questionName] = response;
  }
  evaluateVisibilityConditions() {
    this.json.questions.forEach((question, index) => {
      const questionElement = this.surveyContainer.querySelector(`.question[data-index="${index}"]`);
      if (question.visible_when) {
        const condition = question.visible_when.split("=").map((s) => s.trim());
        const questionToCheck = condition[0];
        const expectedAnswer = condition[1].toLowerCase();
        const actualAnswer = this.responses[questionToCheck] ? this.responses[questionToCheck].toLowerCase() : null;
        if (actualAnswer === expectedAnswer) {
          questionElement.style.display = "block";
        } else {
          questionElement.style.display = "none";
        }
      }
    });
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
  addDragAndDrop() {
    const lists = document.querySelectorAll(".ranking-list");
    lists.forEach((list) => {
      list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggable = document.querySelector(".dragging");
        const afterElement = this.getDragAfterElement(list, e.clientY);
        if (afterElement) {
          list.insertBefore(draggable, afterElement);
        } else if (draggable) {
          list.appendChild(draggable);
        }
        this.updateDraggedItemIndex(draggable, list);
      });
      list.addEventListener("dragstart", (e) => {
        e.target.classList.add("dragging");
      });
      list.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
        this.updateAllIndexes(list);
      });
      list.addEventListener("drop", (e) => {
        e.preventDefault();
        this.updateAllIndexes(list);
      });
    });
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
    this.json.questions.forEach((element) => {
      const questionData = {
        questionName: element.name,
        questionTitle: element.title,
        answer: null
      };
      switch (element.type) {
        case "single-line-text":
          const textInput = this.surveyContainer.querySelector(`input[name="${element.name}"]`);
          questionData.answer = textInput ? textInput.value : "";
          break;
        case "ranking":
          const rankingItems = Array.from(this.surveyContainer.querySelectorAll(`.${element.name} .ranking-item`));
          console.log(rankingItems);
          if (rankingItems.length) {
            questionData.answer = rankingItems.map((item, idx) => ({
              rank: idx + 1,
              text: item.querySelector(".choice-text").textContent.trim()
            }));
          }
          break;
      }
      surveyData.responses.push(questionData);
    });
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
  getDragAfterElement(list, y) {
    const draggableElements = [...list.querySelectorAll(".ranking-item:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
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
    const indexDiv = draggedItem.querySelector(".index");
    if (indexDiv) {
      indexDiv.textContent = newIndex + 1;
    }
  }
  updateAllIndexes(list) {
    const items = list.querySelectorAll(".ranking-item");
    items.forEach((item, index) => {
      const indexDiv = item.querySelector(".index");
      if (indexDiv) {
        indexDiv.textContent = index + 1;
      }
    });
  }
}
window.SurveyBuilder = SurveyBuilder;
