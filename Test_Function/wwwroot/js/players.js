

/////////// Сверху пока юзлесс

let userAuthorized = false;
async function findPlayer() {
  const id = uinf.id;
  if (id){
    await fetch(`/api/activequiz/getusers/${window.location.search}`)//Тут всех надо поставить
    .then((response) => response.json())
    .then(async (data) => {
      const player = data.filter((user) => user.id === id);
      if (player.length != 0) {
        userAuthorized = true;
        checkUsers();
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname},),
    };
    await fetch(`/api/activequiz/connectuser/${window.location.search}`, user)
    .then((response) => response.json())
        .then(async (data) => {

      userAuthorized = true;
      localStorage.setItem(
        "uinf",
        JSON.stringify({ nickname , id: data })
      );
      await checkUsers();
    });
};

async function getUsersList() {
    await fetch(`/api/activequiz/getusers/${window.location.search}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawUsers(data);
    });
}

async function drawUsers(usersList) {
  interface.innerHTML = `
    <h3 class="users-count">Всего участников: ${usersList.length}</h3>
  `;
  const usersContainer = document.createElement("div");
  for (const user of usersList) {
    const userCard = document.createElement("div");
    const userName = document.createElement("p");
    userName.textContent = user.nickname;

    // для наглядности, без стилей, убрать
    const aaa = document.createElement("button");
    aaa.append(userName);
    userCard.append(aaa);

    // вернуть
    // userCard.append(userName);
    usersContainer.append(userCard);
  }
  interface.append(usersContainer);
}

async function checkUsers() {
  const delay = 3000;
  let timerId = setTimeout(function tick() {
    console.log("Checking");
    getUsersList();
    timerId = setTimeout(tick, delay);
  }, 0);
}
