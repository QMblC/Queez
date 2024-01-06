using Microsoft.EntityFrameworkCore;

namespace Test_Function.Models
{
    public class ApplicationContext : DbContext
    {
        public DbSet<CardDB> Users { get; set; } = null!;
        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            Database.EnsureCreated();   // создаем базу данных при первом обращении
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CardDB>().HasData(
                    new CardDB { Id = "1", Question_Name = "Сложение", Question = "2+2= ?", Answer1 = "1", Answer2 = "2", Answer3 = "3", Answer4 = "4" }
                    //new CardDB { Id = "2", Question_Name = "Bob", Age = 41 },
                    //new CardDB { Id = "3", Question_Name = "Sam", Age = 24 }
            );
        }
    }
}