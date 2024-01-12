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

            if (path == null)
                throw new Exception("Path is null");

            if (Regex.IsMatch(path, @"players.html$"))
                await ShowHtml(response, request);

            if (request.Method == "PUT" && Regex.IsMatch(path, @"api/activequiz/card/$") && Regex.IsMatch(queryString, idExpression))
                await SetUserAnswer(response, request);
            else if (request.Method == "POST" && Regex.IsMatch(path, @"api/activequiz/card/$") && Regex.IsMatch(queryString, idExpression))
                await GetCard(response, request);
            else if (request.Method == "GET" && Regex.IsMatch(path, @"api/activequiz/user/answer/$") && Regex.IsMatch(queryString, idExpression))
                await GetAnswer(response, request);
            else if (request.Method == "GET" && Regex.IsMatch(path, @"api/activequiz/user/$") && Regex.IsMatch(queryString, idExpression))
                await GetQuizUsers(response, request);
            else if (request.Method == "GET" && Regex.IsMatch(path, @"api/activequiz/score/$") && Regex.IsMatch(queryString, idExpression))
                await GetQuizScore(response, request);
            else if (request.Method == "POST" && Regex.IsMatch(path, @"api/activequiz/user/$") && Regex.IsMatch(queryString, idExpression))
                await ConnectUser(response, request);
            else if (request.Method == "DELETE" && Regex.IsMatch(path, @"api/activequiz/user/$") && Regex.IsMatch(queryString, idExpression))
                await DisconnectUser(response, request);
            else if (Regex.IsMatch(path, @"/api/activequiz/started/"))
                await IsQuizStarted(response, request);
            else if (Regex.IsMatch(path, @"api/activequiz/link/"))
                await CreateLobby(response, request);
            else if (Regex.IsMatch(path, @"api/activequiz/delete/"))//api для удаления + надо добавить window.location.search
                await DeleteLobby(response, request);
            else if (Regex.IsMatch(path, @"/api/activequiz/startquiz/" + idExpression))
                await StartQuiz(response, request);
            else if (Regex.IsMatch(path, @"/api/activequiz/card/nextcard/"))
                await NextCard(response, request);
        }

        public async Task ShowHtml(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];

            if (Quizes.ContainsKey(quizId))
                await response.SendFileAsync(Quizes[quizId].QuizState.FilePath);
            else
            {
                response.StatusCode = 404;
            }
                
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
                await response.WriteAsJsonAsync("Не найдена активная викторина");
            }
        }

        public async Task GetAnswer(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];

            if (quizId != null)
            {
                if (Quizes.ContainsKey(quizId))
                {
                    await response.WriteAsJsonAsync(Quizes[quizId].ActiveCard.Correct);
                }
                else
                {
                    response.StatusCode = 404;
                }
            }
            else
            {
                response.StatusCode = 400;
            }
        }

        public async Task IsQuizStarted(HttpResponse response, HttpRequest request)
        {
            var id = request.QueryString.ToString().Split("=")[^1];
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
                ["dateTime"] = currentQuiz.StartTime,
                ["isLast"] = currentQuiz.ActiveCardIndex == currentQuiz.Cards.Count - 1
            };
            Console.WriteLine(data["dateTime"].ToString());
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

        public async Task GetQuizScore(HttpResponse response, HttpRequest request)
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
                            ["id"] = user.Id,
                            ["score"] = user.Score.ToString()
                        });
                    await response.WriteAsJsonAsync(userNames);
                }
                else
                    response.StatusCode = 404;
            }
            else
                response.StatusCode = 404;
        }

        public async Task ConnectUser(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];
            var userId = Guid.NewGuid().ToString();
            if (quizId != null)
            {
                if (Quizes.ContainsKey(quizId))
                {
                    while (Quizes.ContainsKey(userId))
                        userId = Guid.NewGuid().ToString();

                    if (!Quizes[quizId].IsStarted)
                    {
                        Quizes[quizId].AddUser(userId);
                        var userName = await request.ReadFromJsonAsync<Dictionary<string, string>>();
                        if (userName != null)
                        {
                            Quizes[quizId].Users[userId].Name = userName["nickname"];
                            await response.WriteAsJsonAsync(userId);
                        }
                        else
                        {
                            response.StatusCode = 400;
                        }
                    }
                    else
                        response.StatusCode = 403;
                }
                else
                {
                    response.StatusCode = 404;
                }
                    
            }
            else
            {
                response.StatusCode = 400;
            }   
        }

        public async Task DisconnectUser(HttpResponse response, HttpRequest request)
        {
            var quizId = request.QueryString.ToString().Split("=")[^1];

            var userId = await request.ReadFromJsonAsync<string>();
            if (Quizes.ContainsKey(quizId))
            {
                if (userId != null)
                {
                    if (Quizes[quizId].Users.ContainsKey(userId))
                    {
                        Quizes[quizId].Users.Remove(userId);
                    }
                    else
                    {
                        response.StatusCode = 404;
                    }
                }
                else
                {
                    response.StatusCode = 400;
                }           
            }       
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

        public async Task DeleteLobby(HttpResponse response, HttpRequest request)
        {
            await Task.Delay(300000);
            var id = request.Path.Value;

            if (id != null)
            {
                if (Quizes.ContainsKey(id))
                {
                    await Task.Delay(30000);
                    Quizes.Remove(id);
                }
                else
                {
                    response.StatusCode = 404;
                }
            }
            else
            {
                response.StatusCode = 400;
            }
        }
    }
}

