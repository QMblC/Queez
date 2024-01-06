const interface = document.querySelector('.player-interface');

async function showQuestion() {
  const cardInfo = await fetch("../json/players.json").then((res) => res.json());
  const {id, card} = cardInfo;
  const cardForm = document.createElement('div');
  cardForm.className = '';
  cardForm.dataset.id = id;
  cardForm.innerHTML = `
    <p>${card.question}</p>
    <div data-id="${card.id}">
      <button>${card.answers[0]}</button>
      <button>${card.answers[1]}</button>
      <button>${card.answers[2]}</button>
      <button>${card.answers[3]}</button>
    </div>
  `; 

  document.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const cardId = btn.closest('div').dataset.id;
      const victId = cardId.closest('div').dataset.id;
      const option = {
        method: 'POST',
        body: JSON.stringify(
          {
            cardId,
            victId,
            "answer": btn.textContent
          }
        )
      };
      await fetch('https://jsonplaceholder.typicode.com/users', option)
      .then(response => response.json())
      .then(json => console.log(json))
      
    });
  })
  interface.append(cardForm);
}
showQuestion();