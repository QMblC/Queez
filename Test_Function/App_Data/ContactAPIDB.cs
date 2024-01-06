using Microsoft.EntityFrameworkCore;

namespace Test_Function.App_Data
{
    public class ContactAPIDB : DbContext
    {
        public ContactAPIDB(DbContextOptions options) : base(options)
        {
        }

        public DbSet<CardDB> People { get; set; }
    }
}
