const columnHeader = document.getElementById("column__header");
const rootEl = document.querySelector(':root');
const columnsContainer = document.getElementById("columnContainer")
const btnAddColumn = document.getElementById("btn__add_column")


//set column names
function setColumnNames() {
    if (localStorage.getItem ('column__header')) {
        columnHeader.value = localStorage.getItem ('column__header')
    }
}

setColumnNames()

columnHeader.addEventListener('click', () => { 
    columnHeader.addEventListener("focusout", () => {localStorage.setItem('column__header', columnHeader.value)})
    setColumnNames()
    
})


//post column
function addColumnToServer() {
    const formData = new FormData();
    formData.append("name", "testColumn02")
    const request = new XMLHttpRequest();
    request.open("POST", "http://146.59.126.16:4999/api/v1/todo-columns");
    request.send(formData);
}


//button create column on click
function createNewColumn() {
    columnsContainer.innerHTML += `<div class="col-3 p-0 m-3 column rounded overflow-hidden position-relative">
    <input type="text" id="column__header" class="column__header d-flex justify-content-center" placeholder="Column">
      <button class="btn column__btn p-0 m-0 d-flex align-items-center justify-content-center rounded-circle position-absolute"
      data-bs-toggle="modal" data-bs-target="#exampleModal"><img class=""
              src="./Sources/CUSTOM_plusSign.png">
      </button>
  </div>`
    }
//
btnAddColumn.addEventListener('click', () => {createNewColumn(); addColumnToServer()})


