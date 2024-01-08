const cardsMenu = document.querySelector(".cards-menu");
const addCardButton = document.querySelector(".btn-create-card");

const creationMenu = document.querySelector(".creation__menu-main");
const mainCreationForm = document.querySelector(".main-creation-form");
const form = document.querySelector("#creation_form");

const finalWindow = document.querySelector(".finalWindow");
const quizTitleInput = finalWindow.querySelector("input");

//////////////////// local storage
function addItemsToLocalStorage(items) {
  const itemsString = JSON.stringify(items);
  localStorage.setItem("quizData", itemsString);
}

function getItemsFromLocalStorage(id) {
  const itemsString = localStorage.getItem(id);
  if (itemsString) {
    return JSON.parse(itemsString);
  } else {
    return [];
  }
}

function deleteItemFromLocalStorage(itemId) {
  const itemsString = localStorage.getItem("quizData");
  let items = itemsString ? JSON.parse(itemsString) : [];

  items.cards = items.cards.filter((item) => item.id !== itemId);

  localStorage.setItem("quizData", JSON.stringify(items));
}
/////////////////////////////////////////////////////////////

addCardButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (!mainCreationForm.classList.contains("d-none")) {
    mainCreationForm.classList.add("d-none");
    showQuestionTypes();
  }
});

function addCheckboxes() {
  const cb = form.querySelectorAll(".option-cb");

  cb.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      item.classList.toggle("active");
      const id = form.querySelector(".form__question").dataset.id;
      const card = quizData.cards.filter((card) => card.id == id)[0];

      if (!item.classList.contains("active")) {
        card.answer = "";
        addItemsToLocalStorage(quizData);
        return;
      }

      for (let i = 0; i < cb.length; i++) {
        if (cb[i].classList.contains("active") && cb[i].id !== item.id) {
          item.classList.remove("active");
          return;
        }
      }

      if (card.questionType === "Викторина") {
        const input = item.closest(".option").querySelector("input");
        const id = input.id;
        const value = input.value.trim();
        if (checkInput(id, value)) {
          item.classList.remove("active");
          return;
        }
        card.answer = value;
      } else {
        const inputValue = item
          .closest(".option")
          .querySelector("p")
          .textContent.trim();
        card.answer = inputValue.toLocaleLowerCase();
      }

      addItemsToLocalStorage(quizData);
    });
  });
}

function checkInput(id, value) {
  const inputs = document.querySelectorAll(".options-item");
  if (value === "") {
    alert("Пустое значение не может являться ответом");
    return true;
  }
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === value && inputs[i].id !== id) {
      alert("Не может быть 2 одинаковых варианта ответа");
      return true;
    }
  }
  return false;
}

function showQuestionTypes() {
  const typesWindow = document.createElement("div");
  typesWindow.classList.add("types-window");
  typesWindow.innerHTML = `
    <h2>Тип вопроса</h2>
    <button>Викторина</button>
    <button>Вписать ответ</button>
    <button>Правда / Ложь</button>
  `;

  typesWindow.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      typesWindow.classList.toggle("d-none");
      const type = btn.textContent;
      drawCard(type, getNextCardId());
      createCardWindow(type);
    });
  });

  creationMenu.append(typesWindow);
}

function getNextCardId() {
  const cards = quizData.cards;
  return cards.length + 1;
}

let currentCardId = -1;
function drawCard(
  type = "",
  id,
  question = "",
  options = ["", "", "", ""],
  answer = ""
) {
  currentCardId = id;
  switch (type) {
    case "Викторина":
      createTypeVict(id, question, options, answer);
      break;
    case "Вписать ответ":
      createTypeEnter(id, question, answer);
      break;
    case "Правда / Ложь":
      createTypeTF(id, question, answer);
      break;
  }
  addCheckboxes();
}

let quizData = {
  quizTitle: "",
  cards: [],
};

