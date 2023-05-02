const columnHeader = document.getElementById("column__header");
const rootEl = document.querySelector(':root');
const columnsContainer = document.getElementById("columnContainer")
const btnAddColumn = document.getElementById("btn__add_column")
const serverURL = `https://todosy.iwanicki.wtf/api/v1/todo-columns`



//set column names
function setColumnNames() {
    if (localStorage.getItem('column__header')) {
        columnHeader.value = localStorage.getItem('column__header')
    }
}

setColumnNames()

columnHeader.addEventListener('click', () => {
    columnHeader.addEventListener("focusout", () => { localStorage.setItem('column__header', columnHeader.value) })
    setColumnNames()

})

//post column
// const request = new XMLHttpRequest();
// function addColumnToServer() {
//     const formData = new FormData();
//     formData.append("name", "Column03")
//     request.open("POST", serverURL);
//     request.send(formData);
// }

//new post
const formData = new FormData();
formData.append("name", "Column01")
async function postColumn() {
    const response = await fetch(serverURL, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      body: formData
    });
  }
  
//get columns
async function getColumnList() {
    const response = await fetch(serverURL, {
        method: "GET"
    });
    const columnsAll = await response.json()
    return columnsAll
    //console.log(columnsAll)

}


// remove all columns
async function removeAllColumns() {
    const allColumns = await getColumnList();

    const promises = allColumns.map(column => fetch(`${serverURL}/${column.uuid}`, {
        method: "DELETE"
    }))

    await Promise.all(promises);
}

//removeAllColumns();

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
btnAddColumn.addEventListener('click', () => { createNewColumn(); /* postColumn(); addColumnToServer();*/ getColumnList() })


