﻿using System.Text.Json;
using System.Text.RegularExpressions;
using Test_Function.QuizStructure;

namespace Test_Function.API
{
    public class QuizCreation
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
                        Answers = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = 3
                    },
                    new Card(2)
                    {
                        Question = "2+1= ?",
                        Answers = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = 2
                    },
                    new Card(3)
                    {
                        Question = "1+1= ?",
                        Answers = new()
                        {
                            "1", "2", "3", "4"
                        },
                        Correct = 1
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
                        Answers = new()
                        {
                            "Заяц", "Мышь", "Белка", "Лиса"
                        },
                        Correct = 3
                    },
                    new Card(2)
                    {
                        Question = "У кого самая длинная шея",
                        Answers = new()
                        {
                            "Слон", "Лев", "Жираф", "Носорог"
                        },
                        Correct = 2
                    },
                    new Card(3)
                    {
                        Question = "Кто не умеет прыгать",
                        Answers = new()
                        {
                            "Тигр", "Слон", "Собака", "Кот"
                        },
                        Correct = 1
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

        public async Task HandleRequest(HttpResponse response,  HttpRequest request, ConnectionInfo connection)
        {
            var ipExpression = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/[0-9]{12}";
            var guidExpression = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$";

            var path = request.Path.Value;        

            if (request.Method == "GET" && Regex.IsMatch(path, guidExpression))
            {
                //Выдача из Дб по id
            }
            if (request.Method == "GET" && Regex.IsMatch(path, @"api/quizes"))
            {
                await GetQuezes(response);
            }
            else if (request.Method == "POST")
            {
                //Создание id и викторины
            }
            else
            {
                await response.SendFileAsync("Queez/create.html");
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

            await response.WriteAsJsonAsync(b) ;
        }
    }
}
