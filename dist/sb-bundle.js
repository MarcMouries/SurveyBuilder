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
function createYesNoQuestion(element2, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question yes-no-question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element2.title);
  questionDiv.appendChild(title);
  const yesNoField = document.createElement("div");
  yesNoField.className = "yes-no";
  const yesRadio = createRadio("Yes", element2.name, `${element2.name}-yes`);
  const yesLabel = createLabel(`${element2.name}-yes`, "Yes");
  yesNoField.appendChild(yesRadio);
  yesNoField.appendChild(yesLabel);
  const noRadio = createRadio("No", element2.name, `${element2.name}-no`);
  const noLabel = createLabel(`${element2.name}-no`, "No");
  yesNoField.appendChild(noRadio);
  yesNoField.appendChild(noLabel);
  questionDiv.appendChild(yesNoField);
  this.surveyContainer.appendChild(questionDiv);
  yesNoField.addEventListener("change", (event) => {
    this.setResponse(element2.name, event.target.value);
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
// src/question-types/select.js
function createSelectQuestion(element2, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question custom-select-container";
  questionDiv.dataset.index = index;
  const searchInput = document.createElement("input");
  searchInput.className = "custom-select-search";
  searchInput.placeholder = "Type to search...";
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "custom-options-container";
  questionDiv.appendChild(searchInput);
  questionDiv.appendChild(optionsContainer);
  this.surveyContainer.appendChild(questionDiv);
  searchInput.addEventListener("focus", () => {
    optionsContainer.style.display = "block";
    if (element2.options) {
      populateOptions(optionsContainer, element2.options);
    }
  });
  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.trim();
    if (searchText.length >= 2) {
      if (element2.options_source) {
        fetchAndUpdateOptions(element2.options_source, searchText, optionsContainer);
      } else if (element2.options) {
        filterOptions(searchText, element2.options, optionsContainer);
      }
    } else {
      element2.options ? populateOptions(optionsContainer, element2.options) : optionsContainer.innerHTML = "";
    }
  });
  document.addEventListener("click", (event) => {
    if (!questionDiv.contains(event.target)) {
      optionsContainer.style.display = "none";
    }
  });
}
var filterOptions = function(searchText, options, container) {
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()));
  populateOptions(container, filteredOptions);
};
var populateOptions = function(container, options) {
  container.innerHTML = "";
  options.forEach((optionValue) => {
    const optionDiv = document.createElement("div");
    optionDiv.textContent = optionValue;
    optionDiv.className = "custom-option";
    optionDiv.addEventListener("click", () => {
      this.setResponse(element.name, optionValue);
      container.style.display = "none";
    });
    container.appendChild(optionDiv);
  });
};
var fetchAndUpdateOptions = function(url, query, dataList) {
  if (!url || !dataList)
    return;
  fetch(`${url}${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => {
    dataList.innerHTML = "";
    data.result.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.abbreviation;
      dataList.appendChild(option);
    });
  }).catch((error) => console.error("Error fetching options:", error));
};
// src/question-types/single-line.js
function createSingleLineTextQuestion(element2, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element2.title);
  questionDiv.appendChild(title);
  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.name = element2.name;
  inputField.required = element2.isRequired;
  inputField.className = "single-line-text-input";
  questionDiv.appendChild(inputField);
  this.surveyContainer.appendChild(questionDiv);
  inputField.addEventListener("input", () => {
    this.setResponse(element2.name, inputField.value);
  });
}
// src/question-types/multi-line.js
function createMultiLineTextQuestion(element2, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element2.title);
  questionDiv.appendChild(title);
  const textArea = document.createElement("textarea");
  textArea.name = element2.name;
  textArea.required = element2.isRequired;
  textArea.className = "multi-line-text-input";
  textArea.placeholder = "Enter your comments here...";
  questionDiv.appendChild(textArea);
  this.surveyContainer.appendChild(questionDiv);
  textArea.addEventListener("input", () => {
    this.setResponse(element2.name, textArea.value);
  });
}

// src/question-types/index.js
function createRankingQuestion(element2, index) {
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.dataset.index = index.toString();
  const title = createQuestionTitle(element2.title);
  questionDiv.appendChild(title);
  const rankingList = document.createElement("div");
  rankingList.className = `ranking-list ${element2.name}`;
  element2.choices.forEach((choice, index2) => {
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
    this.json.questions.forEach((element2, index) => {
      switch (element2.type) {
        case "ranking":
          createRankingQuestion.call(this, element2, index);
          break;
        case "single-line-text":
          createSingleLineTextQuestion.call(this, element2, index);
          break;
        case "multi-line-text":
          createMultiLineTextQuestion.call(this, element2, index);
          break;
        case "yes-no":
          createYesNoQuestion.call(this, element2, index);
          break;
        case "select":
          createSelectQuestion.call(this, element2, index);
          break;
        default:
          console.error("Unsupported question type: " + element2.type);
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
    this.json.questions.forEach((element2) => {
      const questionData = {
        questionName: element2.name,
        questionTitle: element2.title,
        answer: null
      };
      switch (element2.type) {
        case "single-line-text":
          const textInput = this.surveyContainer.querySelector(`input[name="${element2.name}"]`);
          questionData.answer = textInput ? textInput.value : "";
          break;
        case "ranking":
          const rankingItems = Array.from(this.surveyContainer.querySelectorAll(`.${element2.name} .ranking-item`));
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
