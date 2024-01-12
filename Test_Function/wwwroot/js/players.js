/////////// Сверху пока юзлесс

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

const input = document.createElement("input");
input.type = "text";
input.name = "nickname";
input.id = "nickname";
input.placeholder = "Введите имя";

const submit = document.createElement("input");
submit.type = "submit";
submit.value = "Присоединиться";

interface.append(input, submit);

//let usersList = {};

submit.onclick = async () => {
  const nickname = input.value;
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

  const exitBtn = document.createElement("button");
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
  players.className = "players";

  btnBlock.append(exitBtn);
  interface.append(btnBlock);
  interface.append(players);

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
    <h3 class="users-count">Всего участников: ${playersList.length}</h3>
    `;
  const playersContainer = document.createElement("div");
  for (const player of playersList) {
    const playerCard = document.createElement("div");
    const playerName = document.createElement("p");
    playerName.textContent = player.nickname;

    // для наглядности, без стилей, убрать
    const aaa = document.createElement("button");
    aaa.append(playerName);
    playerCard.append(aaa);
    //

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
