import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
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
        <span className="tag-sticker mb-6 inline-block">
          {eyebrow}
        </span>
      )}
      <h2 className="heading-2 text-foreground mt-4">
        {title}
      </h2>
      {description && (
        <p className="body-large text-muted-foreground mt-4 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
