console.log(window.location)


// Страница со всеми викторинами
if (window.location.pathname === '/allVicts.html') {
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
            card.className = "quiz";
            card.dataset.id = id;
            card.innerHTML = `
          <h3 class="quiz__title">${name}</h3>
          <div class="quiz__buttons">
            <button type="button" class="button btn-start" data-id=${id}>
              <span class="btn-start-text">Начать</span>
            </button>
            <button type="button" class="button btn-view" data-id=${id}>
              <span class="btn-view-text">Ознакомиться</span>
            </button>
          </div>
      `;
            quizBlock.append(card);

            const start = card.querySelector(".btn-start");
            start.addEventListener("click", () => {
                window.location.href = 'quiz-creator.html' + '?id=' + start.dataset.id;
            });

        });
    }

    function startQuiz() {

    }
    getVicts();


}
////////////////////////////////////////////////////////////////


// Страница создателя викторины
async function quizCreator() {
    let name = "";
    let link = "";
    const id = window.location.search.split('=')[1];
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

    const quiz = document.querySelector('.quiz-windows');

    const quizTitle = document.createElement('h1');
    quizTitle.innerHTML = `${name}`;

    const quizLink = document.createElement('p');
    quizLink.innerHTML = `${link}`;

    const users = document.createElement('div');
    //users.classList.add('users-list');
    const usersTitle = document.createElement('h2');
    usersTitle.innerHTML = `Участники`;
    users.append(usersTitle);

    quiz.append(quizLink);

    const btn = document.createElement('button');
    btn.innerHTML = `
    <span>Начать</span>
  `;
    btn.addEventListener('click', () => {
        const start = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
        };
        
    let splited = link.split('=')
    let currentId = splited[splited.length - 1]
    console.log(currentId)
    fetch(`/api/activequiz/startquiz/${currentId}`, start);

    });

    quiz.append(quizTitle);
    quiz.append(users);
    quiz.append(btn);
}

if ((window.location.pathname) === ('/quiz-creator.html')) {
    quizCreator();
}
////////////////////////////////////////////////////////////////


// Страница участника викторины
async function victGoing() {
    await fetch('../json/aaa.json')
        .then(response => response.json())
        .then(data => {
            const card = document.querySelector('.question-info');
            const questionContent = document.createElement('div');

            const question = document.createElement('p');
            question.textContent = data.question;

            const answers = document.createElement('div');
            // answers.classList.add('row', 'col-6');
            for (let i = 0; i < data.answers.length; i++) {
                const answer = document.createElement('button');
                // answer.classList.add('col-6');
                answer.dataset.id = i;
                answer.textContent = data.answers[i];
                answers.append(answer);
            }
            questionContent.append(question);
            questionContent.append(answers);
            card.append(questionContent);
        });
    document.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
            // Отправка ответа пользователя на сервер
            console.log(`Ответ ${btn.dataset.id}(${btn.textContent}) отправлен`);
        });
    });
}

if (window.location.pathname === '/vict-going.html') {
    victGoing();
}
////////////////////////////////////////////////////////////////