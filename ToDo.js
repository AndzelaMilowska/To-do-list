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
      data-bs-toggle="modal" data-bs-target="#exampleModal"><img class=""
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
    <div class="column__task-card p-2 d-flex flex-column rounded overflow-hidden">
        <h4 class="column__task-card__header">${name}</h4>
        <p class="column__task-card__content">${desctiption}
        </p>
        </div>
    </div>`)
}

//generate cards
function generateCards() {
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

//delete column button ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


//MAKE ADD COLUMN BUTTON WORK!!
// button clikc -> get serv column info -> sent post -> get new serv info -> compare -> asign missing id to new column
//pick newest date
// async function picknNewestDate() {
//     const columnsObj = await getColumnsObj()
//     let dateAr = []
//     // console.log(columnsObj)
//     columnsObj.map((column) => dateAr.push(column.createdAt))
//     console.log(dateAr)
//     let newest = new Date(Math.max(dateAr.map(e => new Date(e.MeasureDate))));
//     console.log(newest)
// }

async function postNewColumn() {
    const defaultColumn = new FormData()
    defaultColumn.append("name", "Column")
    await fetch(serverColumns, {
        method: "POST",
        body: defaultColumn
    })
}
//teraz zrób najpierw delete button -> delete na dole kolumny, mało widoczny napis
async function getNewColumnId() {
    const oldColumnsObj = await getColumnsObj()
    await postNewColumn()
    const newColumnsObj = await getColumnsObj()
    console.log(oldColumnsObj)
    console.log(newColumnsObj)
}

function lookForAddColBtnUse() {
    buttonNewColumn.addEventListener("click", getNewColumnId)
}

//render Page
async function renderPage() {
    await generateColumns();
    lookForColumnNameChange();
    generateCards()
    deleteColumnBtn()
    lookForAddColBtnUse()
}
renderPage()