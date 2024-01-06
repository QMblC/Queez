namespace Test_Function.QuizStructure
{
    public class Answer
    {
        public string Content { get; private set; } = "";
        public bool IsCorrect { get; private set; }

        public Answer()
        {

        }

        public Answer(string content, bool isCorrect)
        {
            Content = content;
            IsCorrect = isCorrect;
        }

        public void UpdateContent(string newContent) => Content = newContent;

        public void UpdateCorrectness(bool newCorrectness) => IsCorrect = newCorrectness;

        public void UpdateAnswer(Answer newAnswer)
        {
            Content = newAnswer.Content;
            IsCorrect = newAnswer.IsCorrect;
        }
    }
}
