import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  MessageSquareHeart, 
  Shield, 
  ThumbsUp, 
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityGuidelinesProps {
  onClose?: () => void;
}

export function CommunityGuidelines({ onClose }: CommunityGuidelinesProps) {
  return (
    <Card className="card-urban">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Community Guidelines
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Academic Focus</h4>
              <p className="text-xs text-muted-foreground">
                This is a learning space. Keep discussions related to courses, projects, and filmmaking craft.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageSquareHeart className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Constructive Feedback</h4>
              <p className="text-xs text-muted-foreground">
                Offer specific, actionable critique. Focus on the work, not the person.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ThumbsUp className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Respect & Professionalism</h4>
              <p className="text-xs text-muted-foreground">
                Treat peers as future collaborators. Disagree respectfully. Support growth.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Not Allowed</h4>
              <p className="text-xs text-muted-foreground">
                No spam, self-promotion, harassment, or off-topic content. Violations may result in removal.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center italic">
            "The Code: Craft Over Clout, Action Over Theory"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
