const timeForQuestion = 20000;
let timerStartDif = 0;

async function showQuestion() {
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

  const { id, card, dateTime } = cardInfo;
    timerStartDif = new Date().getTime() - new Date(dateTime).getTime();
    console.log(dateTime);
    console.log(timerStartDif)
  startTime();


  const cardForm = document.createElement("div");
  cardForm.className = "vict-card";
  cardForm.dataset.id = id;
  cardForm.innerHTML = `
    <p>${card.question}</p>
    <div data-id="${card.id}">
      <button>${card.options[0]}</button>
      <button>${card.options[1]}</button>
      <button>${card.options[2]}</button>
      <button>${card.options[3]}</button>
    </div>
  `;

  cardForm.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (answerSent) return;
      // добавить стиль для выбранного ответа
      const cardId = btn.closest("div").dataset.id;
      const victId = document.querySelector(".vict-card").dataset.id;
      const userId = JSON.parse(localStorage.getItem("uinf")).id;
      const option = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          cardId,
          victId,
          answer: btn.textContent,
        }),
      };
      await fetch(`/api/activequiz/card/${window.location.search}`, option).then(
        (response) => (answerSent = true)
      );
      cardForm.querySelectorAll("button").forEach((btn) => {
        btn.setAttribute("disabled", "");
      });
    });
  });
  interface.append(cardForm);
}

let answerSent = false;

async function chooseAnswer() {}

const interface = document.querySelector(".player-interface");
showQuestion();

async function request() {
  localStorage.removeItem("dt");
  await fetch(`/api/activequiz/card/nextcard/${window.location.search}`).then(
    (response) => location.reload()
  );
}

function startTime() {
    screenTimer();
  setTimeout(function tick() {
    request();
  }, timeForQuestion - timerStartDif);
}

async function startTimer(duration, display) {
  let timer = duration;
  let seconds = parseInt(timer % 60, 10);

  seconds = seconds < 10 ? "0" + seconds : seconds;

  display.textContent = seconds;

  if (--timer < 0) {
    //clearInterval(interval);
    display.textContent = "Время вышло!";
    cardForm.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", "");
    });
  }
}

// Запуск таймера после загрузки страницы
function screenTimer () {
  console.log(timerStartDif, "/", timeForQuestion - timerStartDif);

  let time = timeForQuestion - timerStartDif;
  let screenTimer = Math.floor(time / 1000);
  let display = document.querySelector("#time");

  setTimeout(function aaa() {
    startTimer(screenTimer, display);
    screenTimer -= 1;
    setTimeout(aaa, 1000);
  }, time % 1000);
};
