import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CountingNumberProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountingNumber({
  value,
  duration = 2,
  className = "",
  prefix = "",
  suffix = "",
}: CountingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Handle non-numeric values like "∞"
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    return Math.round(current);
  });

  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);

  useEffect(() => {
    if (isInView && !hasAnimated && isNumeric) {
      setHasAnimated(true);
      spring.set(numericValue);
    }
  }, [isInView, hasAnimated, numericValue, spring, isNumeric]);

  useEffect(() => {
    if (!isNumeric) return;
    
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [display, isNumeric]);

  if (!isNumeric) {
    return (
      <motion.span
        ref={ref}
        className={className}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {prefix}{value}{suffix}
      </motion.span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
