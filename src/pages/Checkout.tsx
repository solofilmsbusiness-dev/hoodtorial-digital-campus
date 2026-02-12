import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { TestPaymentForm, PaymentSuccessModal } from "@/components/checkout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, AlertCircle, Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import mascot from "@/assets/mascot.png";

const tiers = [
  {
    id: "freshman",
    name: "Freshman",
    price: 49,
    features: [
      "4 foundational courses",
      "Module quizzes",
      "Community Discord",
      "Monthly Q&A sessions",
    ],
  },
  {
    id: "sophomore",
    name: "Sophomore",
    price: 99,
    features: [
      "All 16 courses",
      "Final exams & projects",
      "Priority support",
      "Weekly office hours",
    ],
    popular: true,
  },
  {
    id: "graduate",
    name: "Graduate",
    price: 199,
    features: [
      "Everything in Sophomore",
      "Official HU degree",
      "1-on-1 mentorship",
      "Industry networking",
    ],
  },
];

// Test card responses
const CARD_RESPONSES: Record<string, "success" | "declined" | "insufficient"> = {
  "4242424242424242": "success",
  "4000000000000002": "declined",
  "4000000000009995": "insufficient",
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchSubscription } = useSubscription();

  const preselectedTier = searchParams.get("tier") || "sophomore";
  const [selectedTier, setSelectedTier] = useState(preselectedTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tier = tiers.find((t) => t.id === selectedTier) || tiers[1];

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: { pathname: "/checkout" } } });
    }
  }, [user, navigate]);

  const handlePayment = async (cardNumber: string) => {
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = CARD_RESPONSES[cardNumber] || "declined";

    if (response === "declined") {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Card Declined",
        description: "Your card was declined. Please try a different card.",
      });
      return;
    }

    if (response === "insufficient") {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "Your card has insufficient funds. Please try a different card.",
      });
      return;
    }

    // Success - update profile
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_started_at: new Date().toISOString(),
          membership_tier: selectedTier as "freshman" | "sophomore" | "graduate",
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      // Refresh subscription state so hooks get updated values immediately
      await refetchSubscription();

      setIsProcessing(false);
      setShowSuccess(true);
    } catch (err) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      });
    }
  };

  if (!user) return null;

  return (
    <PageLayout>
      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccess}
        tierName={tier.name}
        onClose={() => setShowSuccess(false)}
      />

      <section className="py-12 md:py-20">
        <div className="container-wide max-w-5xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/enrollment")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>

          {/* Test mode banner */}
          <div className="flex items-center gap-3 p-4 mb-8 bg-primary/10 border-2 border-primary/30 rounded-lg">
            <Shield className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-foreground">Test Mode Checkout</p>
              <p className="text-sm text-muted-foreground">
                This is a simulated checkout for testing. No real payments will be processed.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Tier selection & summary */}
            <div className="space-y-6">
              <div>
                <h1 className="heading-2 text-foreground mb-2">Complete Your Subscription</h1>
                <p className="text-muted-foreground">
                  Select your plan and enter payment details to get started.
                </p>
              </div>

              {/* Tier selector */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Select Plan
                </h2>
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    className={cn(
                      "w-full p-4 border-2 rounded-lg text-left transition-all",
                      selectedTier === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{t.name}</span>
                        {t.popular && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-foreground">${t.price}/mo</span>
                    </div>
                    <ul className="space-y-1">
                      {t.features.slice(0, 2).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3 h-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Order summary */}
              <div className="p-6 bg-muted/30 border-2 border-border rounded-lg">
                <h2 className="font-bold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tier.name} Plan (Monthly)</span>
                    <span className="text-foreground">${tier.price}.00</span>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">${tier.price}/mo</span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                <img src={mascot} alt="HU Mascot" className="w-10 h-10 object-contain" />
                <div className="text-sm">
                  <p className="font-bold text-foreground">30-Day Guarantee</p>
                  <p className="text-muted-foreground">Not satisfied? Full refund, no questions.</p>
                </div>
              </div>
            </div>

            {/* Right: Payment form */}
            <div className="bg-card border-2 border-border rounded-lg p-6 md:p-8">
              <h2 className="heading-4 text-foreground mb-6">Payment Details</h2>
              <TestPaymentForm
                amount={tier.price}
                onSubmit={handlePayment}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Disclosure */}
          <div className="mt-8 bg-card/50 border-2 border-border p-6">
            <div className="flex items-start gap-3 mb-2">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Note:</strong> Hoodtorial University is a teaching platform and learning community — not an accredited institution. Completion results in a certificate of completion, not a formal academic degree.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
