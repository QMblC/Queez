using System.Drawing.Imaging;

namespace Test_Function.QuizStructure
{
    public class Card
    {

        #region Properties
        public int Id { get; private set; } //Мб убрать private set
        public string Question { get; set; } = "";
        public string ImagePath { get; private set; } = ""; //Переработать?
        public List<string> Options { get; set; } = new();
        public string Correct { get; set; } = "";

        #endregion

        public Card(int id)
        {
            Id = id;
            for (var i = 0; i < 4; i++)
                Options.Add("");
        }

        public void UpdateQuestion(string newQuestion) => Question = newQuestion;

        public void UpdateImagePath(string newImagePath) => ImagePath = newImagePath;

        public void UpdateCorrect(string newCorrect) => Correct = newCorrect;

        public void UpdateOptions(int id, string newAnswer) => Options[id] = newAnswer;

        public void UpdateOptions(string[] newOptions)
        {
            if (newOptions.Length == Options.Count)
                for (var i = 0; i < newOptions.Length; i++)
                    Options[i] = newOptions[i];
        }
    }
}
