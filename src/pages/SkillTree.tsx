import { useParams, Navigate } from "react-router-dom";
import { JourneyView } from "@/components/journey";
import type { DegreePath } from "@/hooks/useSkillTree";

const validPaths = ["associate", "bachelor", "certificate"];

export default function SkillTree() {
  const { path } = useParams<{ path: string }>();

  // Validate path parameter
  if (!path || !validPaths.includes(path)) {
    return <Navigate to="/degrees" replace />;
  }

  const degreePath = path as DegreePath;

  return <JourneyView path={degreePath} />;
}
