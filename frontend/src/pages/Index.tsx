import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import StatCard from "@/components/cards/StatCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import TeamMemberCard from "@/components/cards/TeamMemberCard";
import { placementStats, teamMembers } from "@/data/dummyData";
import { Users, TrendingUp, IndianRupee, Building2, Briefcase, Award } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";

const Index = () => {
    const { testimonials } = useTestimonials();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 lg:py-24 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container-narrow section-padding text-center relative z-10">
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-slide-up">
              Comprehensive Placement & Internship
              <br className="hidden sm:block" />
              Information System
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Department of Computer Engineering - A centralized portal for managing student internships, placement analytics, and alumni professional profiles.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 lg:py-16 bg-muted/50">
          <div className="container-narrow section-padding">
            <div className="text-center mb-10 animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Placement Statistics Overview
              </h2>
              <p className="text-muted-foreground">
                Academic Year 2023-24 Performance Highlights
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <StatCard
                  title="Total Students Placed"
                  value={placementStats.placedStudents}
                  subtitle={`Out of ${placementStats.totalStudents} eligible students`}
                  icon={<Users className="h-6 w-6" />}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <StatCard
                  title="Placement Percentage"
                  value={`${placementStats.placementPercentage}%`}
                  subtitle="Highest in department history"
                  icon={<TrendingUp className="h-6 w-6" />}
                  trend={{ value: "5% from last year", positive: true }}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <StatCard
                  title="Highest Package"
                  value={placementStats.highestPackage}
                  subtitle="Offered by Microsoft"
                  icon={<Award className="h-6 w-6" />}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <StatCard
                  title="Average Package"
                  value={placementStats.averagePackage}
                  subtitle="Across all placements"
                  icon={<IndianRupee className="h-6 w-6" />}
                  trend={{ value: "12% from last year", positive: true }}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <StatCard
                  title="Companies Visited"
                  value={placementStats.companiesVisited}
                  subtitle="Including Fortune 500 companies"
                  icon={<Building2 className="h-6 w-6" />}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <StatCard
                  title="Internships Completed"
                  value={placementStats.internshipsCompleted}
                  subtitle="Summer & Winter internships"
                  icon={<Briefcase className="h-6 w-6" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 lg:py-16">
          <div className="container-narrow section-padding">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Student & Alumni Testimonials
              </h2>
              <p className="text-muted-foreground">
                Hear from our successful graduates
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  company={testimonial.company}
                  batch={testimonial.batch}
                  testimonial={testimonial.testimonial}
                />
              ))}
            </div>
          </div>
        </section>

        {/* TPO & Department Info Section */}
        <section className="py-12 lg:py-16 bg-muted/50">
          <div className="container-narrow section-padding">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Training & Placement Team
              </h2>
              <p className="text-muted-foreground">
                Meet our dedicated placement team
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TeamMemberCard
                name={teamMembers.tpo.name}
                designation={teamMembers.tpo.designation}
                email={teamMembers.tpo.email}
                phone={teamMembers.tpo.phone}
              />
              <TeamMemberCard
                name={teamMembers.hod.name}
                designation={teamMembers.hod.designation}
                email={teamMembers.hod.email}
                phone={teamMembers.hod.phone}
              />
              {teamMembers.coordinators.map((coordinator, index) => (
                <TeamMemberCard
                  key={index}
                  name={coordinator.name}
                  designation={coordinator.designation}
                  email={coordinator.email}
                  phone={coordinator.phone}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Index;
