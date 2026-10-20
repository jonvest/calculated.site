class Flashcard {

    constructor(question, answer, type) {
        this.question = question;
        this.answer = answer;
        this.type = type;
        this.mastery = 0;
    }
}

const flashcards = [
    new Flashcard("1 + 1", "2", "flashcard"),
    new Flashcard("2 + 2", "4", "flashcard"),
    new Flashcard("3 + 3", "6", "flashcard"),
    new Flashcard("4 + 4", "8", "flashcard"),
    new Flashcard("5 + 5", "10", "flashcard"),
]

let currentFlashcard = null;
let previousFlashcard = null;
let showingQuestion = true;
const flashcardButton = document.getElementById("flashcard");
const nextButton = document.getElementById("next");
const masteryButtons = document.querySelectorAll(".mastery-button");
const masteryControls = document.getElementById("mastery-controls");
const viewCards = document.getElementById("flashcardContainer");
const viewButton = document.querySelector(".view");

function nextCard() {
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

    showingQuestion = true;
    flashcardButton.textContent = currentFlashcard.question;
    masteryControls.style.display = "none";
}

function flipCard() {
    if (currentFlashcard === null) {
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
    if (viewCards.style.display === "none" ||
        viewCards.style.display === "") {
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

        flashcardList.appendChild(row);
    });
}

nextButton.addEventListener("click", nextCard);
flashcardButton.addEventListener("click", flipCard);
viewButton.addEventListener("click", viewFlashcards);
nextCard();