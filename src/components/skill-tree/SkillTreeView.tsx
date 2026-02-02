import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { SkillNode, type SkillNodeData } from "./SkillNode";
import { SkillTreeConnector } from "./SkillTreeConnector";
import { SkillNodeDetail } from "./SkillNodeDetail";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkillTreeConnection {
  from: string;
  to: string;
}

interface SkillTreeViewProps {
  nodes: SkillNodeData[];
  connections: SkillTreeConnection[];
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export function SkillTreeView({ nodes, connections }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging if we're clicking on the background, not on a node
    if ((e.target as HTMLElement).closest('button')) return;
    
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

  // Touch support for mobile
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
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />

      {/* Zoom controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "absolute top-4 right-4 z-20 flex flex-col gap-2 p-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border",
          selectedNode && "right-[340px] md:right-[400px]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
          className="h-8 w-8"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="text-xs text-center text-muted-foreground font-mono">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
          className="h-8 w-8"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="w-full h-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          className="h-8 w-8"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Tree container with pan/zoom */}
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full h-full min-h-[600px] transition-[padding] duration-300",
          selectedNode && "pr-80 md:pr-96",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onWheel={handleWheel}
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
          className="relative w-full h-full origin-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((connection) => {
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
        </div>
      </div>

      {/* Legend - fixed position */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-4 z-20 p-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border"
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
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[10px] text-muted-foreground">
            <span className="block">Scroll to zoom</span>
            <span className="block">Drag to pan</span>
          </div>
        </div>
      </motion.div>

      {/* Node detail panel */}
      <SkillNodeDetail node={selectedNode} onClose={handleCloseDetail} />
    </div>
  );
}
