namespace QueezServer.QuizStructure.QuizState
{
    public class ActiveQuizState : IQuizState
    {
        public string Name { get; } = "Active";
        public string FilePath { get; } = "Queez/playerInVict.html";
        public int BasicWaitingTime { get; } = 20;


    }
}
