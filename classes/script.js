const params = new URLSearchParams(window.location.search);
const classId = params.get("classId");

const classes = loadClasses();

const currentClass = classes.find(function (savedClass) {
    return savedClass.id === classId;
});

if (currentClass === undefined) {
    document.getElementById("classTitle").textContent = "Class not found";
} else {
    document.getElementById("classTitle").textContent = currentClass.name;
}

class Flashcard {

    constructor(question, answer, type) {
        this.question = question;
        this.answer = answer;
        this.type = type;
        this.mastery = 0;
    }
}

class MultipleChoice extends Flashcard {

    constructor(question, answer, type, choices) {
        super(question, answer, type);
        this.choices = choices;
    }
}

/*
const flashcards = [
    new Flashcard("1 + 1", "2", "flashcard"),
    new Flashcard("2 + 2", "4", "flashcard"),
    new Flashcard("3 + 3", "6", "flashcard"),
    new Flashcard("4 + 4", "8", "flashcard"),
    new Flashcard("5 + 5", "10", "flashcard"),
    new MultipleChoice("What's the capital of France?", "It is Paris", "multiple choice", 
        ["Oh oui oui oui", "It is Paris", "Merci!", "Okay"]),
    new MultipleChoice("What does the cow say?","Oh moo moo moo", "multiple choice", 
        ["Oh moo moo moo", "I speak that too", "All day", "Alright, thanks!"]),
    new MultipleChoice("Why's the door locked up so tight?", "No need to LEAVE", "multiple choice", 
        ["Oh tee hee hee", "No need to LEAVE", "Stay here", "Why"]),
    new MultipleChoice("Why do you know where I sleep?", "I always know", "multiple choice", 
        ["Oh", "I just know", "I always know", "I'm close"]),
    new MultipleChoice("Who says \"I know everything too\"?", "Falsity", "multiple choice", 
        ["Verity", "Falsity", "Lovity", "Curiousity"])
]
*/
let flashcards = [];

if (currentClass !== undefined) {
    flashcards = currentClass.flashcards.map(function (card) {
        if (card.type === "multiple choice") {
            return new MultipleChoice(
                card.question,
                card.answer,
                card.type,
                card.choices
            );
        }

        return new Flashcard(
            card.question,
            card.answer,
            card.type
        );
    });

    flashcards.forEach(function (card, index) {
        card.mastery = currentClass.flashcards[index].mastery;
    });
}

let currentFlashcard = null;
let previousFlashcard = null;
let showingQuestion = true;
let answered = false;
const flashcardButton = document.getElementById("flashcard");
const nextButton = document.getElementById("next");
const masteryButtons = document.querySelectorAll(".mastery-button");
const masteryControls = document.getElementById("mastery-controls");
const viewCards = document.getElementById("flashcardContainer");
const viewButton = document.querySelector(".view");
const choicesContainer = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const addFlashcardButton = document.getElementById("addFlashcardButton");
const addFlashcardDialog = document.getElementById("addFlashcardDialog");
const addFlashcardForm = document.getElementById("addFlashcardForm");
const typeInput = document.getElementById("typeInput");
const choicesInputContainer = document.getElementById("choicesInputContainer");

function nextCard() {

    if (flashcards.length === 0) {
        flashcardButton.textContent = "No flashcards yet";
        masteryControls.style.display = "none";
        choicesContainer.style.display = "none";
        return;
    }

    const unseenCards = flashcards.filter(function(card) {
        return card.mastery === 0 && card !== currentFlashcard;
    });

    let eligibleCards;

    if (unseenCards.length > 0) {
        eligibleCards = unseenCards;
    } else {
        eligibleCards = flashcards.filter(function(card) {
            return card !== currentFlashcard;
        });

        eligibleCards = getTotalMastery(eligibleCards);
    }

    const random = Math.floor(Math.random() * eligibleCards.length);

    previousFlashcard = currentFlashcard;
    currentFlashcard = eligibleCards[random];
    answered = false;

    showingQuestion = true;
    flashcardButton.textContent = currentFlashcard.question;
    masteryControls.style.display = "none";
    choicesContainer.innerHTML = "";
    feedback.textContent = "";
    if (currentFlashcard.type === "multiple choice") {
    choicesContainer.style.display = "flex";
    flashcardButton.classList.remove("interactable");
    displayChoices(currentFlashcard);
    } else {
        flashcardButton.classList.add("interactable");
        choicesContainer.style.display = "none";
        choicesContainer.innerHTML = "";
    }
}

function flipCard() {
    if (currentFlashcard === null) {
        return;
    }

    if (currentFlashcard.type === "multiple choice") {
        return;
    }

    if (showingQuestion) {
        flashcardButton.textContent = currentFlashcard.answer;
        masteryControls.style.display = "block";
        showingQuestion = false;
    } else {
        flashcardButton.textContent = currentFlashcard.question;
        masteryControls.style.display = "none";
        showingQuestion = true;
    }
}

function masteryButtonClick(button) {
    if (currentFlashcard === null) return;

    currentFlashcard.mastery = Number(button.dataset.mastery);
    saveFlashcards(classId, flashcards);

    displayFlashcards();
    nextCard();
}

masteryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        masteryButtonClick(button);
    });
});