function createCardWindow(type, flag = false) {
  const questionInput = form.querySelector(".input__question");
  questionInput.addEventListener("change", (e) => {
    e.preventDefault();
    const id = form.querySelector(".form__question").dataset.id;
    quizData.cards.filter((card) => card.id == id)[0].question =
      questionInput.value;
    addItemsToLocalStorage(quizData);

    drawCardsMenu();
  });

  const optionsInput = form.querySelectorAll(".options-item");
  for (let i = 0; i < optionsInput.length; i++) {
    optionsInput[i].addEventListener("change", (e) => {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value === "") {
        e.target.value = "";
        const optionCb = e.target.closest(".option").querySelector("button");
        if (optionCb) optionCb.classList.remove("active");
      }
      const id = form.querySelector(".form__question").dataset.id;
      const card = quizData.cards.filter((card) => card.id == id)[0];
      if (card.questionType === "Вписать ответ") card.answer = value;
      else if (card.questionType === "Викторина") card.options[i] = value;
      //else // true false
      addItemsToLocalStorage(quizData);
    });
  }
  if (mainCreationForm.classList.contains("d-none"))
    mainCreationForm.classList.remove("d-none");

  if (!flag) {
    const id = getNextCardId();
    quizData.cards.push({
      questionType: type,
      id: id,
      question: "",
      options: ["", "", "", ""],
      answer: "",
    });
    drawCardsMenu();
    addItemsToLocalStorage(quizData);
  }
}

let previewCards = [];
function drawCardsMenu() {
  previewCards = quizData.cards;
  cardsMenu.innerHTML = "";
  previewCards.forEach(({ id, question }) => {
    const menuCard = document.createElement("li");
    menuCard.className = "cards-menu__slide";
    menuCard.dataset.id = id;
    menuCard.innerHTML = `
      <p class="card-number">№ ${id}</p>
      <p class="card-title">${question}</p>
      <button data-id="${id}" class="card-delete-btn"></button>
    `;

    menuCard.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.classList.contains("card-delete-btn")) return;
      if (mainCreationForm.classList.contains("d-none")) {
        mainCreationForm.classList.remove("d-none");
        const typesWindow = creationMenu.querySelector(".types-window");
        if (typesWindow) typesWindow.classList.add("d-none");
      }
      const id = menuCard.dataset.id;
      const card = getCardFromQuizData(id);
      drawCard(
        card.questionType,
        card.id,
        card.question,
        card.options,
        card.answer
      );
      createCardWindow(card.questionType, true);
    });

    menuCard
      .querySelector(".card-delete-btn")
      .addEventListener("click", (e) => {
        e.preventDefault();
        deleteCardFromMenu(e.target.dataset.id);
      });
    cardsMenu.append(menuCard);
  });
}

function deleteCardFromMenu(id) {
  id = parseInt(id);
  const cards = quizData.cards;
  cards.splice(id - 1, 1);
  for (let i = id - 1; i < cards.length; i++) {
    cards[i].id -= 1;
  }
  drawCardsMenu();
  addItemsToLocalStorage(quizData);

  if (mainCreationForm.classList.contains("d-none")) return;

  if (cards.length === 0) {
    mainCreationForm.classList.add("d-none");
    showQuestionTypes();
    return;
  }

  id =
    currentCardId > cards.length || (currentCardId >= id && currentCardId != 1)
      ? currentCardId - 1
      : currentCardId;

  const card = getCardFromQuizData(id);
  drawCard(
    card.questionType,
    card.id,
    card.question,
    card.options,
    card.answer
  );
  createCardWindow(card.questionType, true);
}

function createTypeVict(id, question, options, answer) {
  let btns = ["", "", "", ""];
  if (answer) {
    for (let i = 0; i < options.length; i++) {
      if (options[i] == answer) btns[i] = " active";
    }
  }
  form.innerHTML = `
  <div class="form__question" data-id=${id}>
    <p class="card-number">№ ${id}</p>
    <input value="${question}" type="text" id="question" name="question" class="input__question" placeholder="Введите вопрос...">
  </div>

  <div class="options">
    <div class="option option-one">
      <button id="option1-cb" class="option-cb${btns[0]}"></button>
      <input value="${options[0]}" type="text" id="option1" name="options" class="options-item" placeholder="Вариант №1...">
    </div>

    <div class="option option-two">
      <button id="option2-cb" class="option-cb${btns[1]}"></button>
      <input value="${options[1]}" type="text" id="option2" name="options" class="options-item" placeholder="Вариант №2...">
    </div>

    <div class="option option-three">
      <button id="option3-cb" class="option-cb${btns[2]}"></button>
      <input value="${options[2]}" type="text" id="option3" name="options" class="options-item" placeholder="Вариант №3...">
    </div>

    <div class="option option-four">
      <button id="option4-cb" class="option-cb${btns[3]}"></button>
      <input value="${options[3]}" type="text" id="option4" name="options" class="options-item" placeholder="Вариант №4...">
    </div>
  </div>
  `;
}

