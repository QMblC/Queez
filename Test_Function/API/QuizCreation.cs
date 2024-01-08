using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System.Text.Json;
using System.Text.RegularExpressions;
using Test_Function.QuizStructure;

namespace Test_Function.API
{
    public class QuizCreation
    {
        public static Dictionary<string, Quiz> Quizes { get; set; } = new();

        public async Task HandleRequest(HttpResponse response,  HttpRequest request, ConnectionInfo connection)
        {
            var ipExpression = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/[0-9]{12}";
            var guidExpression = @"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            var path = request.Path.Value;        

            if (request.Method == "GET" && Regex.IsMatch(path, guidExpression))
            {
                //Выдача из Дб по id
            }
            if (request.Method == "GET" && Regex.IsMatch(path, @"api/my"))
            {
                await GetQuezes(response);
            }
            else if (request.Method == "POST")
            {
                //Создание id и викторины
                await CreateQuiz(response, request);
            }
            else
            {
                await response.SendFileAsync("Queez/create.html");
            }
        }

        public async Task CreateQuiz(HttpResponse response, HttpRequest request)
        {
            var id = Guid.NewGuid().ToString();
            while (true)
            {
                if (Quizes.ContainsKey(id))//Заменить на проверку из бд
                    id = Guid.NewGuid().ToString();
                else
                    break;
            }
            
            var quiz = new Quiz(id);
            var readQuiz = await request.ReadFromJsonAsync<Data>();
            quiz.Name = readQuiz.QuizTitle;
            for (var i = 0; i < readQuiz.Cards.Count; i++)
            {
                quiz.AddCard(new Card(readQuiz.Cards[i].Id)
                {
                    Options = new()
                    {
                        readQuiz.Cards[i].Options[0],
                        readQuiz.Cards[i].Options[1],
                        readQuiz.Cards[i].Options[2],
                        readQuiz.Cards[i].Options[3],
                    },
                    Correct = readQuiz.Cards[i].Answer,
                    Question = readQuiz.Cards[i].Question

                }) ;
            }
            Quizes[id] = quiz;
            AllVictsHandler.Quizes[id] = quiz;
            await response.WriteAsJsonAsync(new Dictionary<string, string>()
            {
                ["name"] = quiz.Name,
                ["id"] = id
            });
            
        }

        public async Task GetQuezes(HttpResponse response)
        {
            var a = Quizes.Select(x => x.Value).ToList();
            var b = new List<Dictionary<string, string>>();
            for (var i = 0; i < a.Count; i++)
            {
                b.Add(new Dictionary<string, string>());
                b[i]["id"] = a[i].Id;
                b[i]["name"] = a[i].Name;
            };

            await response.WriteAsJsonAsync(b) ;
        }
    }

    public class Data
    {
        public string QuizTitle { get; set; }
        public List<DataCard> Cards { get; set; }
    }

    public class DataCard
    {
        public string QuestionType { get; set; }
        public int Id { get; set; }
        public string Question { get; set; }
        public List<string> Options { get; set; }
        public string Answer { get; set; }
    }
}

