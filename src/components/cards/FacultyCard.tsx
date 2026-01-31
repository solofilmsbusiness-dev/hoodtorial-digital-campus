import { cn } from "@/lib/utils";

interface FacultyCardProps {
  name: string;
  role: string;
  expertise: string[];
  bio?: string;
  imageUrl?: string;
  className?: string;
}

export function FacultyCard({
  name,
  role,
  expertise,
  bio,
  imageUrl,
  className,
}: FacultyCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-lg overflow-hidden card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-light to-charcoal">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="heading-4 text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-primary uppercase tracking-wide font-medium mt-1">
          {role}
        </p>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {expertise.map((skill, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
