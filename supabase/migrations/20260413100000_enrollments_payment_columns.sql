-- Add payment tracking columns to enrollments table for per-course purchases
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric(10, 2);

COMMENT ON COLUMN enrollments.payment_status IS 'free | paid | pending';
COMMENT ON COLUMN enrollments.stripe_session_id IS 'Stripe Checkout session ID after real payment integration';
COMMENT ON COLUMN enrollments.amount_paid IS 'Amount charged in USD, null for free/subscription enrollments';
