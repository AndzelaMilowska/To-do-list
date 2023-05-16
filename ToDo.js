//serverColumns => serverColumnsPath
//generateColumns => renderColumns
//generateTaskHTML => generateCardsHTML
// window.onload=function() {
class ServerRequests {
    serverColumns;
    serverCards;

    constructor() {
        this.serverColumns = `https://todosy.iwanicki.wtf/api/v1/todo-columns/`
        this.serverCards = `https://todosy.iwanicki.wtf/api/v1/todo-item/`
    }

    async getColumnsObj() {
        const response = await fetch(this.serverColumns, {
            method: "GET"
        });
        const columnsAll = await response.json()
        return columnsAll
    }

    async getCardsObj(colId) {
        const response = await fetch(this.serverCards+colId, {
            method: "GET"
        });
        const cardsAll = await response.json()
        return cardsAll
    }

    async sendColumnName(name, uuid) {
        await fetch(this.serverColumns+uuid, {
            method: "PUT",
            body: name
        })
    }

    async deleteColumn(columnId) {
        await fetch(this.serverColumns+columnId, {
            method: "DELETE",
        })
    }

    async postNewColumn() {
        const columnData = new FormData()
        columnData.append("name", "Column")
        await fetch(this.serverColumns, {
            method: "POST",
            body: columnData
        })
    }

    async postCard(parentId, cardData) {
        await fetch(this.serverCards+parentId, {
            method: "POST",
            body: cardData
        })
    }

    async putCard(modifiedCardData, cardId) {
        await fetch(this.serverCards+cardId, {
            method: "PUT",
            body: modifiedCardData
        })
    }
}

class Modal {
    modalContainer;
    modalHTML;

    constructor() {
        this.modalContainer = document.querySelector(".modal-container")
        this.modalHTML = ` <div class="modal fade" id="cardModal" tabindex="-1" aria-labelledby="cardModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <form class="card-form">
              <div class="form-group py-3">
                <label for="taskTitle">Title</label>
                <input type="text" class="form-control card-title" id="taskTitle" placeholder="Task title">
              </div>
              <div class="form-group">
                <label for="taskDescription">Description</label>
                <input type="text" class="form-control card-description" id="taskDescription"
                  placeholder="Task description">
              </div>
            </form>
            <div class="card-modal__footer d-flex justify-content-end">
              <button type="button" class="btn modal__btn-delete position-absolute" data-bs-dismiss="modal">delete</button>
              <button type="button" class="btn modal__btn-cancel card-modal__btn" data-bs-dismiss="modal">cancel</button>
              <button type="button" class="btn modal__btn-save card-modal__btn" data-bs-dismiss="modal">save</button>
            </div>
          </div>
        </div>
       </div>`
    }

    generateModal() {
        this.modalContainer.innerHTML="" 
        this.modalContainer.insertAdjacentHTML('beforeend',`${this.modalHTML}`)
    }
}

class ColumnsRendering {
    columnsContainer;
    constructor() {
        this.columnsContainer = document.getElementById("columnContainer")
    }

    generateColumnHTML(colIndex, colName, colID) {
        this.columnsContainer.insertAdjacentHTML('beforeend', `<div id="col_${colIndex}" data-column="${colID}" class="col-3 m-3 column rounded overflow-hidden position-relative">
    <input type="text" value="${colName}" class="column__header column_content d-flex justify-content-center" placeholder="Column">
      <button class="btn column_content column__btn p-0 m-0 d-flex align-items-center justify-content-center rounded-circle position-absolute"
      data-bs-toggle="modal" data-bs-target="#cardModal"><img class=""
              src="./Sources/CUSTOM_plusSign.png">
      </button>
      </button>
      <button class="btn column_content column__delete-btn p-0 m-0 d-flex align-items-center justify-content-center position-absolute">
          delete
      </button>
  </div>`)
    }

    async generateColumns(requestsObject) {
        this.columnsContainer.innerHTML = ""
        const columnsObj = await requestsObject.getColumnsObj()
        columnsObj.map((column, index) => {
            this.generateColumnHTML(index, column.name, column.uuid);
        })
    }

    returnColumns() {
        const columnsList = document.querySelectorAll(".column")
        return columnsList
    }
}

class CardsRendering {
    constructor() {

    }
    generateTaskHTML(columnId, name, desctiption, cardId) {
        columnId.insertAdjacentHTML('beforeend', `
        <div class="column__task-card column_content draggable p-2 d-flex flex-column rounded overflow-hidden" draggable="true" data-card-Id="${cardId}" data-bs-toggle="modal" data-bs-target="#cardModal">
            <h4 class="column__task-card__header column_content">${name}</h4>
            <p class="column__task-card__content column_content">${desctiption}
            </p>
            </div>
        </div>`)
    }

    async generateCards(columnsList, serverReqObj) {
        await Promise.all(Array.from(columnsList).map(async (column) => {
            const cardsObj = await serverReqObj.getCardsObj(column.dataset.column)
            await Promise.all(Array.from(cardsObj).map((card) => {
                this.generateTaskHTML(column, card.name, card.description, card.uuid);
            }))
        }))
    }
}

