using System.Text.Json;
using System.Text.RegularExpressions;
using Test_Function.QuizStructure;

namespace Test_Function.API
{
    public class AllVictsHandler
    {
        public static Dictionary<string, Quiz> Quizes { get; set; } = new()
        {
            {"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", new Quiz("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
            {
                Name = "Сложение",
                Cards = new()
                {
                    new Card(1)
                    {
                        Question = "2+2= ?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "4"
                    },
                    new Card(2)
                    {
                        Question = "2+1= ?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "3"
                    },
                    new Card(3)
                    {
                        Question = "1+1= ?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "2"
                    }
                }
            } },
            {"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab", new Quiz("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab")
            {
                Name = "Животные",
                Cards = new()
                {
                    new Card(1)
                    {
                        Question = "Кто хищник?",
                        Options = new()
                        {
                            "Заяц", "Мышь", "Белка", "Лиса"
                        },
                        Correct = "Лиса"
                    },
                    new Card(2)
                    {
                        Question = "У кого самая длинная шея",
                        Options = new()
                        {
                            "Слон", "Лев", "Жираф", "Носорог"
                        },
                        Correct = "Жираф"
                    },
                    new Card(3)
                    {
                        Question = "Кто не умеет прыгать",
                        Options = new()
                        {
                            "Тигр", "Слон", "Собака", "Кот"
                        },
                        Correct = "Слон"
                    }
                }
            } },
            {"3", new Quiz("3")
            {
                Name = "name3"
            } },
            {"4", new Quiz("4")
            {
                Name = "name4"
            } },
        };

        public async Task HandleRequest(HttpResponse response, HttpRequest request, ConnectionInfo connection)
        {
            var guidExpression = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            var path = request.Path.Value;

            if (request.Method == "GET" && Regex.IsMatch(path, @"api/quizes"))
            {
                await GetQuezes(response);
            }
            else
            {
                await response.SendFileAsync("Queez/allVicts.html");
            }
        }

        public async Task CreateQuiz(HttpResponse response, HttpRequest request)
        {
            var id = Guid.NewGuid().ToString();
            var quiz = new Quiz(id);
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

            await response.WriteAsJsonAsync(b);
        }
    }
}
