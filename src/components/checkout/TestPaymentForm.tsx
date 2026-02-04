import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestPaymentFormProps {
  amount: number;
  onSubmit: (cardNumber: string) => void;
  isProcessing: boolean;
}

// Test card numbers for simulation
const TEST_CARDS = {
  SUCCESS: "4242424242424242",
  DECLINED: "4000000000000002",
  INSUFFICIENT: "4000000000009995",
};

export function TestPaymentForm({ amount, onSubmit, isProcessing }: TestPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<{ card?: string; expiry?: string; cvc?: string }>({});

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
    setErrors((prev) => ({ ...prev, card: undefined }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
    setErrors((prev) => ({ ...prev, expiry: undefined }));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvc(digits);
    setErrors((prev) => ({ ...prev, cvc: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const rawCard = cardNumber.replace(/\s/g, "");

    if (rawCard.length !== 16) {
      newErrors.card = "Card number must be 16 digits";
    }

    const [month, year] = expiry.split("/");
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      newErrors.expiry = "Invalid expiry date";
    }

    if (cvc.length < 3) {
      newErrors.cvc = "CVC must be 3-4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(cardNumber.replace(/\s/g, ""));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Test mode banner */}
      <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-primary">
          <strong>TEST MODE</strong> – Use card 4242 4242 4242 4242 for success
        </p>
      </div>

      {/* Card Number */}
      <div className="space-y-2">
        <Label htmlFor="card" className="text-xs font-bold uppercase tracking-wide">
          Card Number
        </Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="card"
            type="text"
            value={cardNumber}
            onChange={handleCardChange}
            placeholder="4242 4242 4242 4242"
            className={cn(
              "pl-10 bg-background/50 border-2",
              errors.card ? "border-destructive" : "border-border focus:border-primary"
            )}
            disabled={isProcessing}
          />
        </div>
        {errors.card && <p className="text-xs text-destructive">{errors.card}</p>}
      </div>

      {/* Expiry & CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-wide">
            Expiry Date
          </Label>
          <Input
            id="expiry"
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
            placeholder="MM/YY"
            className={cn(
              "bg-background/50 border-2",
              errors.expiry ? "border-destructive" : "border-border focus:border-primary"
            )}
            disabled={isProcessing}
          />
          {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvc" className="text-xs font-bold uppercase tracking-wide">
            CVC
          </Label>
          <Input
            id="cvc"
            type="text"
            value={cvc}
            onChange={handleCvcChange}
            placeholder="123"
            className={cn(
              "bg-background/50 border-2",
              errors.cvc ? "border-destructive" : "border-border focus:border-primary"
            )}
            disabled={isProcessing}
          />
          {errors.cvc && <p className="text-xs text-destructive">{errors.cvc}</p>}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isProcessing} className="w-full btn-brutal">
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Pay ${amount}/month
          </span>
        )}
      </Button>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          SSL Secured
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3" />
          PCI Compliant
        </span>
      </div>

      {/* Test card reference */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <p className="text-xs font-bold text-foreground mb-2">Test Card Numbers:</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code> → Success
          </p>
          <p>
            <code className="bg-muted px-1 rounded">4000 0000 0000 0002</code> → Card Declined
          </p>
          <p>
            <code className="bg-muted px-1 rounded">4000 0000 0000 9995</code> → Insufficient Funds
          </p>
        </div>
      </div>
    </form>
  );
}
