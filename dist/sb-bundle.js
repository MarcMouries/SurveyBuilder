function X(E){const z=document.createElement("h3");z.className="question-title";const H=document.createElement("span");return H.className="question-number",H.textContent=`Q${this.questionNumber}. `,z.append(E),this.questionNumber++,z}function w(E,z){const H=document.createElement("div");H.className="question yes-no-question",H.dataset.index=z.toString();const J=X(E.title);H.appendChild(J);const G=document.createElement("div");G.className="yes-no";const K=f("Yes",E.name,`${E.name}-yes`),P=A(`${E.name}-yes`,"Yes");G.appendChild(K),G.appendChild(P);const W=f("No",E.name,`${E.name}-no`),Z=A(`${E.name}-no`,"No");G.appendChild(W),G.appendChild(Z),H.appendChild(G),this.surveyContainer.appendChild(H),G.addEventListener("change",(_)=>{this.setResponse(E.name,_.target.value),this.evaluateVisibilityConditions()})}var f=function(E,z,H){const J=document.createElement("input");return J.type="radio",J.id=H,J.name=z,J.value=E,J},A=function(E,z){const H=document.createElement("label");return H.htmlFor=E,H.textContent=z,H};class M extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"}),this.build(),this.bindEvents()}build(){this.shadowRoot.innerHTML=`
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
        `,this.inputValue=this.shadowRoot.querySelector(".input-value input"),this.modalContainer=this.shadowRoot.querySelector(".modal-container"),this.filterInput=this.shadowRoot.querySelector(".header-filter-container input"),this.clearButton=this.shadowRoot.querySelector(".clear-icon"),this.optionsContainer=this.shadowRoot.querySelector(".main-options-container"),this.cancelButton=this.shadowRoot.querySelector(".button.cancel")}bindEvents(){this.inputValue.addEventListener("focus",()=>this.showModal()),this.cancelButton.addEventListener("click",()=>this.hideModal()),this.filterInput.addEventListener("input",(E)=>this.handleFilterInput(E.target.value)),this.clearButton.addEventListener("click",()=>{this.filterInput.value="",this.optionsContainer.innerHTML="",this.filterInput.focus()})}showModal(){this.inputValue.style.display="none",this.modalContainer.style.display="flex",this.filterInput.focus()}hideModal(){this.modalContainer.style.display="none",this.inputValue.style.display="block"}setConfig(E){this._config=E}handleFilterInput(E){if(this.optionsContainer.innerHTML="",E.length>=2)this.fetchOptions(E).then((z)=>{z.forEach((H)=>{const J=document.createElement("div");J.textContent=H,J.classList.add("option"),J.addEventListener("click",()=>this.selectOption(H)),this.optionsContainer.appendChild(J)})})}fetchOptions(E){return new Promise((z,H)=>{if(this._config.dynamic_options_service){const J=`${this._config.dynamic_options_service}?query=${encodeURIComponent(E)}`;fetch(J).then((G)=>{if(!G.ok)throw new Error("Network response was not ok");return G.json()}).then((G)=>{console.log("data received : ",G);const K=G.result.map((P)=>P.name);z(K)}).catch((G)=>{console.error("Error fetching dynamic options:",G),H(G)})}else if(this._config.static_options){const J=this._config.static_options.filter((G)=>G.toLowerCase().includes(E.toLowerCase()));z(J)}else z([])})}selectOption(E){this.inputValue.value=E,this.hideModal()}onInput(E){const z=E.target.value.trim();if(this.clearButton.style.visibility=z?"visible":"hidden",z.length>=2)this.updateOptions(z),this.optionsContainer.style.display="block";else this.clearOptions()}onClear(){this.inputField.value="",this.clearButton.style.visibility="hidden",this.hideOptions(),this.dispatchEvent(new CustomEvent("clear"))}clearOptions(){this.optionsContainer.innerHTML="",this.optionsContainer.style.display="none"}}customElements.define("search-input",M);function U(E,z){const H=document.createElement("div");H.className="question select-question",H.dataset.index=z;const J=X(E.title);H.appendChild(J);const G=document.createElement("search-input");H.appendChild(G),this.surveyContainer.appendChild(H);const K={static_options:E.options||[],dynamic_options_service:E.options_source};G.setConfig(K),G.addEventListener("optionSelected",(P)=>{const W=P.detail.option;this.setResponse(E.name,W)})}function Y(E,z){const H=document.createElement("div");H.className="question",H.dataset.index=z.toString();const J=X(E.title);H.appendChild(J);const G=document.createElement("input");G.type="text",G.name=E.name,G.required=E.isRequired,G.className="single-line-text-input",H.appendChild(G),this.surveyContainer.appendChild(H),G.addEventListener("input",()=>{this.setResponse(E.name,G.value)})}function B(E,z){const H=document.createElement("div");H.className="question",H.dataset.index=z.toString();const J=X(E.title);H.appendChild(J);const G=document.createElement("textarea");G.name=E.name,G.required=E.isRequired,G.className="multi-line-text-input",G.placeholder="Enter your comments here...",H.appendChild(G),this.surveyContainer.appendChild(H),G.addEventListener("input",()=>{this.setResponse(E.name,G.value)})}function R(E,z){const H=document.createElement("div");H.className="question",H.dataset.index=z.toString();const J=X(E.title);H.appendChild(J);const G=document.createElement("div");G.className=`ranking-list ${E.name}`,E.choices.forEach((K,P)=>{const W=document.createElement("div");W.setAttribute("draggable",!0),W.className="ranking-item";const Z=document.createElement("div");Z.className="drag-icon",Z.textContent="\u2261",W.appendChild(Z);const _=document.createElement("div");_.className="index",_.textContent=P+1,W.appendChild(_);const $=document.createElement("div");$.className="choice-text",$.textContent=K,W.appendChild($),G.appendChild(W)}),H.appendChild(G),this.surveyContainer.appendChild(H)}class S{constructor(E,z){this.json=E,this.surveyContainer=document.getElementById(z),this.questionNumber=1,this.responses={},this.createSurvey()}createSurvey(){this.createSurveyTitle(this.json.surveyTitle,this.surveyContainer),this.createSurveyDescription(this.json.surveyDescription,this.surveyContainer),this.json.questions.forEach((E,z)=>{switch(E.type){case"ranking":R.call(this,E,z);break;case"single-line-text":Y.call(this,E,z);break;case"multi-line-text":B.call(this,E,z);break;case"yes-no":w.call(this,E,z);break;case"select":U.call(this,E,z);break;default:console.error("Unsupported question type: "+E.type)}}),this.addDragAndDrop(),this.createCompleteButton(this.surveyContainer)}setResponse(E,z){this.responses[E]=z}evaluateVisibilityConditions(){this.json.questions.forEach((E,z)=>{const H=this.surveyContainer.querySelector(`.question[data-index="${z}"]`);if(E.visible_when){const J=E.visible_when.split("=").map((W)=>W.trim()),G=J[0],K=J[1].toLowerCase();if((this.responses[G]?this.responses[G].toLowerCase():null)===K)H.style.display="block";else H.style.display="none"}})}createSurveyTitle(E,z){const H=document.createElement("h3");H.className="survey-title",H.textContent=E,z.appendChild(H)}createSurveyDescription(E,z){const H=document.createElement("p");H.className="survey-description",H.innerHTML=E,z.appendChild(H)}addDragAndDrop(){document.querySelectorAll(".ranking-list").forEach((z)=>{z.addEventListener("dragover",(H)=>{H.preventDefault();const J=document.querySelector(".dragging"),G=this.getDragAfterElement(z,H.clientY);if(G)z.insertBefore(J,G);else if(J)z.appendChild(J);this.updateDraggedItemIndex(J,z)}),z.addEventListener("dragstart",(H)=>{H.target.classList.add("dragging")}),z.addEventListener("dragend",(H)=>{H.target.classList.remove("dragging"),this.updateAllIndexes(z)}),z.addEventListener("drop",(H)=>{H.preventDefault(),this.updateAllIndexes(z)})})}createCompleteButton(E){const z=document.createElement("div");z.className="button-container";const H=document.createElement("button");H.className="complete-button",H.textContent="Complete",H.addEventListener("click",()=>this.finishSurvey()),z.appendChild(H),E.appendChild(z)}finishSurvey(){const E=this.getResponses();if(this.completeCallback)this.completeCallback(this.responses);this.displayThankYouPage()}getResponses(){const E={responses:[]};return this.json.questions.forEach((z)=>{const H={questionName:z.name,questionTitle:z.title,answer:null};switch(z.type){case"single-line-text":const J=this.surveyContainer.querySelector(`input[name="${z.name}"]`);H.answer=J?J.value:"";break;case"ranking":const G=Array.from(this.surveyContainer.querySelectorAll(`.${z.name} .ranking-item`));if(console.log(G),G.length)H.answer=G.map((K,P)=>({rank:P+1,text:K.querySelector(".choice-text").textContent.trim()}));break}E.responses.push(H)}),E}onComplete(E){this.completeCallback=E}displayThankYouPage(){this.surveyContainer.innerHTML="";const E=document.createElement("div");E.className="thank-you-container",E.innerHTML=`
        <h2>Thank you for your input.</h2>
        <p>You can close this page. </p>
        <p>Learn more about <a href="https://servicenow.com">Creator Workflows</a>.</>
        <div class="button-container">
            <button class="secondary-button">Prev</button>
            <button class="primary-button">Done</button>
        </div>
    `,this.surveyContainer.appendChild(E)}getDragAfterElement(E,z){return[...E.querySelectorAll(".ranking-item:not(.dragging)")].reduce((J,G)=>{const K=G.getBoundingClientRect(),P=z-K.top-K.height/2;if(P<0&&P>J.offset)return{offset:P,element:G};else return J},{offset:Number.NEGATIVE_INFINITY}).element}updateDraggedItemIndex(E,z){let H=0;Array.from(z.children).forEach((G,K)=>{if(G!==E&&G.getBoundingClientRect().top<E.getBoundingClientRect().bottom)H=K+1});const J=E.querySelector(".index");if(J)J.textContent=H+1}updateAllIndexes(E){E.querySelectorAll(".ranking-item").forEach((H,J)=>{const G=H.querySelector(".index");if(G)G.textContent=J+1})}}window.SurveyBuilder=S;
