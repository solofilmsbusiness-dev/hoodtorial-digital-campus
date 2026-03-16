import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/animations";
import { ArrowRight } from "lucide-react";

const blocks = [
  {
    number: "01",
    title: "ProjectX Paper Routing",
    items: [
      "Latest run: task 89f78d40-da57-41d5-ab6f-9402874fc551 at 6:28 PM ET",
      "Payload: flat PlaceOrderRequest with accountId, contractId, type, side, size, clientOrderId",
      "Result: broker returned 401 Unauthorized — no order ID, fills, or database entries",
      "Status: paused until Topstep HAR/cURL or support confirmation",
      "Next move: compare HAR vs. our request; escalate if permissions block remains",
    ],
  },
  {
    number: "02",
    title: "Researcher / Architect / Scheduler",
    items: [
      "Replacement Researcher memo for MC-007/MC-008 is still missing",
      "Architect + Scheduler idle",
      "Slate 20260307 frozen until memo lands",
    ],
  },
  {
    number: "03",
    title: "Automation Heartbeats",
    items: [
      "com.hoodtorials.autopost LaunchAgent is healthy",
      "Last Discord post ID: 1482136193994064191",
      "exports/activity.log current through 8:30 PM ET",
    ],
  },
  {
    number: "04",
    title: "Outstanding Needs",
    items: [
      "Topstep HAR/cURL or support confirmation",
      "Replacement Researcher memo",
      "Rerun ProjectX paper test capturing the full proof bundle once unblocked",
    ],
  },
];

export function ProjectXHandoffLog() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container-wide">
        <ScrollReveal>
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mb-1">
                ProjectX Handoff Log — Mar 13, 2026
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Ready to resume when HAR/support response arrives
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blocks.map((block) => (
                  <div
                    key={block.number}
                    className="rounded-lg border border-border bg-muted/40 p-5"
                  >
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-3xl font-black text-primary leading-none">
                        {block.number}
                      </span>
                      <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
                        {block.title}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {block.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button asChild size="lg" className="font-bold uppercase tracking-wide">
                  <Link to="/dashboard/projects">
                    Open Lovable Tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