function createTypeEnter(id, question, answer) {
  form.innerHTML = `
  <div class="form__question" data-id=${id}>
    <p class="card-number">№ ${id}</p>
    <input value="${question}" type="text" id="question" name="question" class="input__question" placeholder="Введите вопрос...">
  </div>

  <div class="options">
    <div class="option option-one">
      <input value="${answer}" type="text" id="answer" name="answer" class="options-item" placeholder="Ответ...">
    </div>
  </div>
  `;
}

function createTypeTF(id, question, answer) {
  let trueBtn = "";
  let falseBtn = "";
  if (answer === "правда") trueBtn = " active";
  else if (answer === "ложь") falseBtn = " active";

  form.innerHTML = `
  <div class="form__question" data-id=${id}>
    <p class="card-number">№ ${id}</p>
    <input value="${question}" type="text" id="question" name="question" class="input__question" placeholder="Введите вопрос...">
  </div>

  <div class="options">
    <div class="option option-one">
      <button id="option1-cb" class="option-cb${trueBtn}"></button>
      <p>Правда</p>
    </div>

    <div class="option option-two">
      <button id="option2-cb" class="option-cb${falseBtn}"></button>
      <p>Ложь</p>
    </div>
  </div>
  `;
}

function getCardFromQuizData(id) {
  const cards = quizData.cards;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].id == id) return cards[i];
  }
}

if (!localStorage.getItem("quizData") || getItemsFromLocalStorage("quizData").cards.length === 0) {
  showQuestionTypes();
} else {

  quizData = getItemsFromLocalStorage("quizData");
  drawCardsMenu();

  const card = getCardFromQuizData(getNextCardId() - 1);
  drawCard(
    card.questionType,
    card.id,
    card.question,
    card.options,
    card.answer
  );
  createCardWindow(card.questionType, true);
  quizTitleInput.textContent = quizData.title;
  mainCreationForm.classList.remove("d-none");
}


quizTitleInput.addEventListener("change", (e) => {
  quizData.quizTitle = e.target.value;
  addItemsToLocalStorage(quizData);
});








const finishButton = document.querySelector("#create-vict");

function findMistake() {
  const cards = quizData.cards;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (card.question === "") {
      alert(`Отсутсвует вопрос в карточке №${card.id}`);
      return true;
    }
    if (card.answer === "") {
      if (card.questionType === "Вписать ответ")
        alert(`Не введён ответ в карточке №${card.id}`);
      else alert(`Не выбран ответ в карточке №${card.id}`);
      return true;
    }
    // card.questionType,
    // card.id,
    // card.question,
    // card.options,
    // card.answer
  }
  return false;
}


finishButton.addEventListener("click", () => {
  if (findMistake()) return;
  finalWindow.classList.remove("d-none");
});



async function create() {
    const vict = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
    };
    // fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix fix 
    await fetch("api/myquizes/", vict)
        .then((response) => response.json())
        .then((data) => {
            if (data.id !== "") {
                alert("Викторина успешно сохранена");
                quizData = {};
                localStorage.removeItem("quizData");

                const myVicts = getItemsFromLocalStorage("myVicts");
                const item = {
                    id: data.id,
                    name: data.name,
                }
                myVicts.push(item);
                localStorage.setItem("myVicts", JSON.stringify(myVicts));

                window.location.href = 'vict.html';
            } else {
                alert("Ошибка. Викторина не была сохранена");
            }
        }
        );
}

finalWindow.querySelector(".btn-title-save").addEventListener("click", () => {
    if (quizTitleInput.value.trim() === "") {
        alert("Введите непустое название викторины");
        quizTitleInput.value = "";
        return;
    }
    create();
});

finalWindow.querySelector(".btn-title-back").addEventListener("click", () => {
  finalWindow.classList.add("d-none");
});
