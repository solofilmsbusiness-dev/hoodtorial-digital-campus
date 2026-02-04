import { PageLayout } from "@/components/layout/PageLayout";
import { TierCard } from "@/components/cards/TierCard";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Freshman",
    price: 49,
    description: "Perfect for getting started with mobile filmmaking fundamentals.",
    features: [
      "Access to 4 foundational courses",
      "Module quizzes with feedback",
      "Community Discord access",
      "Monthly live Q&A sessions",
      "Course completion certificates",
    ],
    highlighted: false,
  },
  {
    name: "Sophomore",
    price: 99,
    description: "For serious creators ready to level up their craft and build a portfolio.",
    features: [
      "Access to all 16 courses",
      "All quizzes + scenario exams",
      "Project submission & feedback",
      "Priority Discord channels",
      "Weekly office hours",
      "Downloadable resources & templates",
    ],
    highlighted: true,
  },
  {
    name: "Graduate",
    price: 199,
    description: "The complete Hoodtorial experience with degree certification.",
    features: [
      "Everything in Sophomore",
      "Capstone film submission",
      "Official HU degree certificate",
      "Verified graduate transcript",
      "Graduate badge for portfolio",
      "1-on-1 mentorship sessions",
      "Industry networking events",
    ],
    highlighted: false,
  },
];

const comparisonFeatures = [
  { feature: "Foundational Courses (4)", freshman: true, sophomore: true, graduate: true },
  { feature: "Advanced Courses (12)", freshman: false, sophomore: true, graduate: true },
  { feature: "Module Quizzes", freshman: true, sophomore: true, graduate: true },
  { feature: "Final Exams", freshman: false, sophomore: true, graduate: true },
  { feature: "Scenario Exams", freshman: false, sophomore: true, graduate: true },
  { feature: "Project Submissions", freshman: false, sophomore: true, graduate: true },
  { feature: "Capstone Film", freshman: false, sophomore: false, graduate: true },
  { feature: "Community Discord", freshman: true, sophomore: true, graduate: true },
  { feature: "Priority Support", freshman: false, sophomore: true, graduate: true },
  { feature: "Office Hours", freshman: false, sophomore: true, graduate: true },
  { feature: "Official Degree Certificate", freshman: false, sophomore: false, graduate: true },
  { feature: "Verified Transcript", freshman: false, sophomore: false, graduate: true },
  { feature: "Graduate Badge", freshman: false, sophomore: false, graduate: true },
  { feature: "1-on-1 Mentorship", freshman: false, sophomore: false, graduate: true },
  { feature: "Industry Networking", freshman: false, sophomore: false, graduate: true },
];

export default function Enrollment() {
  const { user } = useAuth();
  const { isTrialing, isPaid, trialDaysRemaining, status } = useSubscription();
  
  return (
    <PageLayout>
      {/* Trial Banner */}
      {isTrialing && (
        <div className="bg-primary/10 border-b border-primary/30">
          <div className="container-wide py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-foreground">
                <strong>{trialDaysRemaining} days</strong> remaining in your free trial
              </span>
              <Badge variant="outline" className="border-primary text-primary">
                Trial Active
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Already Subscribed Banner */}
      {isPaid && (
        <div className="bg-accent/10 border-b border-accent/30">
          <div className="container-wide py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-foreground">
                You're subscribed! Full access to all content.
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to="/student">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="tag-sticker mb-6">
              {isTrialing ? "Upgrade Your Plan" : isPaid ? "Your Subscription" : "Enrollment Open"}
            </span>
            <h1 className="heading-1 text-gold-gradient mb-6">
              {isTrialing ? "Unlock Full Access" : isPaid ? "Manage Your Plan" : "Choose Your Path"}
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              {isTrialing 
                ? "Your trial gives you a taste. Subscribe to unlock all courses, final exams, and community features."
                : isPaid 
                  ? "You have full access to all courses and features included in your plan."
                  : "Join Hoodtorial University and master mobile filmmaking. Pick the tier that matches your ambitions."
              }
            </p>
            
            {!user && (
              <div className="mt-8">
                <Button asChild className="btn-brutal">
                  <Link to="/auth">Sign Up for Free Trial</Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">3 days free, no credit card required</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 md:py-24 bg-charcoal-dark">
        <div className="container-wide">
          {/* Trial limits reminder */}
          {isTrialing && (
            <div className="max-w-2xl mx-auto mb-12 p-4 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground mb-1">Trial Limitations</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Access to first 2 modules per course</li>
                    <li>• 2 active course enrollments</li>
                    <li>• View-only community access</li>
                    <li>• No final exams or certificates</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <TierCard
                key={tier.name}
                name={tier.name}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                ctaHref={user ? `/checkout?tier=${tier.name.toLowerCase()}` : "/auth"}
                ctaText={user ? "Subscribe Now" : "Start Free Trial"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Compare Plans</h2>
            <p className="text-muted-foreground">
              See exactly what's included in each membership tier.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-bold text-foreground">Features</th>
                  <th className="text-center py-4 px-4 font-bold text-foreground">Freshman</th>
                  <th className="text-center py-4 px-4 font-bold text-primary">Sophomore</th>
                  <th className="text-center py-4 px-4 font-bold text-foreground">Graduate</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr 
                    key={row.feature} 
                    className={`border-b border-border ${index % 2 === 0 ? 'bg-card/50' : ''}`}
                  >
                    <td className="py-4 px-4 text-sm text-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.freshman ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-primary/5">
                      {row.sophomore ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.graduate ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 md:py-24 bg-charcoal">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
              <img 
                src={mascot} 
                alt="HU Mascot" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="heading-3 mb-4">30-Day Money Back Guarantee</h3>
              <p className="text-muted-foreground mb-4">
                We're confident you'll love Hoodtorial University. If you're not completely 
                satisfied within the first 30 days, we'll refund your payment—no questions asked.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Start learning risk-free. Your journey to becoming a master mobile filmmaker begins here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-2 text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-border p-6">
                <h4 className="font-bold text-lg mb-2">Can I upgrade my plan later?</h4>
                <p className="text-muted-foreground">
                  Yes! You can upgrade from Freshman to Sophomore or Graduate at any time. 
                  You'll only pay the difference in price.
                </p>
              </div>
              
              <div className="border-2 border-border p-6">
                <h4 className="font-bold text-lg mb-2">How long do I have access?</h4>
                <p className="text-muted-foreground">
                  All plans are monthly subscriptions. You'll have access as long as your 
                  subscription is active. Cancel anytime.
                </p>
              </div>
              
              <div className="border-2 border-border p-6">
                <h4 className="font-bold text-lg mb-2">What equipment do I need?</h4>
                <p className="text-muted-foreground">
                  Just your smartphone! Our courses are designed for iPhone filmmaking, 
                  but the principles apply to any mobile device.
                </p>
              </div>
              
              <div className="border-2 border-border p-6">
                <h4 className="font-bold text-lg mb-2">How does the degree program work?</h4>
                <p className="text-muted-foreground">
                  Graduate tier members can earn an official HU degree by completing all 
                  16 courses, passing exams with 80%+, submitting 6 projects, and completing 
                  a capstone film.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
