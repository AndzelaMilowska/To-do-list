//pobierz z servera istniejące kolumny 
//wygeneruj istniejące kolumny --> wartość inputu kolumnowego= nazwa
//pobierz z serwera istniejące taski
//wygeneruj taski po id kolumny

const serverColumns = `https://todosy.iwanicki.wtf/api/v1/todo-columns/`
const serverCards = `https://todosy.iwanicki.wtf/api/v1/todo-item/`
const columnsContainer = document.getElementById("columnContainer")

async function getColumnsObj() {
    const response = await fetch(serverColumns, {
        method: "GET"
    });
    const columnsAll = await response.json()
    return columnsAll
    //console.log(columnsAll)
}

//generate columns html
function generateColumnHTML(colIndex, colName, colID) {
    columnsContainer.insertAdjacentHTML('beforeend', `<div id="col_${colIndex}" data-column="${colID}" class="col-3 p-0 m-3 column rounded overflow-hidden position-relative">
    <input type="text" value="${colName}" class="column__header d-flex justify-content-center" placeholder="Column">
      <button class="btn column__btn p-0 m-0 d-flex align-items-center justify-content-center rounded-circle position-absolute"
      data-bs-toggle="modal" data-bs-target="#exampleModal"><img class=""
              src="./Sources/CUSTOM_plusSign.png">
      </button>
  </div>`)
}

//generate columns from server
async function generateColumns() {
    const columnsObj = await getColumnsObj()
    console.log(columnsObj)
    columnsObj.map((column, index) => {
        generateColumnHTML(index, column.name, column.uuid);
    })
}
// get cards from server for desired column -> generate cards -> repeat for all columns
//get cards object from server
async function getCardsObj(colId) {
    const response = await fetch(serverCards+colId, {
        method: "GET"
    });
    const cardsAll = await response.json()
    return cardsAll
    // console.log(cardsAll)
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
        console.log(cardsObj)
        cardsObj.map((card) => {
            generateTaskHTML(column, card.name, card.description);
        })
    })
}
//
//generate tasks from server


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
            console.log(`${header.value}`)
            console.log(header.parentNode.dataset.column)
            const newColumnName = new FormData();
            newColumnName.append("name", header.value)
            sendColumnName(newColumnName, header.parentNode.dataset.column)

        })
    }))
    console.log(columnHeaders)
}

//render Page
async function renderPage() {
    await generateColumns();
    lookForColumnNameChange();
    generateCards()
}
renderPage()



//post column
// const formData = new FormData();
// formData.append("name", "Column01")
// async function postColumn() {
//     const response = await fetch(serverURL, {
//       method: "POST", // *GET, POST, PUT, DELETE, etc.
//       body: formData
//     });
//   }


//set column names
// function setColumnNames() {
//     if (localStorage.getItem('column__header')) {
//         columnHeader[0].value = localStorage.getItem('column__header')
//     }
// }

// setColumnNames()

// function lookForAddColumnUse() {
// columnHeader[0].addEventListener('focus', () => {
//     columnHeader[0].addEventListener("focusout", () => { localStorage.setItem('column__header', columnHeader[0].value) })
//     setColumnNames()

// })
// }
// lookForAddColumnUse()