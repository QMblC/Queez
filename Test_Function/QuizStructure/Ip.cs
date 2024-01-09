namespace QueezServer.QuizStructure
{
    public static class Ip
    {
        public static string Tranform(string ip)
        {
            var splitted = ip.Split(new char[] { '.', ':' });
            for (var i = 0; i < splitted.Length; i++)
                if (splitted[i].Length == 1)
                    splitted[i] = "00" + splitted[i];
                else if (splitted[i].Length == 2)
                    splitted[i] = "0" + splitted[i];
                else if (splitted[i].Length == 0)
                    splitted[i] = "000";
            return string.Join("", splitted);
        }
    }
}
