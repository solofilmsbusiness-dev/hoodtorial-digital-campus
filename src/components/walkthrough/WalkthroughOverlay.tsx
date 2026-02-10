import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WalkthroughStep } from "./WalkthroughStep";
import type { WalkthroughStep as StepType } from "@/hooks/useWalkthrough";

interface WalkthroughOverlayProps {
  isActive: boolean;
  currentStep: StepType;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function getTooltipPosition(rect: TargetRect, tooltipWidth: number, tooltipHeight: number) {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const centerX = rect.left + rect.width / 2;
  const gap = 12;

  // Prefer bottom
  if (rect.top + rect.height + gap + tooltipHeight < viewportH) {
    return {
      top: rect.top + rect.height + gap,
      left: Math.max(8, Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - 8)),
    };
  }
  // Try top
  if (rect.top - gap - tooltipHeight > 0) {
    return {
      top: rect.top - gap - tooltipHeight,
      left: Math.max(8, Math.min(centerX - tooltipWidth / 2, viewportW - tooltipWidth - 8)),
    };
  }
  // Fallback: right side
  return {
    top: Math.max(8, Math.min(rect.top, viewportH - tooltipHeight - 8)),
    left: Math.min(rect.left + rect.width + gap, viewportW - tooltipWidth - 8),
  };
}

export function WalkthroughOverlay({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: WalkthroughOverlayProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const measureTarget = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      });
      // Scroll into view if needed
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;
    // Measure after a tick to allow scroll
    const timer = setTimeout(measureTarget, 150);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [isActive, measureTarget]);

  if (!isActive || !currentStep) return null;

  const tooltipW = 320;
  const tooltipH = 220; // approximate
  const pos = targetRect ? getTooltipPosition(targetRect, tooltipW, tooltipH) : { top: 100, left: 100 };

  // Build clip-path to create spotlight hole
  const clipPath = targetRect
    ? `polygon(
        0% 0%, 0% 100%, 
        ${targetRect.left}px 100%, 
        ${targetRect.left}px ${targetRect.top}px, 
        ${targetRect.left + targetRect.width}px ${targetRect.top}px, 
        ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, 
        ${targetRect.left}px ${targetRect.top + targetRect.height}px, 
        ${targetRect.left}px 100%, 
        100% 100%, 100% 0%
      )`
    : undefined;

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key="walkthrough-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Dark overlay with spotlight cutout */}
        <div
          className="absolute inset-0 bg-black/60 transition-all duration-300"
          style={{ clipPath }}
          onClick={onSkip}
        />

        {/* Spotlight ring glow */}
        {targetRect && (
          <div
            className="absolute rounded-lg border-2 border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)] pointer-events-none transition-all duration-300"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="absolute z-[10000]"
          style={{ top: pos.top, left: pos.left }}
        >
          <WalkthroughStep
            icon={currentStep.icon}
            title={currentStep.title}
            description={currentStep.description}
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            onNext={onNext}
            onPrev={onPrev}
            onSkip={onSkip}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
