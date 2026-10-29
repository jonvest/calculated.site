const STORAGE_KEY = "calculatedClasses";

function loadClasses() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
        return [];
    }

    return JSON.parse(savedData);
}

function saveClasses(classes) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(classes)
    );
}

function createClass(name) {
    const classes = loadClasses();

    const newClass = {
        id: crypto.randomUUID(),
        name: name,
        flashcards: []
    };

    classes.push(newClass);
    saveClasses(classes);

    return newClass;
}

function saveFlashcards(classId, flashcards) {
    const classes = loadClasses();

    const savedClass = classes.find(function (item) {
        return item.id === classId;
    });

    if (savedClass === undefined) {
        return;
    }

    savedClass.flashcards = flashcards.map(function (card) {
        return {
            question: card.question,
            answer: card.answer,
            type: card.type,
            mastery: card.mastery,
            choices: card.choices
        };
    });

    saveClasses(classes);
}

function deleteClass(classId) {
    const classes = loadClasses();

    const updatedClasses = classes.filter(function (savedClass) {
        return savedClass.id !== classId;
    });

    saveClasses(updatedClasses);
}
