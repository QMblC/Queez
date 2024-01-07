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
            if (request.Method == "GET")
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
            var readQuiz = request.ReadFromJsonAsync<(string, string)>();
            
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
