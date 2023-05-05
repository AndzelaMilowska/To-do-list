const columnHeader = document.querySelectorAll(".column__header");
const rootEl = document.querySelector(':root');
const columnsContainer = document.getElementById("columnContainer")
const btnAddColumn = document.getElementById("btn__add_column")
const serverURL = `https://todosy.iwanicki.wtf/api/v1/todo-columns`


//get columns
async function getColumnList() {
    const response = await fetch(serverColumns, {
        method: "GET"
    });
    const columnsAll = await response.json()
    return columnsAll
    //console.log(columnsAll)
}

//button create column on click
function createNewColumn() {
    columnsContainer.insertAdjacentHTML('beforeend', `<div class="col-3 p-0 m-3 column rounded overflow-hidden position-relative">
    <input type="text" class="column__header d-flex justify-content-center" placeholder="Column">
      <button class="btn column__btn p-0 m-0 d-flex align-items-center justify-content-center rounded-circle position-absolute"
      data-bs-toggle="modal" data-bs-target="#exampleModal"><img class=""
              src="./Sources/CUSTOM_plusSign.png">
      </button>
  </div>`)
}
//
//btnAddColumn.addEventListener('click', () => { createNewColumn(); /* postColumn(); addColumnToServer(); getColumnList()*/  })


//tworzy się kolumna --> kada ma osobne id --> dla kadego id jest tworzony osobny klucz w local storage
//jak to będzie działać przy taskach jeśli id jest po ilości kolumn??

//set column names
function setColumnNames() {
    if (localStorage.getItem('column__header')) {
        columnHeader[0].value = localStorage.getItem('column__header')
    }
}

setColumnNames()

function lookForAddColumnUse() {
columnHeader[0].addEventListener('focus', () => {
    columnHeader[0].addEventListener("focusout", () => { localStorage.setItem('column__header', columnHeader[0].value) })
    setColumnNames()

})
}
lookForAddColumnUse()

btnAddColumn.addEventListener('click', () => { createNewColumn(); 
    //  postColumn(); 
    // addColumnToServer(); 
    // getColumnList()
    // lookForAddColumnUse();
    console.log(columnHeader)
})

//post column
const formData = new FormData();
formData.append("name", "Column01")
async function postColumn() {
    const response = await fetch(serverColumns, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      body: formData
    });
  }


// remove all columns
async function removeAllColumns() {
    const allColumns = await getColumnList();

    const promises = allColumns.map(column => fetch(`${serverColumns}/${column.uuid}`, {
        method: "DELETE"
    }))

    await Promise.all(promises);
}

//removeAllColumns();




