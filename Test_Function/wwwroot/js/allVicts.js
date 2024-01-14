// Страница со всеми викторинами
function getVicts() {
  fetch("/api/quizes/")
    .then((res) => res.json())
    .then((result) => {
      render(result);
    });
}
const quizBlock = document.querySelector(".quizzes");

function render(victs) {
  victs.forEach(({ id, name }) => {
    const card = document.createElement("div");
    card.className = "quiz col-6 col-md-4 col-lg-3";
    card.dataset.id = id;
    card.innerHTML = `
    <div class="quiz__content">
          <h3 class="quiz__title">${name}</h3>
          <div class="quiz__buttons">
            <button type="button" class="button btn-start" data-id=${id}>
              <span class="btn-start-text">Начать</span>
            </button>
            <button type="button" class="button btn-view" data-id=${id}>
              <span class="btn-view-text">Ознакомиться</span>
            </button>
          </div>
    </div>
      `;
    quizBlock.append(card);

    const start = card.querySelector(".btn-start");
    start.addEventListener("click", () => {
      window.location.href = "quiz-creator.html" + "?id=" + start.dataset.id;
    });
  });
}

function startQuiz() {}

getVicts();
