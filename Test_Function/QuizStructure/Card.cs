using System.Drawing.Imaging;

namespace Test_Function.QuizStructure
{
    public class Card
    {

        #region Properties
        public int Id { get; private set; } //Мб убрать private set
        public string Question { get; set; } = "";
        public string ImagePath { get; private set; } = ""; //Переработать?
        public List<string> Answers { get; set; } = new();
        public int Correct { get; set; }

        #endregion

        public Card(int id)
        {
            Id = id;
            for (var i = 0; i < 4; i++)
                Answers.Add("");
        }

        public void UpdateQuestion(string newQuestion) => Question = newQuestion;

        public void UpdateImagePath(string newImagePath) => ImagePath = newImagePath;

        public void UpdateAnswer(int id, string newAnswer) => Answers[id] = newAnswer;

        public void UpdateAnswer(string[] newAnswers)
        {
            if (newAnswers.Length == Answers.Count)
                for (var i = 0; i < newAnswers.Length; i++)
                    Answers[i] = newAnswers[i];
        }
    }
}
