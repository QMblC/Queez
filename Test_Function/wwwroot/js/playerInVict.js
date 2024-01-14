const timeForQuestion = 20000;
const timeForCorrectAnswer = 5000;
let timeForResultTable = 10000;
const timeTotalQuestion = timeForQuestion + timeForCorrectAnswer;
const totalTime = timeForQuestion + timeForCorrectAnswer + timeForResultTable;
let timerOffset = 0;
let cardStartDateTime;

let answerSent = false;
let questionIsEnd = false;

let cardIsLast = false;

const interface = document.querySelector(".player-interface");
const timerForPlayer = document.querySelector("#time");
const timerText = document.querySelector(".timer__text");

// Можно добавить общее время, после которого всё закончится
function startTimer(currentStepTime) {
  setTimeout(() => {
    localStorage.removeItem("answer");
    if (cardIsLast) return;
    nextCard();
  }, currentStepTime - timerOffset);
}
////////////////////////////////

async function main() {
  let date = new Date();
  const dateBody = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(date.toISOString()),
  };
  const cardInfo = await fetch(
    `/api/activequiz/card/${window.location.search}`,
    dateBody
  ).then((res) => res.json());

  const { id, card, dateTime, isLast, type } = cardInfo;
  cardIsLast = isLast;
  cardStartDateTime = new Date(dateTime).getTime();
  const nowTime = new Date().getTime();

  if (nowTime - cardStartDateTime > timeTotalQuestion) {
    //console.log("timeTotalQuestion");
    timerOffset = nowTime - (cardStartDateTime + timeTotalQuestion);
    showResultTable();
    startTimer(totalTime - timeTotalQuestion);
  } else if (nowTime - cardStartDateTime > timeForQuestion) {
    //console.log("timeForQuestion");
    timerOffset = nowTime - (cardStartDateTime + timeForQuestion);
    showCorrectAnswer();
    startTimer(totalTime - timeForQuestion);
  } else {
    //console.log("else");
    timerOffset = nowTime - cardStartDateTime;
    showQuestion(id, card, type);
    startTimer(totalTime);
  }
}

main();

async function nextCard() {
  localStorage.removeItem("dt");
  await fetch(`/api/activequiz/card/nextcard/${window.location.search}`).then(
    (response) => location.reload()
  );
}

// Таблица с результатами

async function setResultScreenTime(duration) {
  if (duration === -1) return;
  let timerForPlayer = document.querySelector("#time");
  timerForPlayer.textContent = duration;
  if (duration <= 0) {
    timerText.innerHTML = `Загружаем *_*`;
    document.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", "");
    });
  }
}

async function startResultScreenTimer() {
  let time = timeForResultTable - timerOffset;
  let screenTimer = Math.floor(time / 1000);
  timerText.innerHTML = `До следующего вопроса <span id="time"></span> сек.`;
  if (cardIsLast) {
    timerText.innerHTML = `Вопросы закончились *_*`;
    return;
  }
  setTimeout(async function aaa() {
    // timerText.innerHTML = `Осталось <span id="time">0</span> сек.`;
    setResultScreenTime(screenTimer);

    //синхронизация при каждом заходе
    timerOffset =
      new Date().getTime() - (cardStartDateTime + timeTotalQuestion);
    time = timeForResultTable - timerOffset;
    screenTimer = Math.floor(time / 1000);

    setTimeout(aaa, 1000);
  }, time % 1000);
}

async function deleteQuiz() {
  await fetch(`/api/activequiz/delete/${window.location.search}`);
}

async function showResultTable() {
  // await fetch(`/api/activequiz/score/${window.location.search}`)
  //   .then((response) => response.json())
  //   .then((data) => drawPlayersTable(data));
  getUsersAndScores();
  startResultScreenTimer();
  if (cardIsLast) {
    await deleteQuiz();
    // nextCard();
  }
}

function drawPlayersTable(playersList) {
  interface.innerHTML = ``;
  for (const player of playersList) {
    const playerCard = document.createElement("div");
    const playerName = document.createElement("p");
    const playerScore = document.createElement("p");
    playerName.textContent = player.nickname;
    playerScore.textContent = player.score;

    // для наглядности, без стилей, убрать
    const aaa = document.createElement("button");
    aaa.textContent = `${player.nickname} ${player.score}`;
    playerCard.append(aaa);

    // вернуть
    // playerCard.append(playerName);
    interface.append(playerCard);
  }
}

//////////////// Для отображения правильно ответа на экране с вопросом
async function startTimeAfterQuestion() {
  console.log("startTimeAfterQuestion");
  setTimeout(() => {
    timerForPlayer.textContent = Math.floor(timeForResultTable / 1000);
    showResultTable();
  }, timeForCorrectAnswer - (new Date().getTime() - (cardStartDateTime + timeForQuestion)));
}

async function showCorrectAnswer() {
  const id = JSON.parse(localStorage.getItem("uinf")).id;
  const user = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(id),
  };
  const { userAnswer, correctAnswer } = await fetch(
    `api/activequiz/user/answer/${window.location.search}`,
    user
  ).then((response) => response.json());

  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", function () {});
    if (btn.textContent === correctAnswer) {
      // btn.classList.add("correct");
      btn.classList.remove("not-choosen");
      btn.classList.add("choosen");
    } else {
      // btn.classList.add("incorrect");
      btn.classList.remove("choosen");
      btn.classList.add("not-choosen");
    }
  });

  const answerText = document.createElement("p");
  answerText.className = "col-12 answer-text";
  answerText.textContent = `Правильный ответ: ${correctAnswer}`;
  document.querySelector(".question").after(answerText);

  startTimeAfterQuestion();
}

//////////////// Для вопроса

