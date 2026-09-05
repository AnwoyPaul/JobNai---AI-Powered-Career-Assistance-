using JobNai.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JobNai.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
     public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<ResumeProfile> ResumeProfiles => Set<ResumeProfile>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<CoverLetter> CoverLetters => Set<CoverLetter>();
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        

        builder.Entity<JobApplication>()
    .HasOne(a => a.JobSeeker)
    .WithMany()
    .HasForeignKey(a => a.JobSeekerId)
    .OnDelete(DeleteBehavior.Cascade);

builder.Entity<JobApplication>()
    .HasOne(a => a.JobPosting)
    .WithMany()
    .HasForeignKey(a => a.JobPostingId)
    .OnDelete(DeleteBehavior.Cascade);

builder.Entity<JobApplication>()
    .HasOne(a => a.CoverLetter)
    .WithMany()
    .HasForeignKey(a => a.CoverLetterId)
    .OnDelete(DeleteBehavior.SetNull);

// Prevent applying to the same job twice
builder.Entity<JobApplication>()
    .HasIndex(a => new { a.JobSeekerId, a.JobPostingId })
    .IsUnique();


        builder.Entity<ResumeProfile>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<JobPosting>()
            .HasOne(j => j.Employer)
            .WithMany()
            .HasForeignKey(j => j.EmployerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CoverLetter>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CoverLetter>()
            .HasOne(c => c.JobPosting)
            .WithMany()
            .HasForeignKey(c => c.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}