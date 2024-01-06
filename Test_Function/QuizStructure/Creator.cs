namespace Test_Function.QuizStructure
{
    public class Creator : IPerson
    {
        public string Id { get; set; }

        public Creator(string id)
        {
            Id = Test_Function.QuizStructure.Ip.Tranform(id);
        }
    }
}
