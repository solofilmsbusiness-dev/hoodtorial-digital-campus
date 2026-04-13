import { Helmet } from "react-helmet-async";
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

  return (
    <>
      <Helmet>
        <title>Skill Tree | Hoodtorial University</title>
        <meta name="description" content="Track your academic skills and progression pathways at Hoodtorial University." />
        <meta property="og:title" content="Skill Tree | Hoodtorial University" />
        <meta property="og:description" content="Track your academic skills and progression pathways at Hoodtorial University." />
        <meta property="og:image" content="https://hoodtorialuniversity.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JourneyView path={degreePath} />
    </>
  );
}