class ColumnsFunctionalities {
    lookForColumnNameChange(serverRequests) {
        const columnHeaders =  document.querySelectorAll(".column__header") 
        columnHeaders.forEach(header => header.addEventListener('focus', () => {
            header.addEventListener('focusout', () => {
                const newColumnName = new FormData();
                newColumnName.append("name", header.value)
                serverRequests.sendColumnName(newColumnName, header.parentNode.dataset.column)
            })
        }))
    }

    deleteColumnBtn(serverRequests) {
        const deleteButtons = document.querySelectorAll(".column__delete-btn")
        deleteButtons.forEach(button => button.addEventListener('click', () => {
            serverRequests.deleteColumn(button.parentNode.dataset.column)
            button.parentNode.remove();
        }))
    }

    lookForAddColBtnUse(renderingObj, serverRequests) {
        const buttonNewColumn = document.getElementById("btn__add_column")
        buttonNewColumn.addEventListener("click", async () => {
            await serverRequests.postNewColumn()
            renderingObj.rerenderPage(renderingObj)
        })
    }
}

class CardsFunctionalities {
    saveCardBtn;
    taskTitle;
    taskDescription;
    rootEl;

    constructor() {
    this.saveCardBtn = document.querySelector(".modal__btn-save")
    this.taskTitle = document.querySelector(".card-title")
    this.taskDescription = document.querySelector(".card-description")
    this.rootEl = document.querySelector(":root")
    }

    async saveCard(parentId, renderingObj, serverRequests) {
        this.saveCardBtn.addEventListener('click', () => {
            const cardData = new FormData()
            cardData.append("name", this.taskTitle.value)
            cardData.append("description", this.taskDescription.value)
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            serverRequests.postCard(parentId, cardData)
            renderingObj.rerenderPage(renderingObj)
        })
    }

    addTaskBtnUse(renderingObj, serverRequests) {
        const addCardBtn = document.querySelectorAll(".column__btn") 
        addCardBtn.forEach(button => button.addEventListener('click', () => {
            this.rootEl.style.setProperty('--display-del-btn', 'none');
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            const columnId = button.parentNode.dataset.column;
            this.saveCard(columnId, renderingObj, serverRequests)
            }))
    }

    modifyCardContent(cardId, colId, renderingObj) {
        this.saveCardBtn.addEventListener('click', async () => {
            const modifiedCardData = new FormData()
            modifiedCardData.append("name", this.taskTitle.value)
            modifiedCardData.append("description", this.taskDescription.value)
            modifiedCardData.append("TodoColumnUuid", colId)
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            putCard(modifiedCardData, cardId)
            renderingObj.rerenderPage(renderingObj)
        })
    }
}

// class Rendering {
//     async rerenderPage() {
//         generateModal()
//         await generateColumns();
//         await generateCards()
//         lookForColumnNameChange();
//         addTaskBtnUse()
//         deleteColumnBtn()
//         editTaskCard()
//         dragstart()
//         dropHandler()
//         dragoverHandler() 
//         dragendHandler()
//     }
// }

// async function renderPage() {
//     generateModal()
//     await generateColumns();
//     await generateCards()
//     lookForColumnNameChange();
//     lookForAddColBtnUse()
//     addTaskBtnUse()
//     deleteColumnBtn()
//     editTaskCard()
//     dragstart()
//     dropHandler()
//     dragoverHandler() 
//     dragendHandler()
// }


class Rendering {
    constructor() {
        this.columnsDynamics = new ColumnsFunctionalities()
        this.serverRequests = new ServerRequests()
    }
    async rerenderPage(renderingObj) {
        const modal = new Modal()
        modal.generateModal()
        const columns = new ColumnsRendering()
        await columns.generateColumns(this.serverRequests)
        const cards = new CardsRendering()
        await cards.generateCards(columns.returnColumns(), this.serverRequests)
        this.columnsDynamics.lookForColumnNameChange(this.serverRequests)
        const cardsDynamics = new CardsFunctionalities()
        cardsDynamics.addTaskBtnUse(renderingObj, this.serverRequests)
        this.columnsDynamics.deleteColumnBtn(this.serverRequests)
    }

    async renderPage(renderingObj) {
        this.rerenderPage(renderingObj)
        this.columnsDynamics.lookForAddColBtnUse(renderingObj, this.serverRequests)
    }
}

// class Rendering {
//     constructor() {
//         this.modal = new Modal()
//         this.serverRequests = new ServerRequests()
//         this.columns = new ColumnsRendering()
//         this.cards = new CardsRendering()
//         this.columnsDynamics = new ColumnsFunctionalities()
//         this.cardsDynamics = new CardsFunctionalities()
//     }

//     async rerenderPage(renderingObj) {
//         this.modal.generateModal()
//         await this.columns.generateColumns(this.serverRequests)
//         await this.cards.generateCards(this.columns.returnColumns(), this.serverRequests)
//         this.columnsDynamics.lookForColumnNameChange(this.serverRequests) 
//         this.cardsDynamics.addTaskBtnUse(renderingObj, this.serverRequests)
//         this.columnsDynamics.deleteColumnBtn(this.serverRequests)
//     }

//     async renderPage(renderingObj) {
//         console.log(this.columnsDynamics)
//         console.log(this.serverRequests)
//         this.rerenderPage(renderingObj)
//         this.columnsDynamics.lookForAddColBtnUse(renderingObj, this.serverRequests)
//     }
// }

const renderObj = new Rendering()
renderObj.renderPage(renderObj)
