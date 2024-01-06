console.log(window.location)


// Страница со всеми викторинами
if (window.location.pathname === '/allVicts.html') {
    function getVicts() {
        fetch("/testing/")
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
    let currentQuiz = {};
    const id = window.location.search.split('=')[1];
    await fetch("/testing/")
        .then((response) => {
            // if (!response.ok) {
            //   throw new Error()
            // }
            return response.json();
        })
        .then((data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    currentQuiz = data[i];
                    break;
                }
            }
        });
    console.log(currentQuiz);

    const quiz = document.querySelector('.quiz-windows');

    const quizTitle = document.createElement('h1');
    quizTitle.innerHTML = `${currentQuiz.name}`;

    const users = document.createElement('div');
    //users.classList.add('users-list');
    const usersTitle = document.createElement('h2');
    usersTitle.innerHTML = `Участники`;
    users.append(usersTitle);

    const btn = document.createElement('button');
    btn.innerHTML = `
    <span>Начать</span>
  `;
    btn.addEventListener('click', () => {
        //window.location.href = "vict-going.html"

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