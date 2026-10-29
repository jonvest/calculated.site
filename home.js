const createClassButton = document.getElementById("createClassButton");
const createClassDialog = document.getElementById("createClassDialog");
const createClassForm = document.getElementById("createClassForm");
const classNameInput = document.getElementById("className");
const cancelCreate = document.getElementById("cancelCreate");

createClassButton.addEventListener("click", function () {
    createClassDialog.showModal();
    classNameInput.focus();
});

cancelCreate.addEventListener("click", function () {
    createClassDialog.close();
});

createClassForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = classNameInput.value.trim();

    if (name === "") {
        return;
    }

    
    const newClass = createClass(name);

    window.location.href =
        "classes/example.html?classId=" +
        encodeURIComponent(newClass.id);

});


function displayClasses() {
    const classList = document.getElementById("classList");

    classList.innerHTML = "";

    const classes = loadClasses();

    for (const savedClass of classes) {
        const link = document.createElement("a");

        link.className = "button-link";
        link.textContent = savedClass.name;

        link.href =
            "classes/example.html?classId=" +
            encodeURIComponent(savedClass.id);

        classList.appendChild(link);
    }
}

displayClasses();
