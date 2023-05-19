class ServerRequests {
    columnsPath;
    cardsPath;

    constructor() {
        this.columnsPath = `https://todosy.iwanicki.wtf/api/v1/todo-columns/`
        this.cardsPath = `https://todosy.iwanicki.wtf/api/v1/todo-item/`
    }

    async getColumnsObj() {
        const response = await fetch(this.columnsPath, {
            method: "GET"
        });
        const columnsAll = await response.json()
        return columnsAll
    }

    async getCardsObj(colId) {
        const response = await fetch(this.cardsPath + colId, {
            method: "GET"
        });
        const cardsAll = await response.json()
        return cardsAll
    }

    async sendColumnName(name, uuid) {
        await fetch(this.columnsPath + uuid, {
            method: "PUT",
            body: name
        })
    }

    async deleteColumn(columnId) {
        await fetch(this.columnsPath + columnId, {
            method: "DELETE",
        })
    }

    async postNewColumn() {
        const columnData = new FormData()
        columnData.append("name", "Column")
        await fetch(this.columnsPath, {
            method: "POST",
            body: columnData
        })
    }

    async postCard(parentId, cardData) {
        await fetch(this.cardsPath + parentId, {
            method: "POST",
            body: cardData
        })
    }

    async putCard(modifiedCardData, cardId) {
        await fetch(this.cardsPath + cardId, {
            method: "PUT",
            body: modifiedCardData
        })
    }

    async deleteCard(cardId) {
        await fetch(this.cardsPath + cardId, {
            method: "DELETE",
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
        this.modalContainer.innerHTML = ""
        this.modalContainer.insertAdjacentHTML('beforeend', `${this.modalHTML}`)
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
    generateCardsHTML(columnId, name, desctiption, cardId) {
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
                this.generateCardsHTML(column, card.name, card.description, card.uuid);
            }))
        }))
    }
}

class ColumnsFunctionalities {
    constructor(serverRequests) {
        this.serverRequests = serverRequests
    }

    lookForColumnNameChange() {
        const columnHeaders = document.querySelectorAll(".column__header")
        columnHeaders.forEach(header => header.addEventListener('focus', () => {
            header.addEventListener('focusout', () => {
                const newColumnName = new FormData();
                newColumnName.append("name", header.value)
                this.serverRequests.sendColumnName(newColumnName, header.parentNode.dataset.column)
            })
        }))
    }

    deleteColumnBtn() {
        const deleteButtons = document.querySelectorAll(".column__delete-btn")
        deleteButtons.forEach(button => button.addEventListener('click', () => {
            this.serverRequests.deleteColumn(button.parentNode.dataset.column)
            button.parentNode.remove();
        }))
    }

    lookForAddColBtnUse(renderingObj) {
        const buttonNewColumn = document.getElementById("btn__add_column")
        buttonNewColumn.addEventListener("click", async () => {

            await this.serverRequests.postNewColumn()
            renderingObj.rerenderPage(renderingObj)
        })
    }
}

class CardsFunctionalities {
    saveCardBtn;
    taskTitle;
    taskDescription;
    rootEl;
    serverRequests;

    constructor(serverRequests) {
        this.serverRequests = serverRequests
        this.saveCardBtn = document.querySelector(".modal__btn-save")
        this.taskTitle = document.querySelector(".card-title")
        this.taskDescription = document.querySelector(".card-description")
        this.rootEl = document.querySelector(":root")
    }

    async saveCard(parentId, renderingObj) {
        this.saveCardBtn.addEventListener('click', () => {
            const cardData = new FormData()
            cardData.append("name", this.taskTitle.value)
            cardData.append("description", this.taskDescription.value)
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            this.serverRequests.postCard(parentId, cardData)
            renderingObj.rerenderPage(renderingObj)  
        })
    }

