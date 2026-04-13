import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { TestPaymentForm, PaymentSuccessModal } from "@/components/checkout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Shield, Info, Trash2, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useCart } from "@/contexts/CartContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import { getCourseByCode, getTotalLessonsCount, getTotalQuizzesCount } from "@/data/courses";
import { cn } from "@/lib/utils";
import mascot from "@/assets/mascot.png";

const COURSE_PRICE = 29.99;

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
  const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
  const { enrollAfterPayment } = useEnrollments();

  const checkoutType = searchParams.get("type") || "subscription";
  const courseCode = searchParams.get("course") || "";

  const isMerchCheckout = checkoutType === "merch" && cartItems.length > 0;
  const isCourseCheckout = checkoutType === "course" && !!courseCode;

  const preselectedTier = searchParams.get("tier") || "sophomore";
  const [selectedTier, setSelectedTier] = useState(preselectedTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tier = tiers.find((t) => t.id === selectedTier) || tiers[1];

  const paymentAmount = isMerchCheckout
    ? cartTotal
    : isCourseCheckout
    ? COURSE_PRICE
    : tier.price;

  // Look up course data for per-course checkout
  const course = isCourseCheckout ? getCourseByCode(courseCode) : null;
  const totalLessons = course ? getTotalLessonsCount(course) : 0;
  const totalQuizzes = course ? getTotalQuizzesCount(course) : 0;

  useEffect(() => {
    if (!user) {
      const returnUrl = isCourseCheckout
        ? `/checkout?type=course&course=${courseCode}`
        : "/checkout";
      navigate("/auth", { state: { from: { pathname: returnUrl } } });
    }
  }, [user, navigate, isCourseCheckout, courseCode]);

  const handlePayment = async (cardNumber: string) => {
    setIsProcessing(true);
    // TODO: Replace this simulated delay with a real Stripe Checkout session call.
    // 1. Add VITE_STRIPE_PUBLISHABLE_KEY to .env
    // 2. Create supabase/functions/create-checkout-session/index.ts edge function
    // 3. Call supabase.functions.invoke('create-checkout-session', { body: { courseCode, priceInCents: 2999 } })
    // 4. Use the returned session URL to redirect: window.location.href = session.url
    // 5. On Stripe success redirect, call enrollAfterPayment(courseCode, session.id)
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

    // Payment success
    try {
      if (isCourseCheckout) {
        // Per-course purchase: enroll the student directly
        const result = await enrollAfterPayment(courseCode);
        setIsProcessing(false);
        if (!result?.error) {
          setShowSuccess(true);
        }
      } else if (isMerchCheckout) {
        clearCart();
        setIsProcessing(false);
        setShowSuccess(true);
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_started_at: new Date().toISOString(),
            membership_tier: selectedTier as "freshman" | "sophomore" | "graduate",
          })
          .eq("user_id", user!.id);

        if (error) throw error;
        await refetchSubscription();
        setIsProcessing(false);
        setShowSuccess(true);
      }
    } catch (err) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      });
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (isCourseCheckout) {
      navigate(`/course/${courseCode}`);
    } else if (isMerchCheckout) {
      navigate("/shop");
    }
  };

  if (!user) return null;

  return (
    <PageLayout>
      <PaymentSuccessModal
        isOpen={showSuccess}
        tierName={
          isCourseCheckout
            ? course?.title || courseCode
            : isMerchCheckout
            ? "Merch Order"
            : tier.name
        }
        onClose={handleSuccessClose}
      />

      <section className="py-12 md:py-20">
        <div className="container-wide max-w-5xl">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(
                isCourseCheckout
                  ? `/course/${courseCode}`
                  : isMerchCheckout
                  ? "/shop"
                  : "/enrollment"
              )
            }
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isCourseCheckout
              ? "Back to Course"
              : isMerchCheckout
              ? "Back to Shop"
              : "Back to Plans"}
          </Button>

          {/* Test mode banner */}
          <div className="flex items-center gap-3 p-4 mb-8 bg-primary/10 border-2 border-primary/30 rounded-lg">
            <Shield className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-foreground">Test Mode Checkout</p>
              <p className="text-sm text-muted-foreground">
                Use card <code className="bg-muted px-1 py-0.5 rounded text-xs">4242 4242 4242 4242</code> to simulate a successful payment.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Summary */}
            <div className="space-y-6">
              <div>
                <h1 className="heading-2 text-foreground mb-2">
                  {isCourseCheckout
                    ? "Enroll in Course"
                    : isMerchCheckout
                    ? "Complete Your Order"
                    : "Complete Your Subscription"}
                </h1>
                <p className="text-muted-foreground">
                  {isCourseCheckout
                    ? "One-time purchase — lifetime access to this course."
                    : isMerchCheckout
                    ? "Review your items and enter payment details."
                    : "Select your plan and enter payment details to get started."}
                </p>
              </div>

              {isCourseCheckout ? (
                /* Course purchase summary */
                <div className="space-y-4">
                  <div className="p-5 border-2 border-primary bg-primary/5 rounded-lg space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                        Course
                      </p>
                      <h2 className="text-xl font-black text-foreground">
                        {course?.title || courseCode}
                      </h2>
                      {course?.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {totalLessons} Lessons
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-neon-purple" />
                        {totalQuizzes} Quizzes
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Award className="w-4 h-4 text-gold" />
                        Certificate of Completion
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {[
                        "Lifetime access to all lessons",
                        "Module quizzes included",
                        "Downloadable certificate on completion",
                        "Self-paced — learn on your schedule",
                      ].map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order total */}
                  <div className="p-5 bg-muted/30 border-2 border-border rounded-lg">
                    <h2 className="font-bold text-foreground mb-3">Order Summary</h2>
                    <div className="flex justify-between text-sm pb-3 border-b border-border">
                      <span className="text-muted-foreground">{course?.title || courseCode}</span>
                      <span className="text-foreground">${COURSE_PRICE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-primary text-lg">
                        ${COURSE_PRICE.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : isMerchCheckout ? (
                /* Merch order summary */
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Your Items
                  </h2>
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center gap-3 p-3 border-2 border-border rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} · Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-5 bg-muted/30 border-2 border-border rounded-lg">
                    <h2 className="font-bold text-foreground mb-3">Order Summary</h2>
                    <div className="space-y-2 pb-3 border-b border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {cartItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                        </span>
                        <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                      </div>
                      {cartTotal >= 100 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-emerald-500 font-bold">FREE</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-primary text-lg">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Subscription tier selector */
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
                  <div className="p-5 bg-muted/30 border-2 border-border rounded-lg">
                    <h2 className="font-bold text-foreground mb-3">Order Summary</h2>
                    <div className="flex justify-between text-sm pb-3 border-b border-border">
                      <span className="text-muted-foreground">{tier.name} Plan (Monthly)</span>
                      <span className="text-foreground">${tier.price}.00</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-primary text-lg">
                        ${tier.price}.00/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Guarantee */}
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                <img src={mascot} alt="HU Mascot" className="w-10 h-10 object-contain" />
                <div className="text-sm">
                  <p className="font-bold text-foreground">
                    {isMerchCheckout ? "Quality Guarantee" : "30-Day Guarantee"}
                  </p>
                  <p className="text-muted-foreground">
                    {isMerchCheckout
                      ? "Premium materials. If it doesn't fit, we'll exchange it."
                      : "Not satisfied? Full refund, no questions."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Payment form */}
            <div className="bg-card border-2 border-border rounded-lg p-6 md:p-8">
              <h2 className="heading-4 text-foreground mb-6">Payment Details</h2>
              <TestPaymentForm
                amount={paymentAmount}
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
                <strong className="text-foreground">Note:</strong> Hoodtorial University is a
                teaching platform and learning community — not an accredited institution.
                Completion results in a certificate of completion, not a formal academic degree.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
