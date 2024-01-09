namespace QueezServer.QuizStructure.QuizState
{
    public class ResultTableState : IQuizState
    {
        public string Name { get; }
        public string FilePath { get; }
        public int BasicWaitingTime { get; } = 20;

        public ResultTableState(string name, string filePath)
        {
            Name = name;
            FilePath = filePath;
        }
    }
}