    addTaskBtnUse(renderingObj) {
        const addCardBtn = document.querySelectorAll(".column__btn")
        addCardBtn.forEach(button => button.addEventListener('click', () => {
            this.rootEl.style.setProperty('--display-del-btn', 'none');
            this.taskTitle.value = '';
            this.taskDescription.value = '';
            const columnId = button.parentNode.dataset.column;
            this.saveCard(columnId, renderingObj)
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
            this.serverRequests.putCard(modifiedCardData, cardId)
            renderingObj.rerenderPage(renderingObj)
        })
    }

    deleteCardBtn(cardId, renderingObj) {
        const deleteButton = document.querySelector(".modal__btn-delete")
        deleteButton.addEventListener('click', () => {
            this.serverRequests.deleteCard(cardId)
            renderingObj.rerenderPage(renderingObj)
        })
    }

    editTaskCard(renderingObj) {
        const taskCard = document.querySelectorAll(".column__task-card")
        taskCard.forEach(card => card.addEventListener('click', () => {
            this.rootEl.style.setProperty('--display-del-btn', 'block');
            this.deleteCardBtn(card.dataset.cardId, renderingObj)
            this.taskTitle.value = card.childNodes[1].innerHTML
            this.taskDescription.value = card.childNodes[3].innerHTML
            const colId = card.parentNode.dataset.column;
            const cardId = card.dataset.cardId
            this.modifyCardContent(cardId, colId, renderingObj)
        }))
    }

    returnRootEl() {
        return this.rootEl
    }
}

class DragAndDrop {
    serverRequests;
    cards;
    columns;
    rootEl;

    constructor(serverRequests, columnsList, rootEl) {
        this.serverRequests = serverRequests
        this.cards = document.querySelectorAll(".draggable")
        this.columns = columnsList
        this.rootEl = rootEl
    }

    async changeCardParent(cardId, colId) {
        const modifiedCardData = new FormData()
        modifiedCardData.append("TodoColumnUuid", colId)
        this.serverRequests.putCard(modifiedCardData, cardId)
    }

    dragStart() {
        this.cards.forEach(card => {
            card.addEventListener("dragstart", (ev) => {
                card.id = "indrag";
                this.rootEl.style.setProperty('--draged-border', 'dashed white');
                ev.dataTransfer.setData("text", ev.target.id);
                ev.dataTransfer.effectAllowed = "move";
            })
        })
    }

    dropHandler() {
        this.columns.forEach(column => {
            column.addEventListener("drop", (ev) => {
                ev.preventDefault();
                const data = ev.dataTransfer.getData("text");
                const dragedCard = document.getElementById(data)
                ev.target.appendChild(document.getElementById(data))
                const colId = ev.target.dataset.column;
                const cardId = dragedCard.dataset.cardId
                this.changeCardParent(cardId, colId)
            })
        })
    }

    dragoverHandler() {
        this.columns.forEach(column => {
            column.addEventListener("dragover", (ev) => {
                this.rootEl.style.setProperty('--pointer-events', 'none');
                ev.preventDefault();
            })
        })
    }

    dragendHandler() {
        this.cards.forEach(card => {
            card.addEventListener("dragend", () => {
                card.id = "";
                this.rootEl.style.setProperty('--draged-border', 'none');
                this.rootEl.style.setProperty('--pointer-events', 'all');
            })
        })
    }

    runDragAndDrop() {
        this.dragStart()
        this.dropHandler()
        this.dragoverHandler()
        this.dragendHandler()
    }
}

class Rendering {
    serverRequests;
    columnsDynamics;

    constructor() {
        this.serverRequests = new ServerRequests()
        this.columnsDynamics = new ColumnsFunctionalities(this.serverRequests)

    }
    async rerenderPage(renderingObj) {
        const modal = new Modal()
        modal.generateModal()
        const columns = new ColumnsRendering()
        await columns.generateColumns(this.serverRequests)
        const cards = new CardsRendering()
        await cards.generateCards(columns.returnColumns(), this.serverRequests)
        this.columnsDynamics.lookForColumnNameChange()
        const cardsDynamics = new CardsFunctionalities(this.serverRequests)
        cardsDynamics.addTaskBtnUse(renderingObj)
        this.columnsDynamics.deleteColumnBtn()
        cardsDynamics.editTaskCard(renderingObj)
        const dragAndDrop = new DragAndDrop(this.serverRequests, columns.returnColumns(), cardsDynamics.returnRootEl())
        dragAndDrop.runDragAndDrop()
    }

    async renderPage(renderingObj) {
        this.rerenderPage(renderingObj)
        this.columnsDynamics.lookForAddColBtnUse(renderingObj)
    }
}

const renderObj = new Rendering()
renderObj.renderPage(renderObj)