async function getCard(card, type) {
  console.log(type);
  switch (type) {
    case "Викторина":
      return `
      <div class="col-12 question">
        <h3 class="col-12 question-text">${card.question}</h3>
      </div>
      <div class="col-12 row options" data-id="${card.id}">
        <div class="col-12 col-sm-12 col-md-6 option">
          <button class="col-12 option-btn option-one">${card.options[0]}</button>
        </div>
        <div class="col-12 col-sm-12 col-md-6 option">
          <button class="col-12 option-btn option-two">${card.options[1]}</button>
        </div>
      </div>
      <div class="col-12 row options" data-id="${card.id}">
        <div class="col-12 col-sm-12 col-md-6 option">
          <button class="col-12 option-btn option-three">${card.options[2]}</button>
        </div>
        <div class="col-12 col-sm-12 col-md-6 option">
          <button class="col-12 option-btn option-four">${card.options[3]}</button>
        </div>
      </div>
      `;

    case "Вписать ответ":
      return `
      <div class="col-12 question">
        <h3 class="col-12 question-text">${card.question}</h3>
      </div>
      <div class="col-12 input-answer-container" data-id="${card.id}">
        <div class="col-12 col-sm-12 col-md-10 input-answer-content">
          <input class="col-12 input-answer" placehold="Впишите ответ">
          <button class="col-12 send-input-answer-btn">Отправить</button>
        </div>
      </div>
    `;
    case "Правда / Ложь":
      return `
      <div class="col-12 question">
        <h3 class="col-12 question-text">${card.question}</h3>
      </div>
      <div class="col-12 row true-false-container" data-id="${card.id}">
        <div class="col-12 col-sm-12 col-md-6 true-false-option">
          <button class="col-12 option-tf option-true">Правда</button>
        </div>
        <div class="col-12 col-sm-12 col-md-6 true-false-option">
          <button class="col-12 option-tf option-false">Ложь</button>
        </div>
      </div>
    `;
  }
}

async function showQuestion(id, card, type) {
  const cardForm = document.createElement("div");
  cardForm.className = "col-12 vict-card";
  cardForm.dataset.id = id;

  cardForm.innerHTML = await getCard(card, type);

  cardForm.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (answerSent) return;
      // добавить стиль для выбранного ответа
      let cardId;
      let answer;
      switch (type) {
        case "Викторина":
          cardId = btn.closest(".options").dataset.id;
          answer = btn.textContent;
          break;
        case "Вписать ответ":
          cardId = btn.closest(".input-answer-container").dataset.id;
          answer = document.querySelector(".input-answer").value;
          break;
        case "Правда / Ложь":
          cardId = btn.closest(".true-false-container").dataset.id;
          answer = btn.textContent;
          break;
      }
      const victId = document.querySelector(".vict-card").dataset.id;
      const userId = JSON.parse(localStorage.getItem("uinf")).id;


      const option = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          cardId,
          victId,
          answer,
        }),
      };

      await fetch(
        `/api/activequiz/card/${window.location.search}`,
        option
      ).then((response) => (answerSent = true));
      localStorage.setItem("answer", JSON.stringify(answer));
      disableButtons(`${btn.textContent}`);
    });
  });
  interface.append(cardForm);

  startTimeForQuestion();
}

function disableButtons(answer = false) {
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.textContent == answer) btn.classList.add("choosen");
    else btn.classList.add("not-choosen");
    btn.setAttribute("disabled", "");
  });
}

// начало отчета времени для вопроса
async function startTimeForQuestion() {
  // localStorage.removeItem("answer");
  await startQuestionScreenTimer();
  setTimeout(() => {
    questionIsEnd = true;
    showCorrectAnswer();
  }, timeForQuestion - timerOffset);
}

// создание и начало отчета для таймера на экране
async function startQuestionScreenTimer() {
  let time = timeForQuestion - timerOffset;
  let screenTimer = Math.floor(time / 1000);
  setTimeout(async function aaa() {
    if (screenTimer < 0) return;
    await setQuestionScreenTime(screenTimer);

    //синхронизация при каждом заходе
    timerOffset = new Date().getTime() - cardStartDateTime;
    time = timeForQuestion - timerOffset;
    screenTimer = Math.floor(time / 1000);
    setTimeout(aaa, 1000);
  }, time % 1000);
}

// Обновление таймера на экране
async function setQuestionScreenTime(duration) {
  console.log("вопрос duration");
  timerForPlayer.textContent = duration;

  if (duration <= 0) {
    timerText.innerHTML = `Время вышло <span id="time"></span></p>`;
    document.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", "");
    });
  }
}

async function getUsersAndScores() {
  // добавить класс для Р и подправить Селектор

  // await fetch(`../json/players.json`)
  await fetch(`/api/activequiz/score/${window.location.search}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawPlayersIngame(data);
    });
}

function drawPlayersIngame(playersList) {
  const players = document.querySelector(".player-interface");
  players.innerHTML = ``;
  const sortedPlayers = playersList.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });
  const pray = document.createElement("div");
  pray.className = "col-12 ingame-players";
  for (const player of sortedPlayers) {
    const playerCard = document.createElement("div");
    playerCard.className =
      "col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-3 ingame-player-card";

    const playerCardContent = document.createElement("div");
    playerCardContent.className = "col-11 player-score-card-content";

    const playerName = document.createElement("p");
    playerName.className = "col-9 ingame-player-name";

    const playerScore = document.createElement("p");
    playerScore.className = "col-3 ingame-player-score";

    playerName.textContent = player.nickname;
    playerScore.textContent = player.score;

    playerCardContent.append(playerName, playerScore);
    playerCard.append(playerCardContent);
    pray.append(playerCard);
  }
  players.append(pray);
}
