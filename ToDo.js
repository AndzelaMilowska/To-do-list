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
function generateTaskHTML(columnId, name, desctiption) {
    columnId.insertAdjacentHTML('beforeend', `
    <div class="column__task-card p-2 d-flex flex-column rounded overflow-hidden" data-bs-toggle="modal" data-bs-target="#cardModal">
        <h4 class="column__task-card__header">${name}</h4>
        <p class="column__task-card__content">${desctiption}
        </p>
        </div>
    </div>`)
}

//generate cards
async function generateCards() {
    const columnsList = document.querySelectorAll(".column")
    columnsList.forEach(async (column) => {
        const cardsObj = await getCardsObj(column.dataset.column)
        // console.log(cardsObj)
        cardsObj.map((card) => {
            generateTaskHTML(column, card.name, card.description);
        })
    })
}

//put column name
async function sendColumnName(name, uuid) {
    await fetch(serverColumns+uuid, {
        method: "PUT",
        body: name
    })
}

// look for column name change
async function lookForColumnNameChange() {
    const columnHeaders =  document.querySelectorAll(".column__header") 
    columnHeaders.forEach(header => header.addEventListener('focus', () => {
        header.addEventListener('focusout', () => {
            // console.log(`${header.value}`)
            // console.log(header.parentNode.dataset.column)
            const newColumnName = new FormData();
            newColumnName.append("name", header.value)
            sendColumnName(newColumnName, header.parentNode.dataset.column)

        })
    }))
    // console.log(columnHeaders)
}

//delete column button
async function deleteColumn(columnId) {
    await fetch(serverColumns+columnId, {
        method: "DELETE",
    })
}

async function deleteColumnBtn() {
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
}

function lookForAddColBtnUse() {
    buttonNewColumn.addEventListener("click",async () => {
        await postNewColumn()
        rerenderPage()
    })
}

//add new task card (request)
async function saveCard(parentId) {
    const saveCardBtn = await document.querySelector(".modal__btn-save")
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

//update/ midify card 
// async function modifyCard(parentId) {
//     const saveCardBtn = await document.querySelector(".modal__btn-save")
//     saveCardBtn.addEventListener('click', async () => {
//         const taskTitle = document.querySelector(".card-title")
//         const taskDescription = document.querySelector(".card-description")
//         const cardData = new FormData()
//         cardData.append("name", taskTitle.value)
//         cardData.append("description", taskDescription.value)
//         taskTitle.value = '';
//         taskDescription.value = '';
//         await fetch(serverCards+parentId, {
//             method: "POST",
//             body: cardData
//         })
//         rerenderPage()
//     })
// }

// is post card gonna work with put instead? --> nope but post is on + btn event listener -> make same with put for csrd listener
// make del card (new modal? or btn visible or not depends of click area)

//add new task card (listener)
async function addTaskBtnUse() {
    const addCardBtn = await document.querySelectorAll(".column__btn") 
    addCardBtn.forEach(button => button.addEventListener('click', () => {
        const columnId = button.parentNode.dataset.column;
        saveCard(columnId)
        }))
}

async function editTaskCard() {
    const taskCard = document.querySelectorAll(".column__task-card") 
    console.log(taskCard)
    taskCard.forEach(card => card.addEventListener('click', () => {
        console.log(taskCard)
        const colID = card.parentNode.dataset.column;
        console.log(colID)
        }))
}

//del btn task
async function deleteColumnBtn() {
    const deleteButtons =  document.querySelectorAll(".column__delete-btn") 
    console.log(deleteButtons)
    deleteButtons.forEach(button => button.addEventListener('click', () => {
            deleteColumn(button.parentNode.dataset.column)
            button.parentNode.remove();
    }))
}

//render Page
async function renderPage() {
    await generateColumns();
    await generateCards().then(editTaskCard)
    lookForColumnNameChange();
    lookForAddColBtnUse()
    deleteColumnBtn()
    addTaskBtnUse()
    // setTimeout(editTaskCard, 1000)
    
    
}
renderPage()
