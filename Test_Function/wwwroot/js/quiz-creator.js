// window.onbeforeunload = function () {return "Лобби викторины будет утеряно";};
window.onbeforeunload = function () {
  return "Лобби викторины будет утеряно";
};

const quiz = document.querySelector(".quiz-windows");
const playerLink = document.querySelector(".player-link");
const victInfo = document.querySelector(".vict-info");
const players = document.querySelector(".players");
const playersTitle = document.querySelector(".players-title");
const playersCount = document.querySelector(".players-count");
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

  const createElement = document.createElement("div");
  createElement.className = "col-12 input-with-link";

  const quizLink = document.createElement("input");
  quizLink.className = "col-7 link-text";
  quizLink.type = "text";
  quizLink.value = `${link}`;
  quizLink.setAttribute("readonly", "true");
  createElement.append(quizLink);

  const copyLink = document.createElement("button");
  copyLink.className = "col-5 btn-copy-link";
  copyLink.innerHTML = `Копировать`;
  copyLink.onclick = () => {
    var copyText = document.querySelector(".link-text");
    copyText.select();
    document.execCommand("copy");
    // alert("Copied the text: " + copyText.value);
  };
  createElement.append(copyLink);

  playerLink.append(createElement);

  await getQr();

  victCode = "?" + link.split("?")[1];

  const quizTitle = document.createElement("h1");
  quizTitle.className = "col-12 quiz-title";
  quizTitle.innerHTML = `${name}`;
  victInfo.append(quizTitle);

  const btn = document.createElement("button");
  btn.className = "col-12 btn-start";
  btn.innerHTML = `
    <span>Начать</span>
  `;

  btn.addEventListener("click", async () => {
    if (document.querySelector(".players-count").textContent == 0){
      alert("Для начала викторины дождитесь хотя бы одного участника");
      return;
    }
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
  playersCount.innerHTML = ` ${usersList.length}`;
  for (const user of usersList) {
    const playerCard = document.createElement("div");
    playerCard.className =
      "col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-3 player-card";

    const playerCardContent = document.createElement("div");
    playerCardContent.className = "col-11 player-card-content";

    const playerName = document.createElement("p");
    playerName.className = "col-12 player-card-name";
    playerName.textContent = user.nickname;

    playerCardContent.append(playerName);
    playerCard.append(playerCardContent);
    playersList.append(playerCard);
  }
}

async function getUsersList() {
  // добавить класс для Р и подправить Селектор
  const link = quiz.querySelector(".link-text").value.split("?")[1];
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

async function drawInGameWindow() {
  victIsGoing = true;
  playerLink.remove();
  startGame.remove();
   await getActiveQuestion();
  await checkActiveQuestion();
  await checkUsersIngame();
}

async function checkActiveQuestion() {
  const delay = 2000;
  let timerId = setTimeout(async function tick() {
    await getActiveQuestion();
    timerId = setTimeout(tick, delay);
  }, 0);
}

async function checkUsersIngame() {
  const delay = 2000;
  let timerId = setTimeout(async function tick() {
    await getUsersAndScores();
    timerId = setTimeout(tick, delay);
  }, 0);
}

async function getUsersAndScores() {
  // добавить класс для Р и подправить Селектор

  // await fetch(`../json/players.json`)
  await fetch(`/api/activequiz/score/${victCode}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawPlayersIngame(data);
    });
}

function drawPlayersIngame(playersList) {
  const players = document.querySelector(".ingame-players");
  players.innerHTML = ``;
  const sortedPlayers = playersList.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

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
    players.append(playerCard);
  }
}

async function getQr() {
  const link = quiz.querySelector(".link-text");
  await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${link.value}&size=300x300&ecc=L`
  )
    .then((response) => response.url)
    .then(async (data) => {
      showImage(data);
    });
}

function showImage(src) {
  const qrBlock = document.createElement("div");
  qrBlock.className = "col-12 qr-block";
  const img = document.createElement("img");
  img.className = "qr-code";
  img.src = src;
  img.width = 200;
  img.height = 200;
  img.alt = "qr";

  qrBlock.appendChild(img);
  playerLink.appendChild(qrBlock);
}


async function getActiveQuestion() {
  let date = new Date();
  const dateBody = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(date.toISOString()),
  };
  const cardInfo = await fetch(
    `/api/activequiz/card/${victCode}`,
    dateBody
  ).then((res) => res.json());

  const { id, card, dateTime, isLast, type } = cardInfo;
  cardIsLast = isLast;

  // убрать ingame-option отсюда и добавить после запроса
  players.innerHTML = `
    <div class="col-12 ingame">
      <div class="col-12 ingame-card">
        <h2 class="ingame-question">${card.question}</h2>
        <div class="row ingame-options"></div>
      </div>
      <div class="col-12 ingame-players">

      </div>
    </div>
  `;

  document.querySelector(".ingame-options").innerHTML = getOptions(card.options, type);
}
function getOptions(options, type) {
  switch (type) {
    case "Викторина":
      return `
        <div class="col-12 col-sm-6 ingame-option">
        <p class="col-11 ingame-option-text option-one">${options[0]}</p>
        </div>
        
        <div class="col-12 col-sm-6 ingame-option">
        <p class="col-11 ingame-option-text option-two">${options[1]}</p>
        </div>
        
        <div class="col-12 col-sm-6 ingame-option">
        <p class="col-11 ingame-option-text option-three">${options[2]}</p>
        </div>
        
        <div class="col-12 col-sm-6 ingame-option">
        <p class="col-11 ingame-option-text option-four">${options[3]}</p>
        </div>
      `
    case "Вписать ответ":
      return ``
    case "Правда / Ложь":
      return `
        <div class="col-12 col-sm-6 ingame-option">
          <p class="col-11 ingame-option-text option-true">Правда</p>
        </div>
        
        <div class="col-12 col-sm-6 ingame-option">
          <p class="col-11 ingame-option-text option-false">Ложь</p>
        </div>
      `
  }
}

