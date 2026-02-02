import { useParams, Navigate } from "react-router-dom";
import { SkillTreeHeader, SkillTreeView } from "@/components/skill-tree";
import { useSkillTree, type DegreePath } from "@/hooks/useSkillTree";

const validPaths = ["associate", "bachelor", "certificate"];

export default function SkillTree() {
  const { path } = useParams<{ path: string }>();

  // Validate path parameter
  if (!path || !validPaths.includes(path)) {
    return <Navigate to="/degrees" replace />;
  }

  const degreePath = path as DegreePath;
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
  } = useSkillTree(degreePath);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SkillTreeHeader
        pathName={pathName}
        totalCredits={totalCredits}
        earnedCredits={earnedCredits}
        totalSkillPoints={totalSkillPoints}
        earnedSkillPoints={earnedSkillPoints}
        completedNodes={completedNodes}
        totalNodes={totalNodes}
      />
      <SkillTreeView nodes={nodes} connections={connections} />
    </div>
  );
}
