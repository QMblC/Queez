using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NUnit.Framework;
using QueezServer.QuizStructure;
using Assert = NUnit.Framework.Assert;

namespace TestStruct
{

    [TestFixture]
    public class TestQuiz
    {
        public Quiz? Quiz;

        private void ConfigureQuiz()
        {
            Quiz = new Quiz("1");

            var card1 = new Card(1);
            card1.UpdateOptions(new[] { "Yes", "No", "No", "No" });
            card1.Correct = "Yes";

            var card2 = new Card(2);
            card2.UpdateOptions(new[] { "No", "Yes", "No", "No" });
            card2.Correct = "Yes";

            Quiz.AddCard(card1);
            Quiz.AddCard(card2);

            Quiz.AddUser("123:0:12:31");
            var user1 = Quiz.Users["123000012031"];

            Quiz.SetCheckAnswer(user1.Id, 0, "No");
            Quiz.SetCheckAnswer(user1.Id, 1, "No");

            Quiz.AddUser("123:0:12:32");

            var user2 = Quiz.Users["123000012032"];

            Quiz.SetCheckAnswer(user2.Id, 0, "Yes");
            Quiz.SetCheckAnswer(user2.Id, 1, "Yes");
        }

        [TestCase()]
        public void TestScore()
        {
            ConfigureQuiz();

            Assert.That(Quiz?.Users["123000012031"].Score == 0);
            Assert.That(Quiz?.Users["123000012032"].Score == 2);
            

            Quiz = null;
        }

        [TestCase()]
        public void TestSortedUsers()
        {
            ConfigureQuiz();

            for (var i = 1; i < Quiz?.Users.Count; i++)
                Assert.That(Quiz?.SortedUsers[i - 1].Score >= Quiz?.SortedUsers[i].Score);

            Quiz = null;
        }

        [TestCase()]
        public void Tests()
        {
            var a = @"/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/[0-9]{12}/";
            var b = "/" + Guid.NewGuid().ToString() + "/123001321321/";
            Assert.That(Regex.IsMatch(b, a));
        }
    }
}
