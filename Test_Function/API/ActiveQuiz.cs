using System.IO;
using System.Text.RegularExpressions;
using Test_Function.QuizStructure;

namespace Test_Function.API
{

    public  class ActiveQuiz
    {
        public Dictionary<string, Quiz> Quizes = new();

        public async Task HandleRequest(HttpResponse response, HttpRequest request, ConnectionInfo connection)
        {
            var ipExpression = @"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/[0-9]{12}";
            var guidExpression = @"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            var path = request.Path.Value;
            if (request.Method == "POST")
                throw new NotImplementedException();
            else if (request.Method == "PUT")
                throw new NotImplementedException();
            else if (request.Method == "DELETE" && Regex.IsMatch(path, guidExpression))
                throw new NotImplementedException();
            else if (request.Method == "GET" && Regex.IsMatch(path, ipExpression))
                await ConnectQuiz(response, request, connection);
            else if (request.Method == "GET" && Regex.IsMatch(path, guidExpression))
                await StartQuiz(response, request);  
            else
            {
                response.ContentType = "text/html; charset=utf-8";
                await response.SendFileAsync("Queez/quiz-creator.html");        
            }
        }

        public async Task StartQuiz(HttpResponse response, HttpRequest request)
        {
            var id = request.Path.Value?.Split("/")[^1];

            if (id != null)
            {
                var quiz = AllVictsHandler.Quizes[id];

                if (quiz != null)
                {
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

        public async Task GetQuizUsers(HttpResponse response, HttpRequest request)
        {
            var currentId = request.Path.Value?.Split("/")[^1];
            if (currentId != null)
            {
                if (Quizes.ContainsKey(currentId))
                {
                    var userNames = new List<Dictionary<string, string>>();
                    foreach (var user in Quizes[currentId].Users.Values)
                        userNames.Add(new Dictionary<string, string>()
                        {
                            ["name"] = user.Name
                        });
                    //await response.WriteAsJsonAsync(Quizes[currentId].Users);
                    await response.WriteAsJsonAsync("true");
                }
                else
                    response.StatusCode = 404;
            }
            else
                response.StatusCode = 404;
        }

        public async Task ConnectQuiz(HttpResponse response, HttpRequest request, ConnectionInfo connection)
        {//Удалить?
            var quizId = request.Path.Value?.Split("/")[^2];
            var userId = request.Path.Value?.Split("/")[^1];

            if (quizId != null && userId != null)
            {
                if (Quizes.ContainsKey(quizId))
                {
                    Quizes[quizId].AddUser(connection.RemoteIpAddress.ToString());
                    await response.WriteAsJsonAsync(Quizes[quizId].Cards);
                }
                else
                {
                    response.StatusCode = 404;
                    
                }
            }
            else
            {
                response.StatusCode = 404;          
            }
        }

        public async Task UpdateUserAnswer(HttpResponse response, HttpRequest request)
        {
            var quizId = request.Path.Value?.Split("/")[^1];
            var userId = request.Path.Value?.Split("/")[^1];
            var answer = await request.ReadFromJsonAsync<(int answerId, string answerValue)>();


            if (quizId != null && userId != null)
            {
                Quizes[quizId].SetCheckAnswer(userId, answer.answerId, answer.answerValue);
            }
            else if (quizId == null )
            {
                response.StatusCode = 404;
            }
            else
            {
                response.StatusCode = 404;
            }
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
