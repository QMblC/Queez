async function showQuestion() {
  const cardInfo = await fetch("../json/playerInVict.json").then((res) =>
    res.json()
  );
  const { id, card } = cardInfo;
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
      const option = {
        method: "POST",
        body: JSON.stringify({
          cardId,
          victId,
          answer: btn.textContent,
        }),
      };
      console.log(option);
      await fetch("https://jsonplaceholder.typicode.com/users", option)
        .then((response) => response.json())
        .then((data) => console.log(1));
    });
  });
  interface.append(cardForm);
}

const interface = document.querySelector(".player-interface");
showQuestion();