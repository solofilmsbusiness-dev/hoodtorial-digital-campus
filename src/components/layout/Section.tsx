import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}

export function Section({ children, className, id, dark = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        dark && "bg-charcoal-dark",
        className
      )}
    >
      <div className="container-wide">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ 
  eyebrow, 
  title, 
  description, 
  centered = false,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-12 md:mb-16",
      centered && "text-center",
      className
    )}>
      {eyebrow && (
        <span className="label-tape mb-4 inline-block">
          {eyebrow}
        </span>
      )}
      <h2 className="heading-2 text-foreground mt-2">
        {title}
      </h2>
      {description && (
        <p className="body-large text-muted-foreground mt-4 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
