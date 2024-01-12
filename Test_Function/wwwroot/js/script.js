
// Страница участника викторины
async function victGoing() {
  await fetch("../json/aaa.json")
    .then((response) => response.json())
    .then((data) => {
      const card = document.querySelector(".question-info");
      const questionContent = document.createElement("div");

      const question = document.createElement("p");
      question.textContent = data.question;

      const answers = document.createElement("div");
      // answers.classList.add('row', 'col-6');
      for (let i = 0; i < data.answers.length; i++) {
        const answer = document.createElement("button");
        // answer.classList.add('col-6');
        answer.dataset.id = i;
        answer.textContent = data.answers[i];
        answers.append(answer);
      }
      questionContent.append(question);
      questionContent.append(answers);
      card.append(questionContent);
    });
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Отправка ответа пользователя на сервер
      console.log(`Ответ ${btn.dataset.id}(${btn.textContent}) отправлен`);
    });
  });
}

if (window.location.pathname === "/vict-going.html") {
  victGoing();
}
////////////////////////////////////////////////////////////////
