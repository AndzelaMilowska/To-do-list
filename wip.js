let editBtn = document.getElementById("column__header");

const rootEl = document.querySelector(':root');



function setColumnNames() {
    if (localStorage.getItem ('column__header')) {
        editBtn.innerHTML = localStorage.getItem ('column__header')
    }
}

setColumnNames()
editBtn.addEventListener('click', () => {
    editBtn.addEventListener("focusout", () => {localStorage.setItem('column__header', editBtn.innerHTML)})
    setColumnNames()
    

})


