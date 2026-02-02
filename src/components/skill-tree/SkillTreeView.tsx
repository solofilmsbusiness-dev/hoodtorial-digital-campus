import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SkillNode, type SkillNodeData } from "./SkillNode";
import { SkillTreeConnector } from "./SkillTreeConnector";
import { SkillNodeDetail } from "./SkillNodeDetail";
import { cn } from "@/lib/utils";

interface SkillTreeConnection {
  from: string;
  to: string;
}

interface SkillTreeViewProps {
  nodes: SkillNodeData[];
  connections: SkillTreeConnection[];
}

export function SkillTreeView({ nodes, connections }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);

  const nodeMap = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as Record<string, SkillNodeData>);
  }, [nodes]);

  const handleNodeClick = (node: SkillNodeData) => {
    setSelectedNode(node);
  };

  const handleCloseDetail = () => {
    setSelectedNode(null);
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background" />

      {/* Tree container */}
      <div 
        className={cn(
          "relative w-full h-full min-h-[600px] transition-all duration-300",
          selectedNode && "pr-80 md:pr-96"
        )}
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((connection, index) => {
            const fromNode = nodeMap[connection.from];
            const toNode = nodeMap[connection.to];
            if (!fromNode || !toNode) return null;

            const isActive = 
              fromNode.status === "completed" || 
              toNode.status === "available" || 
              toNode.status === "in-progress";

            return (
              <SkillTreeConnector
                key={`${connection.from}-${connection.to}`}
                fromNode={fromNode}
                toNode={toNode}
                isActive={isActive}
              />
            );
          })}
        </svg>

        {/* Skill nodes */}
        {nodes.map((node) => (
          <SkillNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={handleNodeClick}
          />
        ))}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 left-4 p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Legend
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted/50 border-2 border-border" />
              <span className="text-xs text-muted-foreground">Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-card border-2 border-primary/50" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 border-2 border-primary" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Node detail panel */}
      <SkillNodeDetail node={selectedNode} onClose={handleCloseDetail} />
    </div>
  );
}
