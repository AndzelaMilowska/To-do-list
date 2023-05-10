//pobierz z servera istniejące kolumny 
//wygeneruj istniejące kolumny --> wartość inputu kolumnowego= nazwa
//pobierz z serwera istniejące taski
//wygeneruj taski po id kolumny

const serverColumns = `https://todosy.iwanicki.wtf/api/v1/todo-columns/`
const serverCards = `https://todosy.iwanicki.wtf/api/v1/todo-item/`
const columnsContainer = document.getElementById("columnContainer")
const buttonNewColumn = document.getElementById("btn__add_column")

async function getColumnsObj() {
    const response = await fetch(serverColumns, {
        method: "GET"
    });
    const columnsAll = await response.json()
    return columnsAll
}

//generate columns html
function generateColumnHTML(colIndex, colName, colID) {
    columnsContainer.insertAdjacentHTML('beforeend', `<div id="col_${colIndex}" data-column="${colID}" class="col-3 m-3 column rounded overflow-hidden position-relative">
    <input type="text" value="${colName}" class="column__header d-flex justify-content-center" placeholder="Column">
      <button class="btn column__btn p-0 m-0 d-flex align-items-center justify-content-center rounded-circle position-absolute"
      data-bs-toggle="modal" data-bs-target="#cardModal"><img class=""
              src="./Sources/CUSTOM_plusSign.png">
      </button>
      </button>
      <button class="btn column__delete-btn p-0 m-0 d-flex align-items-center justify-content-center position-absolute">
          delete
      </button>
  </div>`)
}

//generate columns from server
async function generateColumns() {
    columnsContainer.innerHTML = ""
    // const columnsList = document.querySelectorAll(".column")
    // columnsList.forEach(column => column.remove())
    const columnsObj = await getColumnsObj()
    // console.log(columnsObj)
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
    <div class="column__task-card p-2 d-flex flex-column rounded overflow-hidden" data-card-Id="${cardId}" data-bs-toggle="modal" data-bs-target="#cardModal">
        <h4 class="column__task-card__header">${name}</h4>
        <p class="column__task-card__content">${desctiption}
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
    await generateColumns();
    await generateCards();
    lookForColumnNameChange();
    deleteColumnBtn()
    addTaskBtnUse()
    editTaskCard()
}

function lookForAddColBtnUse() {
    buttonNewColumn.addEventListener("click",async () => {
        await postNewColumn()
        rerenderPage()
    })
}

//add new task card (request)
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

// is post card gonna work with put instead? --> nope but post is on + btn event listener -> make same with put for csrd listener
// make del card (new modal? or btn visible or not depends of click area)

//add new task card (listener)
function addTaskBtnUse() {
    const addCardBtn = document.querySelectorAll(".column__btn") 
    addCardBtn.forEach(button => button.addEventListener('click', () => {
        const columnId = button.parentNode.dataset.column;
        saveCard(columnId)
        }))
}

// //update/ midify card 
function putCard(cardId, colId) {
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
        deleteCardBtn(card.dataset.cardId)
        const taskTitle = document.querySelector(".card-title")
        const taskDescription = document.querySelector(".card-description")
        taskTitle.value = card.childNodes[1].innerHTML
        taskDescription.value = card.childNodes[3].innerHTML
        const colId = card.parentNode.dataset.column;
        const cardId = card.dataset.cardId
        putCard(cardId, colId)
        //console.log(card.dataset.cardId)
    }))
}

//render Page
async function renderPage() {
    await generateColumns();
    await generateCards()
    lookForColumnNameChange();
    lookForAddColBtnUse()
    addTaskBtnUse()
    deleteColumnBtn()
    editTaskCard()
}
renderPage()
