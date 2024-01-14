using System.Text.Json;
using System.Text.RegularExpressions;
using QueezServer.QuizStructure;

namespace QueezServer.API
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
                        Question = "2+2=?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "4",
                        Type = "Викторина"
                    },
                    new Card(2)
                    {
                        Question = "2+1= ?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "3",
                        Type = "Викторина"
                    },
                    new Card(3)
                    {
                        Question = "1+1= ?",
                        Options = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = "2",
                        Type = "Викторина"
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
                        Correct = "Лиса",
                        Type = "Викторина"
                    },
                    new Card(2)
                    {
                        Question = "У кого самая длинная шея",
                        Options = new()
                        {
                            "Слон", "Лев", "Жираф", "Носорог"
                        },
                        Correct = "Жираф",
                        Type = "Викторина"
                    },
                    new Card(3)
                    {
                        Question = "Кто не умеет прыгать",
                        Options = new()
                        {
                            "Тигр", "Слон", "Собака", "Кот"
                        },
                        Correct = "Слон",
                        Type = "Викторина"
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
            //var guidExpression = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            var path = request.Path.Value?.ToString();

            if (request.Method == "GET" && Regex.IsMatch(path, @"api/quizes$"))
            {
                await GetQuizes(response);
            }
            else if (request.Method == "GET" && Regex.IsMatch(path, @"api/quizes/"))
            {
                await GetQuizes(response, request);
            }
            else
            {
                await response.SendFileAsync("Queez/allVicts.html");
            }
        }
        public async Task GetQuizes(HttpResponse response, HttpRequest request)
        {
            var name = request.Path.Value.Split("/")[^1].ToString();
            var quizes = Quizes.Select(x => x.Value).Where(x => x.Name.ToLower().Contains(name.ToLower())).ToList();
            var matchedQuizes = new List<Dictionary<string, string>>();
            for (var i = 0; i < quizes.Count; i++)
            {
                matchedQuizes.Add(new Dictionary<string, string>());
                matchedQuizes[i]["id"] = quizes[i].Id;
                matchedQuizes[i]["name"] = quizes[i].Name;
            };

            await response.WriteAsJsonAsync(matchedQuizes);
        }

        public async Task GetQuizes(HttpResponse response)
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