function getTotalMastery(cards) { // makes an array of cards that repeats each card based on it's mastery level
    let total = [];

    for (let i = 0; i < cards.length; i++) {
        const weight = 6 - cards[i].mastery;
        for (let j = 0; j < weight; j++) {
            total.push(cards[i]);
        }
    }

    return total;
}

function viewFlashcards() {
    if (getComputedStyle(viewCards).display === "none") {
        displayFlashcards();
        viewCards.style.display = "block";
    } else {
        viewCards.style.display = "none";
    }
}

function displayFlashcards() {
    const flashcardList = document.getElementById("flashcardList");

    flashcardList.innerHTML = "";

    flashcards.forEach(function(card) {
        const row = document.createElement("div");
        row.className = "flashcard-row";

        const question = document.createElement("div");
        question.textContent = card.question;

        const answer = document.createElement("div");
        answer.textContent = card.answer;

        const type = document.createElement("div");
        type.textContent = card.type;

        const masteryText = document.createElement("span");
        masteryText.textContent = card.mastery + " / 5";

        const mastery = document.createElement("div");
        mastery.className = "mastery-display";

        const fillContainer = document.createElement("div");
        fillContainer.className = "mastery-bar";

        const fill = document.createElement("div");
        fill.className = "mastery-fill";
        fill.style.width = (card.mastery * 20) + "%";

        mastery.appendChild(masteryText);
        fillContainer.appendChild(fill);
        mastery.appendChild(fillContainer);


    row.appendChild(question);
    row.appendChild(answer);
    row.appendChild(type);
    row.appendChild(mastery);

    const actions = document.createElement("div");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", function () {
        const confirmed = confirm(
            "are you sure you want to delete this flashcard?"
        );

        if (!confirmed) {
            return;
        }

        const cardIndex = flashcards.indexOf(card);

        if (cardIndex !== -1) {
            flashcards.splice(cardIndex, 1);
        }

        saveFlashcards(classId, flashcards);
        displayFlashcards();

        if (currentFlashcard === card) {
            currentFlashcard = null;
            nextCard();
        }
    });

    actions.appendChild(deleteButton);
    row.appendChild(actions);

    flashcardList.appendChild(row);

    });
}

function displayChoices(card) {
    choicesContainer.innerHTML = "";
    feedback.textContent = "";

    card.choices.forEach(function(choice) {
        const button = document.createElement("button");
        button.textContent = choice;

        button.addEventListener("click", function() {
            checkMultipleChoice(choice);
        });

        choicesContainer.appendChild(button);
    });
}

function checkMultipleChoice(choice) {
    if (currentFlashcard === null || answered) {
        return;
    }

    answered = true;

    if (choice === currentFlashcard.answer) {
        feedback.textContent = "correct";
        if (currentFlashcard.mastery === 0) {
            currentFlashcard.mastery = 2;
        } else if (currentFlashcard.mastery !== 5) {
            currentFlashcard.mastery++;
        }
    } else {
        feedback.textContent =
            "incorrect, The answer is: " + currentFlashcard.answer;
        if (currentFlashcard.mastery > 1) {
        currentFlashcard.mastery--;
        } else {
            currentFlashcard.mastery = 1;
        }
    }

    displayFlashcards();
    saveFlashcards(classId, flashcards);

    choicesContainer.querySelectorAll("button").forEach(function(button) {
        button.disabled = true;
    });
}

addFlashcardButton.addEventListener("click", function () {
    addFlashcardDialog.showModal();
});

document.getElementById("cancelFlashcardButton").addEventListener("click", function () {
    addFlashcardDialog.close();
});

typeInput.addEventListener("change", function () {
    if (typeInput.value === "multiple choice") {
        choicesInputContainer.style.display = "block";
    } else {
        choicesInputContainer.style.display = "none";
    }
});

addFlashcardForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const question = document.getElementById("questionInput").value.trim();
    const answer = document.getElementById("answerInput").value.trim();
    const type = typeInput.value;

    if (question === "" || answer === "") {
        return;
    }

    let newCard;

    if (type === "multiple choice") {
        const choices = [
            document.getElementById("choice1").value.trim(),
            document.getElementById("choice2").value.trim(),
            document.getElementById("choice3").value.trim(),
            document.getElementById("choice4").value.trim()
        ];

        if (choices.some(function (choice) {
            return choice === "";
        })) {
            alert("please fill in all four choices");
            return;
        }

        if (!choices.includes(answer)) {
            alert("one of the choices must exactly match the answer");
            return;
        }

        newCard = new MultipleChoice(question, answer, type, choices);
    } else {
        newCard = new Flashcard(question, answer, type);
    }

    flashcards.push(newCard);

    saveFlashcards(classId, flashcards);

    displayFlashcards();
    nextCard();

    addFlashcardForm.reset();
    choicesInputContainer.style.display = "none";
    addFlashcardDialog.close();
});

const deleteClassButton = document.getElementById("deleteClassButton");

deleteClassButton.addEventListener("click", function () {
    const confirmed = confirm(
        "are you sure you want to delete " +
        currentClass.name +
        " and all its flashcards? this cannot be undone"
    );

    if (!confirmed) {
        return;
    }

    deleteClass(classId);

    window.location.href = "../index.html";
});


nextButton.addEventListener("click", nextCard);
flashcardButton.addEventListener("click", flipCard);
viewButton.addEventListener("click", viewFlashcards);
nextCard();