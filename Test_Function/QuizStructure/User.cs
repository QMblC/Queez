namespace Test_Function.QuizStructure
{
    public class User : IPerson
    {
        public string Id { get; set; } = "";
        public int[] Points { get; set; } = new int[0];
        public int[] Answers { get; set; } = new int[0];
        public int Score => Points.Sum();

        public User(string ip)
        {
            Id = Test_Function.QuizStructure.Ip.Tranform(ip);
        }

        public void ChangeAnswer(int id, int answer) => Answers[id] = answer;
    }
}
