async function showQuestion() {
    var date = new Date();
    const dateBody = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(date.toISOString()),
    };
    const cardInfo =
        await fetch(`/api/activequiz/card/${window.location.search}`, dateBody)
            .then((res) =>
    res.json()
        );
  //Тут я добавил отправку/времени(вроде utc)
    const { id, card, dateTime } = cardInfo;
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
      console.log("click");
      const cardId = btn.closest("div").dataset.id;
      const victId = document.querySelector(".vict-card").dataset.id;
      const userId = JSON.parse(localStorage.getItem("uinf")).id;
      const option = {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId,
              cardId,
              victId,
              answer: btn.textContent,
        }),
      };
      console.log(option);
        await fetch(`/api/activequiz/card/${window.location.search}`, option)
        .then((response) => response.json())
        .then((data) => console.log(1));
    });
  });
  interface.append(cardForm);
}

const interface = document.querySelector(".player-interface");
showQuestion();

async function request() {
    await fetch(`/api/activequiz/card/nextcard/${window.location.search}`)
        .then((response) => location.reload()) ;
}


setTimeout(function tick() {
        request();
    }, 5000);

