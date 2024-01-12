// window.onbeforeunload = function () {return "Лобби викторины будет утеряно";};
window.onbeforeunload = function () {
  return "Лобби викторины будет утеряно";
};

const quiz = document.querySelector(".quiz-windows");
const playerLink = document.querySelector(".player-link");
const victInfo = document.querySelector(".vict-info");
const players = document.querySelector(".players");
const playersTitle = document.querySelector(".players-title");
const playersList = document.querySelector(".players-list");
const startGame = document.querySelector(".start-game");

let victCode;

async function quizCreator() {
  let name = "";
  let link = "";
  const id = window.location.search.split("=")[1];
  await fetch(`/api/activequiz/link/${id}`)
    .then((response) => {
      // if (!response.ok) {
      //   throw new Error()
      // }
      return response.json();
    })
    .then((data) => {
      name = data.name;
      link = data.link;
    });
  //Тут я тестил
  //var date = new Date();
  //console.log(JSON.stringify(date.toISOString()));

  const quizLink = document.createElement("p");
  quizLink.innerHTML = `${link}`;
  playerLink.append(quizLink);

  victCode = "?" + link.split("?")[1];

  const quizTitle = document.createElement("h1");
  quizTitle.innerHTML = `${name}`;
  victInfo.append(quizTitle);

  const btn = document.createElement("button");
  btn.innerHTML = `
    <span>Начать</span>
  `;
  btn.addEventListener("click", async () => {
    const start = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    };

    let splited = link.split("=");
    let currentId = splited[splited.length - 1];
    await fetch(`/api/activequiz/startquiz/${currentId}`, start);

    drawInGameWindow();
  });
  startGame.append(btn);

  checkUserOnStartScreen();
}

async function drawPlayers(usersList) {
  playersList.innerHTML = ``;
  for (const user of usersList) {
    const playerCard = document.createElement("div");
    const playerName = document.createElement("p");
    playerName.textContent = user.nickname;

    // для наглядности, без стилей, убрать
    const aaa = document.createElement("button");
    aaa.append(playerName);
    playerCard.append(aaa);

    // вернуть
    // playerCard.append(playerName);
    playersList.append(playerCard);
  }
}

async function getUsersList() {
  // добавить класс для Р и подправить Селектор
  const link = quiz.querySelector("p").innerHTML.split("?")[1];
  await fetch(`/api/activequiz/user/?${link}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawPlayers(data);
    });
}

let victIsGoing = false;
function checkUserOnStartScreen() {
  const delay = 1000;
  let timerId = setTimeout(async function tick() {
    //console.log("Checking");
    if (!victIsGoing) {
      await getUsersList();
      timerId = setTimeout(tick, delay);
    }
  }, delay);
}

quizCreator();

function drawInGameWindow() {
  victIsGoing = true;
  //playerLink.remove();
  startGame.remove();
  players.innerHTML = `
    <div class="ingame">
      <div class="ingame-question">Где-то тут будет вопрос</div>
      <div class="ingame-players">Где-то тут будет список</div>
    </div>
  `;
  checkUsersIngame();
}

function checkUsersIngame() {
  const delay = 1000;
  let timerId = setTimeout(async function tick() {
    await getUsersAndScores();
    timerId = setTimeout(tick, delay);
  }, 0);
}

async function getUsersAndScores() {
    // добавить класс для Р и подправить Селектор
  await fetch(`/api/activequiz/score/${victCode}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawPlayersIngame(data);
    });
}

function drawPlayersIngame(playersList) {
  const players = document.querySelector(".ingame-players");
  players.innerHTML = ``;
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
    players.append(playerCard);
  }
}
