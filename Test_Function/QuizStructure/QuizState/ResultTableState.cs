namespace QueezServer.QuizStructure.QuizState
{
    public class ResultTableState : IQuizState
    {
        public string Name { get; } = "Result";
        public string FilePath { get; } = "Queez/index.html";
        public int BasicWaitingTime { get; } = 20;

    }
}
