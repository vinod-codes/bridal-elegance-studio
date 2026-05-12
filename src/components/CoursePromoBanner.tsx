import { useEffect, useRef, useState } from "react";
import { GraduationCap, ArrowRight, Star, Users, Clock, ExternalLink } from "lucide-react";

const COURSE_URL = "https://shop.theujs.com";
const ENROLL_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdax8sEnZyGrjicE4ByYuCaruCeso8xzuD-nl_gfFEspIMXqA/viewform";

const stats = [
  { icon: Users, value: "2,147+", label: "Students Enrolled" },
  { icon: Star, value: "4.9/5", label: "Course Rating" },
  { icon: Clock, value: "10 Days", label: "To Your Business" },
];

const highlights = [
  "Learn Resin & Floral Jewelry from scratch",
  "Start selling from home in 10 days",
  "Join 2,000+ successful students",
  "Limited seats available today",
];

const CoursePromoBanner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 relative overflow-hidden"
      aria-labelledby="course-promo-heading"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-yellow-50/40 to-background" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200/10 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative container mx-auto px-4">
        {/* Badge */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 text-sm font-body font-medium text-gold-dark mb-4">
            <GraduationCap size={14} className="text-gold" />
            Learn the Craft Behind Our Jewelry
          </div>
          <h2
            id="course-promo-heading"
            className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Want to{" "}
            <span className="text-gold">Make Your Own</span>{" "}
            Jewelry?
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto text-lg">
            Join our premium online jewelry-making course and turn your passion into a
            profitable business — right from home.
          </p>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-3xl overflow-hidden border border-gold/20 shadow-xl bg-white transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid md:grid-cols-2">
            {/* Left: Visual side */}
            <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 p-8 md:p-12 flex flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1 text-xs text-yellow-200 font-body mb-4">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Enrollment Open — Register Today
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                  Handmade Jewelry<br />
                  <span className="text-yellow-300">Business Course</span>
                </h3>
                <p className="font-body text-yellow-100/80 text-sm leading-relaxed">
                  From zero experience to running your own jewelry business. 
                  Learn everything: design, materials, pricing & selling strategies.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <Icon size={18} className="text-yellow-300 mx-auto mb-1" />
                    <div className="font-heading font-bold text-white text-base">{value}</div>
                    <div className="font-body text-yellow-200/70 text-xs">{label}</div>
                  </div>
                ))}
              </div>

              {/* Price badge */}
              <div className="flex items-center gap-3">
                <span className="font-body text-yellow-200/60 text-sm italic">Exclusive Opportunity</span>
                <span className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                  Limited Time Offer
                </span>
              </div>
            </div>

            {/* Right: Details side */}
            <div className="p-8 md:p-12 flex flex-col justify-between gap-8">
              <div>
                <h4 className="font-heading font-semibold text-foreground text-lg mb-4">
                  What You'll Learn:
                </h4>
                <ul className="space-y-3">
                  {highlights.map((h, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 font-body text-sm text-muted-foreground transition-all duration-500 ${
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      }`}
                      style={{ transitionDelay: `${i * 80 + 400}ms` }}
                    >
                      <span className="w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ✓
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <a
                  href={ENROLL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gold text-white px-6 py-3.5 rounded-xl font-body font-bold text-sm hover:bg-gold/90 transition-colors shadow-md"
                  aria-label="Register for the handmade jewelry course"
                >
                  <GraduationCap size={16} />
                  Register Now — Limited Spots
                  <ArrowRight size={14} />
                </a>
                <a
                  href={COURSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-gold/30 text-gold-dark bg-gold/5 px-6 py-3 rounded-xl font-body font-medium text-sm hover:bg-gold/10 transition-colors"
                  aria-label="Learn more about the jewelry course"
                >
                  Learn More About the Course
                  <ExternalLink size={12} />
                </a>
                <p className="text-center font-body text-xs text-muted-foreground">
                  By the same artisans behind Unique Jewelry Studio 💛
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursePromoBanner;
