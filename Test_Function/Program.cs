using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Test_Function.API;
using Test_Function.Models;





var builder = WebApplication.CreateBuilder();
string connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationContext>(options => options.UseSqlServer(connection));
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie();

var app = builder.Build();

app.MapGet("/", (ApplicationContext db) => db.Users.ToList());

app.UseStaticFiles();
app.UseHttpsRedirection();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

var activeQuizHandler = new ActiveQuiz();
var quizCreationHandler = new QuizCreation();
var allVictsHandler = new AllVictsHandler();


app.Run(async (context) =>
{
    var path = context.Request.Path;
    var queryString = context.Request.QueryString.ToString();

    if (Regex.IsMatch(path, @"/quiz-creator"))
    {
        await activeQuizHandler.HandleRequest(context.Response, context.Request, context.Connection);  
    }
    else if (Regex.IsMatch(path, @"/create.html$"))
    {
        await quizCreationHandler.HandleRequest(context.Response, context.Request, context.Connection);
    }
    else if (Regex.IsMatch(path, @"/vict.html$"))
    {
        await context.Response.SendFileAsync("Queez/vict.html");
    }
    else if (Regex.IsMatch(path, @"/api/quiz/\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}"))
    {
        activeQuizHandler.StartQuiz(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"/api/quiz/started/\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}"))
    {
        await activeQuizHandler.IsQuizStarted(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"api/quizes/link/"))
    {
        await activeQuizHandler.CreateLobby(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"api/quizes"))
    {
        await allVictsHandler.HandleRequest(context.Response, context.Request, context.Connection);
    }   
    else if (Regex.IsMatch(path, @"api/myquizes/"))
    {
        await quizCreationHandler.CreateQuiz(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"api/quiz/users"))
    {
        await activeQuizHandler.GetQuizUsers(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"/allVicts"))
    {
        await allVictsHandler.HandleRequest(context.Response, context.Request, context.Connection);
    }
    else if (Regex.IsMatch(path, @"api/quiz/user/") && Regex.IsMatch(queryString, @"\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}"))
    {
        await activeQuizHandler.ConnectQuiz(context.Response, context.Request);
    }
    else if (Regex.IsMatch(path, @"/vict-going.html$"))
    {
        await context.Response.SendFileAsync("Queez/vict-going.html$");
    }
    else if (Regex.IsMatch(path, @"players.html$"))
    {
        await context.Response.SendFileAsync(activeQuizHandler.Quizes[context.Request.QueryString.ToString().Split("=")[^1]].active);
    }
    else
    {
        //context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync("Queez/index.html");
    }
});
app.Run();

//async Task GetPeople(HttpResponse response)
//{
//    await response.WriteAsJsonAsync(users);
//}

//async Task GetPerson(HttpResponse response, int? id)
//{
//    var desiredUser = users.FirstOrDefault(user => user.Id == id);
//    if (desiredUser != null)
//        await response.WriteAsJsonAsync(desiredUser);
//    else
//    {
//        response.StatusCode = 404;
//        await response.WriteAsJsonAsync(new { message = "������������ � ������ ID: {desiredUser} �� ������" });
//    }
//}

//async Task CreatePerson(HttpResponse response, HttpRequest request)
//{
//    try
//    {
//        var user = await request.ReadFromJsonAsync<CardDB>();
//        if (user != null)
//        {
//            users.Add(new CardDB(index, user.Name, user.Age));
//            user.Id = index;
//            index++;

//            await response.WriteAsJsonAsync(user);
//        }
//        else
//            throw new Exception("������������ ������");
//    }
//    catch
//    {
//        response.StatusCode = 404;
//        await response.WriteAsJsonAsync(new { message = "������������ ������" });
//    }
//}

//async Task UpdatePerson(HttpResponse response, HttpRequest request)
//{
//    try
//    {
//        var userData = await request.ReadFromJsonAsync<CardDB>();
//        if (userData != null)
//        {
//            var user = users.FirstOrDefault(user => user.Id == userData.Id);
//            if (user != null)
//            {
//                user.UpdateName(userData.Name);
//                user.UpdateAge(userData.Age);
//                await response.WriteAsJsonAsync(user);
//            }
//            else
//            {
//                response.StatusCode = 404;
//                await response.WriteAsJsonAsync(new { message = "������������ � ID: {userData.Id} �� ������" });
//            }
//        }
//    }
//    catch
//    {
//        response.StatusCode = 404;
//        await response.WriteAsJsonAsync(new { message = "������������ ������" });
//    }
//}

//async Task DeletePerson(HttpResponse response, string? id)
//{
//    var desiredUser = users.FirstOrDefault(user => user.Id == int.Parse(id));
//    if (desiredUser != null)
//    {
//        users.Remove(desiredUser);
//        await response.WriteAsJsonAsync(desiredUser);
//    }
//    else
//    {
//        response.StatusCode = 404;
//        await response.WriteAsJsonAsync(new { message = "������������ �� ������" });
//    }
//}

public class CardDB
{
    public string Id { get; set; } = "";
    public string Question_Name { get; set; } = "";
    public string Question { get; set; } = "";
    public string Answer1 { get; set; } = "";
    public string Answer2 { get; set; } = "";
    public string Answer3 { get; set; } = "";
    public string Answer4 { get; set; } = "";
}

