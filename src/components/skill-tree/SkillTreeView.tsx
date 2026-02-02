import { useSkillTree } from "@/hooks/useSkillTree";
import { SkillTreeStats } from "./SkillTreeStats";
import { SkillTreeCanvas } from "./SkillTreeCanvas";
import type { DegreePath } from "@/hooks/useSkillTree";

interface SkillTreeViewProps {
  path: DegreePath;
}

export function SkillTreeView({ path }: SkillTreeViewProps) {
  const {
    nodes,
    connections,
    pathName,
    totalCredits,
    earnedCredits,
    totalSkillPoints,
    earnedSkillPoints,
    completedNodes,
    totalNodes,
  } = useSkillTree(path);

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Stats header */}
      <SkillTreeStats
        pathName={pathName}
        totalSkillPoints={totalSkillPoints}
        earnedSkillPoints={earnedSkillPoints}
        totalCredits={totalCredits}
        earnedCredits={earnedCredits}
        completedNodes={completedNodes}
        totalNodes={totalNodes}
      />

      {/* Interactive skill tree canvas */}
      <SkillTreeCanvas nodes={nodes} connections={connections} />
    </div>
  );
}
