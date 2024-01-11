using Microsoft.AspNetCore.Http;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using QueezServer.QuizStructure;
using QueezServer.QuizStructure.QuizState;

namespace QueezServer.API
{

    public  class ActiveQuiz
    {
        public Dictionary<string, Quiz> Quizes = new();

        public async Task HandleRequest(HttpResponse response, HttpRequest request)
        {
            var idExpression = @"\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}";

            var path = request.Path.Value;
            var queryString = request.QueryString.ToString();

            if (request.Method == "PUT" && Regex.IsMatch(path, @"api/activequiz/card/$") && Regex.IsMatch(queryString, idExpression))
                await SetUserAnswer(response, request);
            else if (request.Method == "POST" && Regex.IsMatch(path, @"api/activequiz/card/$") && Regex.IsMatch(queryString, idExpression))
                await GetCard(response, request);
            else if (request.Method == "GET" && Regex.IsMatch(path, @"api/activequiz/user/$") && Regex.IsMatch(queryString, idExpression))
                await GetQuizUsers(response, request);
            else if (request.Method == "POST" && Regex.IsMatch(path, @"api/activequiz/user/$") && Regex.IsMatch(queryString, idExpression))
                await ConnectQuiz(response, request);
            else if (Regex.IsMatch(path, @"api/activequiz/link/"))
                await CreateLobby(response, request);
            else if (Regex.IsMatch(path, @"/api/activequiz/startquiz/" + idExpression))
                await StartQuiz(response, request);
            else if (Regex.IsMatch(path, @"/api/activequiz/card/nextcard/"))
                await NextCard(response, request);
            else
                await response.SendFileAsync("Queez/quiz-creator.html");
        }

        public async Task CreateLobby(HttpResponse response, HttpRequest request)
        {
            var id = request.Path.Value?.Split("/")[^1];

            if (id != null)
            {
                if (AllVictsHandler.Quizes.ContainsKey(id))
                {
                    var quiz = new Quiz(id);
                    AllVictsHandler.Quizes[id].CopyTo(quiz);

                    var currentId = quiz.Id + Guid.NewGuid().ToString();
                    Quizes[currentId] = quiz;
                    var json = new Dictionary<string, string>
                    {
                        ["name"] = quiz.Name,
                        ["link"] = "https://localhost:7290/players.html?id=" + currentId
                    };

                    await response.WriteAsJsonAsync(json);
                }
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync("Пользователь не найден");
                }
            }
            else
            {
                response.StatusCode = 404;
                await response.WriteAsJsonAsync("Некорректный ID");
            }
        }

        public async Task StartQuiz(HttpResponse response, HttpRequest request)
        {
            var id = request.Path.Value?.Split("/")[^1];
            if (Quizes.ContainsKey(id))
            {
                Quizes[id].IsStarted = true;
                Quizes[id].QuizState = new ActiveQuizState();
            }
            else
            {
                response.StatusCode = 404;
                await response.WriteAsJsonAsync("Не найдена активная викторина");
            }
        }

        public async Task NextCard(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];
            if (quizId != null)
            {
                
                Quizes[quizId].QuizState = new ActiveQuizState();
                Quizes[quizId].NextCard();
                Quizes[quizId].StartTime = null;
            }
            else
            {
                response.StatusCode = 404;
                //await response.WriteAsJsonAsync("Не найдена активная викторина");
            }
        }

        public async Task ChangeStateResult(HttpResponse response, HttpRequest request)
        {
            var quizId = request.Path.Value?.ToString().Split("/")[^1];
            if (quizId != null)
            {
                if (Quizes.ContainsKey(quizId))
                {
                    Quizes[quizId].QuizState = new ResultTableState();
                    Quizes[quizId].StartTime = null;
                }                 
                else
                {
                    response.StatusCode = 404;
                    await response.WriteAsJsonAsync("Не найдена активная викторина");
                }
            }
            else
            {
                response.StatusCode = 404;
                await response.WriteAsJsonAsync("Не найдена активная викторина");
            }

        }

        public async Task GetResult(HttpResponse response, HttpRequest request)
        {//Вернуть массив {id, имя, очки}

        }

        public async Task IsQuizStarted(HttpResponse response, HttpRequest request)
        {
            var id = request.Path.Value?.Split("/")[^1];
            if (Quizes.ContainsKey(id))
            {
                await response.WriteAsJsonAsync(Quizes[id].IsStarted);
            }
            else
            {
                response.StatusCode = 404;
            }
        }

        public async Task GetCard(HttpResponse response, HttpRequest request)
        {//Еще время получать/отдавать
            var quizId = request.QueryString.ToString().Split("=")[^1];
            var currentQuiz = Quizes[quizId];
            var date = await request.ReadFromJsonAsync<DateTime>();
            if (currentQuiz.StartTime == null)
                currentQuiz.StartTime = date;
            var data = new Dictionary<string, object>()
            {
                ["id"] = quizId,
                ["card"] = new Dictionary<string, object>()
                {
                    ["id"] = currentQuiz.ActiveCardIndex,
                    ["question"] = currentQuiz.ActiveCard.Question,
                    ["options"] = currentQuiz.ActiveCard.Options
                },
                ["dateTime"] = currentQuiz.StartTime
            };
            await response.WriteAsJsonAsync(data);
        }

        public async Task GetQuizUsers(HttpResponse response, HttpRequest request)
        {
            var currentId = request.QueryString.ToString().Split("=")[^1];
            if (currentId != null)
            {
                if (Quizes.ContainsKey(currentId))
                {
                    var userNames = new List<Dictionary<string, string>>();
                    foreach (var user in Quizes[currentId].Users.Values)
                        userNames.Add(new Dictionary<string, string>()
                        {
                            ["nickname"] = user.Name,
                            ["id"] = user.Id
                        });
                    await response.WriteAsJsonAsync(userNames); 
                }
                else
                    response.StatusCode = 404;
            }
            else
                response.StatusCode = 404;
        }

        public async Task ConnectQuiz(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];
            var userId = Guid.NewGuid().ToString();

            Quizes[quizId].AddUser(userId);
            var userName = await request.ReadFromJsonAsync<Dictionary<string, string>>();
            Quizes[quizId].Users[userId].Name = userName["nickname"];
            await response.WriteAsJsonAsync(userId);
        }

        public async Task SetUserAnswer(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];
            var result = await request.ReadFromJsonAsync<Dictionary<string,string>>();

            if (result != null)
            {
                var userId = result["userId"];
                var cardId = int.Parse(result["cardId"]);
                var answer = result["answer"];
                Quizes[quizId].SetCheckAnswer(userId, cardId, answer);
            }
            else
                response.StatusCode = 404;
        }

        public async Task EndQuiz(HttpResponse response, HttpRequest request)
        {
            var id = request.Path.Value;
            if (id != null)
            {
                Quizes.Remove(id);
            }
        }
    }
}
