import { useParams, Navigate } from "react-router-dom";
import { SkillTreeView } from "@/components/skill-tree";
import type { DegreePath } from "@/hooks/useSkillTree";

const validPaths = ["associate", "bachelor", "certificate"];

export default function SkillTree() {
  const { path } = useParams<{ path: string }>();

  // Validate path parameter
  if (!path || !validPaths.includes(path)) {
    return <Navigate to="/degrees" replace />;
  }

  const degreePath = path as DegreePath;

  return <SkillTreeView path={degreePath} />;
}
