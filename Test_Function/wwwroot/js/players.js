localStorage.removeItem("answer");

let userAuthorized = false;
async function findPlayer() {
  const id = uinf.id;
  if (id) {
    await fetch(`/api/activequiz/user/${window.location.search}`) //Тут всех надо поставить
      .then((response) => response.json())
      .then(async (data) => {
        const player = data.filter((user) => user.id === id);
        if (player.length != 0) {
          userAuthorized = true;
          showUsers();
        }
      });
  }
}

function getItemsFromLocalStorage(id) {
  const itemsString = localStorage.getItem(id);
  if (itemsString) {
    return JSON.parse(itemsString);
  } else {
    return [];
  }
}

const uinf = getItemsFromLocalStorage("uinf");
if (uinf) findPlayer();

const interface = document.querySelector(".player-interface");

const inputWindow = document.createElement("div");
inputWindow.className = "input-window";

const input = document.createElement("input");
input.className = "input-nickname";
input.type = "text";
input.name = "nickname";
input.id = "nickname";
input.placeholder = "Введите имя";

const submit = document.createElement("input");
submit.className = "submit-nickname";
submit.type = "submit";
submit.value = "Присоединиться";

inputWindow.append(input, submit);
interface.append(inputWindow);

//let usersList = {};

submit.onclick = async () => {
  const nickname = input.value;
  if (nickname.trim() == "") return;
  const user = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  };
  await fetch(`/api/activequiz/user/${window.location.search}`, user)
    .then((response) => response.json())
    .then(async (data) => {
      userAuthorized = true;
      localStorage.setItem("uinf", JSON.stringify({ nickname, id: data }));
      showUsers();
    });
};

function showUsers() {
  interface.innerHTML = "";

  const btnBlock = document.createElement("div");
  btnBlock.className = "btn-block";

  const waitText = document.createElement("h2");
  waitText.className = "wait-text";
  waitText.textContent = "Ожидайте начала";


  const exitBtn = document.createElement("button");
  exitBtn.className = "btn-exit";
  exitBtn.textContent = "Покинуть сессию";
  exitBtn.onclick = async () => {
    const uinf = localStorage.getItem("uinf");
      const id = JSON.parse(localStorage.getItem("uinf")).id;
      const user = {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(id),
      };
    await fetch(`/api/activequiz/user/${window.location.search}`, user);
    window.location.href = "/";
  }

  const players = document.createElement("div");
  players.className = "col-12 players";

  btnBlock.append(exitBtn);
  interface.append(btnBlock, waitText, players);

  checkUsers();
}

async function getUsersList() {
  await fetch(`/api/activequiz/user/${window.location.search}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawUsers(data);
    });
}

async function drawUsers(playersList) {
  const players = document.querySelector(".players");
  players.innerHTML = `
    <h3 class="players-count">Всего участников: ${playersList.length}</h3>
    `;
  const playersContainer = document.createElement("div");
  playersContainer.className = "row col-12 players-list";
  for (const player of playersList) {
    const playerCard = document.createElement("div");
    playerCard.className = "col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-3 player-card";

    const playerCardContent = document.createElement("div");
    playerCardContent.className = "col-11 player-card-content";

    const playerName = document.createElement("p");
    playerName.className = "col-12 player-card-name";
    playerName.textContent = player.nickname;

    playerCardContent.append(playerName);
    playerCard.append(playerCardContent);
    playersContainer.append(playerCard);
  }
  players.append(playersContainer);
}

async function checkUsers() {
  const delay = 1000;
  let timerId = setTimeout(function tick() {
    console.log("Checking");
    getUsersList();
    isQuizStarted();
    timerId = setTimeout(tick, delay);
  }, 0);
}

async function isQuizStarted() {        
  await fetch(`/api/activequiz/started/${window.location.search}`)
    .then((response) => response.json())
    .then(async (data) => {
      if (data === true) location.reload();
    });
}
