function W(E){const w=document.createElement("h3");w.className="question-title";const H=document.createElement("span");return H.className="question-number",H.textContent=`Q${this.questionNumber}. `,w.append(E),this.questionNumber++,w}function $(E,w){const H=document.createElement("div");H.className="question yes-no-question",H.dataset.index=w.toString();const G=W(E.title);H.appendChild(G);const z=document.createElement("div");z.className="yes-no";const J=R("Yes",E.name,`${E.name}-yes`),K=A(`${E.name}-yes`,"Yes");z.appendChild(J),z.appendChild(K);const P=R("No",E.name,`${E.name}-no`),X=A(`${E.name}-no`,"No");z.appendChild(P),z.appendChild(X),H.appendChild(z),this.surveyContainer.appendChild(H),z.addEventListener("change",(Z)=>{this.setResponse(E.name,Z.target.value),this.evaluateVisibilityConditions()})}var R=function(E,w,H){const G=document.createElement("input");return G.type="radio",G.id=H,G.name=w,G.value=E,G},A=function(E,w){const H=document.createElement("label");return H.htmlFor=E,H.textContent=w,H};class M extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"}),this.build(),this.bindEvents()}build(){this.shadowRoot.innerHTML=`
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
        `,this.inputValue=this.shadowRoot.querySelector(".input-value input"),this.modalContainer=this.shadowRoot.querySelector(".modal-container"),this.filterInput=this.shadowRoot.querySelector(".header-filter-container input"),this.clearButton=this.shadowRoot.querySelector(".clear-icon"),this.optionsContainer=this.shadowRoot.querySelector(".main-options-container"),this.cancelButton=this.shadowRoot.querySelector(".button.cancel")}bindEvents(){this.inputValue.addEventListener("focus",()=>this.showModal()),this.cancelButton.addEventListener("click",()=>this.hideModal()),this.filterInput.addEventListener("input",(E)=>this.handleFilterInput(E.target.value)),this.clearButton.addEventListener("click",()=>{this.filterInput.value="",this.optionsContainer.innerHTML="",this.filterInput.focus()})}showModal(){this.inputValue.style.display="none",this.modalContainer.style.display="flex",this.filterInput.focus()}hideModal(){this.modalContainer.style.display="none",this.inputValue.style.display="block"}setConfig(E){this._config=E}handleFilterInput(E){if(this.optionsContainer.innerHTML="",E.length>=2)this.fetchOptions(E).then((w)=>{w.forEach((H)=>{const G=document.createElement("div");G.textContent=H,G.classList.add("option"),G.addEventListener("click",()=>this.selectOption(H)),this.optionsContainer.appendChild(G)})})}fetchOptions(E){return new Promise((w,H)=>{if(this._config.dynamic_options_service){const G=`${this._config.dynamic_options_service}?query=${encodeURIComponent(E)}`;fetch(G).then((z)=>{if(!z.ok)throw new Error("Network response was not ok");return z.json()}).then((z)=>{const J=z.map((K)=>K.name);w(J)}).catch((z)=>{console.error("Error fetching dynamic options:",z),H(z)})}else if(this._config.static_options){const G=this._config.static_options.filter((z)=>z.toLowerCase().includes(E.toLowerCase()));w(G)}else w([])})}selectOption(E){this.inputValue.value=E,this.hideModal()}onInput(E){const w=E.target.value.trim();if(this.clearButton.style.visibility=w?"visible":"hidden",w.length>=2)this.updateOptions(w),this.optionsContainer.style.display="block";else this.clearOptions()}onClear(){this.inputField.value="",this.clearButton.style.visibility="hidden",this.hideOptions(),this.dispatchEvent(new CustomEvent("clear"))}clearOptions(){this.optionsContainer.innerHTML="",this.optionsContainer.style.display="none"}}customElements.define("search-input",M);function U(E,w){const H=document.createElement("div");H.className="question select-question",H.dataset.index=w;const G=W(E.title);H.appendChild(G);const z=document.createElement("search-input");H.appendChild(z),this.surveyContainer.appendChild(H);const J={static_options:E.options||[],dynamic_options_service:E.options_source};z.setConfig(J),z.addEventListener("optionSelected",(K)=>{const P=K.detail.option;this.setResponse(E.name,P)})}function Y(E,w){const H=document.createElement("div");H.className="question",H.dataset.index=w.toString();const G=W(E.title);H.appendChild(G);const z=document.createElement("input");z.type="text",z.name=E.name,z.required=E.isRequired,z.className="single-line-text-input",H.appendChild(z),this.surveyContainer.appendChild(H),z.addEventListener("input",()=>{this.setResponse(E.name,z.value)})}function f(E,w){const H=document.createElement("div");H.className="question",H.dataset.index=w.toString();const G=W(E.title);H.appendChild(G);const z=document.createElement("textarea");z.name=E.name,z.required=E.isRequired,z.className="multi-line-text-input",z.placeholder="Enter your comments here...",H.appendChild(z),this.surveyContainer.appendChild(H),z.addEventListener("input",()=>{this.setResponse(E.name,z.value)})}function B(E,w){const H=document.createElement("div");H.className="question",H.dataset.index=w.toString();const G=W(E.title);H.appendChild(G);const z=document.createElement("div");z.className=`ranking-list ${E.name}`,E.choices.forEach((J,K)=>{const P=document.createElement("div");P.setAttribute("draggable",!0),P.className="ranking-item";const X=document.createElement("div");X.className="drag-icon",X.textContent="\u2261",P.appendChild(X);const Z=document.createElement("div");Z.className="index",Z.textContent=K+1,P.appendChild(Z);const _=document.createElement("div");_.className="choice-text",_.textContent=J,P.appendChild(_),z.appendChild(P)}),H.appendChild(z),this.surveyContainer.appendChild(H)}class S{constructor(E,w){this.json=E,this.surveyContainer=document.getElementById(w),this.questionNumber=1,this.responses={},this.createSurvey()}createSurvey(){this.createSurveyTitle(this.json.surveyTitle,this.surveyContainer),this.createSurveyDescription(this.json.surveyDescription,this.surveyContainer),this.json.questions.forEach((E,w)=>{switch(E.type){case"ranking":B.call(this,E,w);break;case"single-line-text":Y.call(this,E,w);break;case"multi-line-text":f.call(this,E,w);break;case"yes-no":$.call(this,E,w);break;case"select":U.call(this,E,w);break;default:console.error("Unsupported question type: "+E.type)}}),this.addDragAndDrop(),this.createCompleteButton(this.surveyContainer)}setResponse(E,w){this.responses[E]=w}evaluateVisibilityConditions(){this.json.questions.forEach((E,w)=>{const H=this.surveyContainer.querySelector(`.question[data-index="${w}"]`);if(E.visible_when){const G=E.visible_when.split("=").map((P)=>P.trim()),z=G[0],J=G[1].toLowerCase();if((this.responses[z]?this.responses[z].toLowerCase():null)===J)H.style.display="block";else H.style.display="none"}})}createSurveyTitle(E,w){const H=document.createElement("h3");H.className="survey-title",H.textContent=E,w.appendChild(H)}createSurveyDescription(E,w){const H=document.createElement("p");H.className="survey-description",H.innerHTML=E,w.appendChild(H)}addDragAndDrop(){document.querySelectorAll(".ranking-list").forEach((w)=>{w.addEventListener("dragover",(H)=>{H.preventDefault();const G=document.querySelector(".dragging"),z=this.getDragAfterElement(w,H.clientY);if(z)w.insertBefore(G,z);else if(G)w.appendChild(G);this.updateDraggedItemIndex(G,w)}),w.addEventListener("dragstart",(H)=>{H.target.classList.add("dragging")}),w.addEventListener("dragend",(H)=>{H.target.classList.remove("dragging"),this.updateAllIndexes(w)}),w.addEventListener("drop",(H)=>{H.preventDefault(),this.updateAllIndexes(w)})})}createCompleteButton(E){const w=document.createElement("div");w.className="button-container";const H=document.createElement("button");H.className="complete-button",H.textContent="Complete",H.addEventListener("click",()=>this.finishSurvey()),w.appendChild(H),E.appendChild(w)}finishSurvey(){const E=this.getResponses();if(this.completeCallback)this.completeCallback(this.responses);this.displayThankYouPage()}getResponses(){const E={responses:[]};return this.json.questions.forEach((w)=>{const H={questionName:w.name,questionTitle:w.title,answer:null};switch(w.type){case"single-line-text":const G=this.surveyContainer.querySelector(`input[name="${w.name}"]`);H.answer=G?G.value:"";break;case"ranking":const z=Array.from(this.surveyContainer.querySelectorAll(`.${w.name} .ranking-item`));if(console.log(z),z.length)H.answer=z.map((J,K)=>({rank:K+1,text:J.querySelector(".choice-text").textContent.trim()}));break}E.responses.push(H)}),E}onComplete(E){this.completeCallback=E}displayThankYouPage(){this.surveyContainer.innerHTML="";const E=document.createElement("div");E.className="thank-you-container",E.innerHTML=`
        <h2>Thank you for your input.</h2>
        <p>You can close this page. </p>
        <p>Learn more about <a href="https://servicenow.com">Creator Workflows</a>.</>
        <div class="button-container">
            <button class="secondary-button">Prev</button>
            <button class="primary-button">Done</button>
        </div>
    `,this.surveyContainer.appendChild(E)}getDragAfterElement(E,w){return[...E.querySelectorAll(".ranking-item:not(.dragging)")].reduce((G,z)=>{const J=z.getBoundingClientRect(),K=w-J.top-J.height/2;if(K<0&&K>G.offset)return{offset:K,element:z};else return G},{offset:Number.NEGATIVE_INFINITY}).element}updateDraggedItemIndex(E,w){let H=0;Array.from(w.children).forEach((z,J)=>{if(z!==E&&z.getBoundingClientRect().top<E.getBoundingClientRect().bottom)H=J+1});const G=E.querySelector(".index");if(G)G.textContent=H+1}updateAllIndexes(E){E.querySelectorAll(".ranking-item").forEach((H,G)=>{const z=H.querySelector(".index");if(z)z.textContent=G+1})}}window.SurveyBuilder=S;
