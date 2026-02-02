import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkillNodeHex, type SkillNodeData } from "./SkillNodeHex";
import { SkillPathway, SkillPathwayDefs } from "./SkillPathway";
import { DepartmentLane } from "./DepartmentLane";
import { SkillTreeMinimap } from "./SkillTreeMinimap";
import { NodeDetailSheet } from "./NodeDetailSheet";
import { 
  useSkillTreeLayout, 
  departmentConfigs, 
  departmentOrder,
  type DepartmentId 
} from "@/hooks/useSkillTreeLayout";

interface SkillTreeConnection {
  from: string;
  to: string;
}

interface SkillTreeCanvasProps {
  nodes: SkillNodeData[];
  connections: SkillTreeConnection[];
}

export function SkillTreeCanvas({ nodes, connections }: SkillTreeCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<(SkillNodeData & { department?: DepartmentId }) | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fixed scale - no zooming
  const scale = 1;

  // Use the layout hook to position nodes
  const { nodes: layoutNodes, canvasWidth, canvasHeight, laneWidth } = useSkillTreeLayout(nodes);

  // Create node map for quick lookup
  const nodeMap = useMemo(() => {
    const map: Record<string, SkillNodeData & { department?: DepartmentId }> = {};
    layoutNodes.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  }, [layoutNodes]);

  // Track container size for minimap
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Center the view initially
  useEffect(() => {
    if (containerSize.width > 0 && canvasWidth > 0) {
      const initialX = (containerSize.width - canvasWidth * scale) / 2;
      const initialY = 20;
      setPosition({ x: initialX, y: initialY });
    }
  }, [containerSize.width, canvasWidth, scale]);

  const handleNodeClick = (node: SkillNodeData) => {
    const layoutNode = nodeMap[node.id];
    setSelectedNode(layoutNode || node);
  };

  const handleCloseDetail = () => {
    setSelectedNode(null);
  };

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support - simple panning only (no pinch zoom)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Minimap navigation
  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/30 to-background pointer-events-none" />

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-4 left-4 z-20 p-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Legend
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-muted/50 border-2 border-border opacity-50" />
            <span className="text-xs text-muted-foreground">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-card border-2 border-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary glow-gold" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Move className="w-3 h-3" />
            <span>Drag to pan</span>
          </div>
        </div>
      </motion.div>

      {/* Main canvas container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full h-full min-h-[600px]",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Transformable content */}
        <div
          className="relative origin-top-left"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* SVG layer for lanes and connections */}
          <svg 
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
            style={{ overflow: "visible" }}
          >
            <SkillPathwayDefs />

            {/* Department lanes */}
            {departmentOrder.map((deptId, index) => (
              <DepartmentLane
                key={deptId}
                config={departmentConfigs[deptId]}
                index={index}
                laneWidth={laneWidth}
                laneGap={40}
                height={canvasHeight}
              />
            ))}

            {/* Connection pathways */}
            {connections.map((connection, index) => {
              const fromNode = nodeMap[connection.from];
              const toNode = nodeMap[connection.to];
              if (!fromNode || !toNode) return null;

              const isCompleted = fromNode.status === "completed";
              const isActive = 
                fromNode.status === "completed" || 
                toNode.status === "available" || 
                toNode.status === "in-progress";

              const deptConfig = fromNode.department 
                ? departmentConfigs[fromNode.department]
                : departmentConfigs.cinematography;

              return (
                <SkillPathway
                  key={`${connection.from}-${connection.to}`}
                  fromX={fromNode.position.x}
                  fromY={fromNode.position.y}
                  toX={toNode.position.x}
                  toY={toNode.position.y}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  departmentConfig={deptConfig}
                  index={index}
                />
              );
            })}
          </svg>

          {/* Skill nodes */}
          {layoutNodes.map((node) => {
            const deptConfig = node.department 
              ? departmentConfigs[node.department]
              : departmentConfigs.cinematography;

            return (
              <SkillNodeHex
                key={node.id}
                node={node}
                departmentConfig={deptConfig}
                isSelected={selectedNode?.id === node.id}
                onClick={handleNodeClick}
              />
            );
          })}
        </div>
      </div>

      {/* Minimap */}
      <SkillTreeMinimap
        nodes={layoutNodes}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        viewportX={position.x}
        viewportY={position.y}
        viewportWidth={containerSize.width}
        viewportHeight={containerSize.height}
        scale={scale}
        onNavigate={handleMinimapNavigate}
      />

      {/* Node detail sheet */}
      <NodeDetailSheet node={selectedNode} onClose={handleCloseDetail} />
    </div>
  );
}
