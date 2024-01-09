namespace QueezServer.QuizStructure.QuizState
{
    public class LobbyQuizState : IQuizState
    {
        public string Name { get; } = "Lobby";
        public string FilePath { get; } = "Queez/players.html";

    }
}
