namespace QueezServer.QuizStructure
{
    public class Creator : IPerson
    {
        public string Id { get; set; }

        public Creator(string id)
        {
            Id = QueezServer.QuizStructure.Ip.Tranform(id);
        }
    }
}
