const serverColumns = `https://todosy.iwanicki.wtf/api/v1/todo-columns/`
const serverCards = `https://todosy.iwanicki.wtf/api/v1/todo-item/`
const columnsContainer = document.getElementById("columnContainer")
const buttonNewColumn = document.getElementById("btn__add_column")
const rootEl = document.querySelector(":root")
const saveCardBtn = document.querySelector(".modal__btn-save")

async function getColumnsObj() {
    const response = await fetch(serverColumns, {
        method: "GET"
    });
    const columnsAll = await response.json()
    return columnsAll
}

//generate modal el 
function generateModal() {
    const modalContainer = document.querySelector(".modal-container")
    modalContainer.innerHTML=""
    const modalHTML = ` <div class="modal fade" id="cardModal" tabindex="-1" aria-labelledby="cardModalLabel" aria-hidden="true">
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
   modalContainer.insertAdjacentHTML('beforeend',`${modalHTML}`)
}
 

//generate columns html
function generateColumnHTML(colIndex, colName, colID) {
    columnsContainer.insertAdjacentHTML('beforeend', `<div id="col_${colIndex}" data-column="${colID}" class="col-3 m-3 column rounded overflow-hidden position-relative">
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

//generate columns from server
async function generateColumns() {
    columnsContainer.innerHTML = ""
    const columnsObj = await getColumnsObj()
    columnsObj.map((column, index) => {
        generateColumnHTML(index, column.name, column.uuid);
    })
}

//get cards object from server
async function getCardsObj(colId) {
    const response = await fetch(serverCards+colId, {
        method: "GET"
    });
    const cardsAll = await response.json()
    return cardsAll
}

//generate task html
function generateTaskHTML(columnId, name, desctiption, cardId) {
    columnId.insertAdjacentHTML('beforeend', `
    <div class="column__task-card column_content draggable p-2 d-flex flex-column rounded overflow-hidden" draggable="true" data-card-Id="${cardId}" data-bs-toggle="modal" data-bs-target="#cardModal">
        <h4 class="column__task-card__header column_content">${name}</h4>
        <p class="column__task-card__content column_content">${desctiption}
        </p>
        </div>
    </div>`)
}

//generate cards
async function generateCards() {
    const columnsList = document.querySelectorAll(".column")
    await Promise.all(Array.from(columnsList).map(async (column) => {
        const cardsObj = await getCardsObj(column.dataset.column)
        await Promise.all(Array.from(cardsObj).map((card) => {
            generateTaskHTML(column, card.name, card.description, card.uuid);
        }))
    }))
}

//put column name
async function sendColumnName(name, uuid) {
    await fetch(serverColumns+uuid, {
        method: "PUT",
        body: name
    })
}

// look for column name change
function lookForColumnNameChange() {
    const columnHeaders =  document.querySelectorAll(".column__header") 
    columnHeaders.forEach(header => header.addEventListener('focus', () => {
        header.addEventListener('focusout', () => {
            const newColumnName = new FormData();
            newColumnName.append("name", header.value)
            sendColumnName(newColumnName, header.parentNode.dataset.column)
        })
    }))
}

//delete column button
async function deleteColumn(columnId) {
    await fetch(serverColumns+columnId, {
        method: "DELETE",
    })
}

function deleteColumnBtn() {
    const deleteButtons =  document.querySelectorAll(".column__delete-btn") 
    deleteButtons.forEach(button => button.addEventListener('click', () => {
            deleteColumn(button.parentNode.dataset.column)
            button.parentNode.remove();
    }))
}

async function postNewColumn() {
    const defaultColumn = new FormData()
    defaultColumn.append("name", "Column")
    await fetch(serverColumns, {
        method: "POST",
        body: defaultColumn
    })
}

async function rerenderPage() {
    generateModal()
    await generateColumns();
    await generateCards()
    lookForColumnNameChange();
    addTaskBtnUse()
    deleteColumnBtn()
    editTaskCard()
    dragstart()
    dropHandler()
    dragoverHandler() 
    dragendHandler()
}

function lookForAddColBtnUse() {
    buttonNewColumn.addEventListener("click",async () => {
        await postNewColumn()
        rerenderPage()
    })
}

async function saveCard(parentId) {
    const saveCardBtn = document.querySelector(".modal__btn-save")
    saveCardBtn.addEventListener('click', async () => {
        const taskTitle = document.querySelector(".card-title")
        const taskDescription = document.querySelector(".card-description")
        const cardData = new FormData()
        cardData.append("name", taskTitle.value)
        cardData.append("description", taskDescription.value)
        taskTitle.value = '';
        taskDescription.value = '';
        await fetch(serverCards+parentId, {
            method: "POST",
            body: cardData
        })
        rerenderPage()
    })
}

//add new task card (listener)
function addTaskBtnUse() {
    const addCardBtn = document.querySelectorAll(".column__btn") 
    addCardBtn.forEach(button => button.addEventListener('click', () => {
        rootEl.style.setProperty('--display-del-btn', 'none');
        const taskTitle = document.querySelector(".card-title")
        const taskDescription = document.querySelector(".card-description")
        taskTitle.value = '';
        taskDescription.value = '';
        const columnId = button.parentNode.dataset.column;
        saveCard(columnId)
        }))
}

// //update/ midify card 
function modifyCardContent(cardId, colId) {
    const saveCardBtn = document.querySelector(".modal__btn-save")
    saveCardBtn.addEventListener('click', async () => {
        const taskTitle = document.querySelector(".card-title")
        const taskDescription = document.querySelector(".card-description")
        const modifiedCardData = new FormData()
        modifiedCardData.append("name", taskTitle.value)
        modifiedCardData.append("description", taskDescription.value)
        modifiedCardData.append("TodoColumnUuid", colId)
        taskTitle.value = '';
        taskDescription.value = '';
        await fetch(serverCards+cardId, {
            method: "PUT",
            body: modifiedCardData
        })
        rerenderPage()
    })
}

async function deleteCard(cardId) {
    await fetch(serverCards+cardId, {
        method: "DELETE",
    })
}

// del btn task
function deleteCardBtn(cardId) {
    const deleteButton = document.querySelector(".modal__btn-delete")
    deleteButton.addEventListener('click', () => {
        deleteCard(cardId)
        rerenderPage()
    })
}

function editTaskCard() {
    const taskCard = document.querySelectorAll(".column__task-card")
    taskCard.forEach(card => card.addEventListener('click', () => {
        rootEl.style.setProperty('--display-del-btn', 'block');
        deleteCardBtn(card.dataset.cardId)
        const taskTitle = document.querySelector(".card-title")
        const taskDescription = document.querySelector(".card-description")
        taskTitle.value = card.childNodes[1].innerHTML
        taskDescription.value = card.childNodes[3].innerHTML
        const colId = card.parentNode.dataset.column;
        const cardId = card.dataset.cardId
        modifyCardContent(cardId, colId)
    }))
}

async function changeCardParent(cardId, colId) {
        const modifiedCardData = new FormData()
        modifiedCardData.append("TodoColumnUuid", colId)
        await fetch(serverCards+cardId, {
            method: "PUT",
            body: modifiedCardData
        })
}

function dragstart() {
    const cards = document.querySelectorAll(".draggable")
    cards.forEach(card => {
        card.addEventListener("dragstart", (ev) => {
            card.id = "indrag";
            rootEl.style.setProperty('--draged-border', 'dashed white');
            ev.dataTransfer.setData("text", ev.target.id);
            ev.dataTransfer.effectAllowed = "move";
        })})
}

//put card
  function dropHandler() {
    const columns = document.querySelectorAll(".column")
    columns.forEach(column => {
        column.addEventListener("drop", (ev) => {
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text");
            const dragedCard = document.getElementById(data)
            console.log(ev.target)
            ev.target.appendChild(document.getElementById(data))
            const colId = ev.target.dataset.column;
            console.log(colId)
            const cardId = dragedCard.dataset.cardId
            console.log(cardId)
            changeCardParent(cardId, colId)
        });
    })
  }

  function dragoverHandler() {
    const columns = document.querySelectorAll(".column")
    columns.forEach(column => {
        column.addEventListener("dragover", (ev) => {
            rootEl.style.setProperty('--pointer-events', 'none');
            ev.preventDefault();
        })
    })
  }

  function dragendHandler() {
    const cards = document.querySelectorAll(".draggable")
    cards.forEach(card => { 
        card.addEventListener("dragend", () => {
            card.id = "";
            rootEl.style.setProperty('--draged-border', 'none');
            rootEl.style.setProperty('--pointer-events', 'all');
        })}) 
  }

//render Page
async function renderPage() {
    generateModal()
    await generateColumns();
    await generateCards()
    lookForColumnNameChange();
    lookForAddColBtnUse()
    addTaskBtnUse()
    deleteColumnBtn()
    editTaskCard()
    dragstart()
    dropHandler()
    dragoverHandler() 
    dragendHandler()
}
renderPage()
