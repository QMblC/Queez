using QueezServer.QuizStructure.QuizState;
using System.Web;


namespace QueezServer.QuizStructure
{
    public class Quiz
    {
        #region SaveDB
        public string Id { get; set; }
        public string Name { get; set; } = "";
        public List<Card> Cards { get; set; } = new();
        public Creator Creator { get; set; }
        #endregion

        #region TechnicalFields
        public Dictionary<string,User> Users { get; } = new();
        public List<User> SortedUsers => Users.Select(user => user.Value)
            .OrderByDescending(user => user.Score)
            .ToList();
        public bool IsStarted { get; set; } = false;
        public IQuizState QuizState { get; set; } = new LobbyQuizState();
        public int ActiveCardIndex { get; set; } = 0;
        public Card ActiveCard => Cards[ActiveCardIndex];
        public DateTime? StartTime { get; set; } = null;
        #endregion
        public Quiz(string id)
        {
            Id = id;
            Creator = new Creator("0");
        }

        public Quiz(string id, Creator creator)
        {
            Id = id;
            Creator = creator;
        }

        public void CheckAnswers(string ip)
        {
            var user = Users[ip];
            for (var i = 0; i < user.Answers.Length; i++)
                if (user.Answers[i] == Cards[i].Correct)
                    user.Points[i] = 1;
                else
                    user.Points[i] = 0;
        }//Работает быстрее

        public void CheckAnswers()//Работает медленно
        {
            foreach(var user in Users)
                for(var i = 0; i < user.Value.Answers.Length; i++)
                    if (user.Value.Answers[i] == Cards[i].Correct)
                        user.Value.Points[i] = 1;
                    else
                        user.Value.Points[i] = 0;
        }

        public void SetCheckAnswer(string userIp, int questionId, string answer)//Пока оптимально
        {
            if (Users[userIp].Answers[questionId] == "!@#$%^&*")
            {
                Users[userIp].Answers[questionId] = answer;
                Users[userIp].Points[questionId] = answer == Cards[questionId].Correct ? 1 : 0;
            }
            
        }

        public void AddCard(Card card) => Cards.Add(card);
        public void RemoveCard(Card card) => Cards.Remove(card);
        public void ClearCards() => Cards.Clear();

        public void AddUser(string id)
        {
            var user = new User(id);
            user.Answers = new string[Cards.Count];
            for(var i = 0; i < user.Answers.Length; i++)
                user.Answers[i] = "!@#$%^&*";
            user.Points = new int[Cards.Count];
            if (!Users.ContainsKey(user.Id))
                Users[user.Id] = user;
        }
        public void RemoveUser(User user) => Users.Remove(user.Id);
        public void ClearUsers() => Users.Clear();

        public void NextCard()
        {
            if (ActiveCardIndex < Cards.Count - 1)
                ActiveCardIndex++;
            else
                QuizState = new ResultTableState();
        }

        public void PreviousCard()
        {
            if (ActiveCardIndex >= 0)
                ActiveCardIndex++;
            else
                throw new Exception("Это первая карточка!");
        }

        public void CopyTo(Quiz quiz)
        {
            quiz.Name = Name;
            for(var i = 0; i < Cards.Count; i++)
            {
                quiz.AddCard(new Card(Cards[i].Id)
                {
                    Correct = Cards[i].Correct,
                    Options = new()
                    {
                        Cards[i].Options[0],
                        Cards[i].Options[1],
                        Cards[i].Options[2],
                        Cards[i].Options[3],
                    },
                    Question = Cards[i].Question,
                    Type = Cards[i].Type
                    
                });
            }
        }
    }
}
