import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import StatCard from "@/components/cards/StatCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import TeamMemberCard from "@/components/cards/TeamMemberCard";
import { teamMembers } from "@/data/dummyData";
import { Users, TrendingUp, IndianRupee, Building2, Briefcase, Award } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const Index = () => {
  const { testimonials } = useTestimonials();
  
  // Stats State
  const [stats, setStats] = useState({
      placed: 0,
      totalEligible: 0,
      percentage: 0,
      higherStudies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const recordsRef = collection(db, "placement_stats_yearly");
              const snapshot = await getDocs(recordsRef);
              const data = snapshot.docs.map(doc => doc.data());
              
              if (data.length === 0) return;

              const placedCount = data.reduce((acc, curr: any) => acc + (Number(curr.placed) || 0), 0);
              const higherStudiesCount = data.reduce((acc, curr: any) => acc + (Number(curr.higherStudies) || 0), 0);
              const totalEligible = data.reduce((acc, curr: any) => acc + (Number(curr.eligible) || 0), 0);
              
              const totalSuccess = placedCount + higherStudiesCount;

              setStats({
                  placed: placedCount,
                  totalEligible: totalEligible,
                  percentage: totalEligible > 0 ? Math.round((placedCount / totalEligible) * 100) : 0,
                  higherStudies: higherStudiesCount
              });

          } catch (error) {
              console.error("Error fetching stats:", error);
          } finally {
            setLoading(false);
          }
      };

      fetchStats();
  }, []);

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
                Placement Statistics Overview (2014 - Present)
              </h2>
              <p className="text-muted-foreground">
                Live Performance Highlights
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <StatCard
                  title="Total Students Placed"
                  value={stats.placed}
                  subtitle={`Out of ${stats.totalEligible} registered students`}
                  icon={<Users className="h-6 w-6" />}
                  loading={loading}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <StatCard
                  title="Success Rate"
                  value={`${stats.percentage}%`}
                  subtitle="Placement Rate"
                  icon={<TrendingUp className="h-6 w-6" />}
                  trend={{ value: "Aggregated", positive: true }}
                  loading={loading}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <StatCard
                  title="Higher Studies"
                  value={stats.higherStudies}
                  subtitle="Pursued Masters/PhD"
                  icon={<Award className="h-6 w-6" />}
                  loading={loading}
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
              {teamMembers.coordinators.map((coordinator, index) => (
                <TeamMemberCard
                  key={index}
                  name={coordinator.name}
                  designation={coordinator.designation}
                  email={coordinator.email}
                  phone={coordinator.phone}
                />
              ))}
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
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Index;
