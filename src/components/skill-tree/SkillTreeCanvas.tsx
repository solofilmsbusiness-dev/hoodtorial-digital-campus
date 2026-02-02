import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.15;

export function SkillTreeCanvas({ nodes, connections }: SkillTreeCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<(SkillNodeData & { department?: DepartmentId }) | null>(null);
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(0.85);
    if (containerSize.width > 0 && canvasWidth > 0) {
      const initialX = (containerSize.width - canvasWidth * 0.85) / 2;
      setPosition({ x: initialX, y: 20 });
    }
  }, [containerSize.width, canvasWidth]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP / 2 : ZOOM_STEP / 2;
    setScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

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

  // Touch support
  const getTouchDistance = useCallback((touches: React.TouchList): number => {
    const [touch1, touch2] = [touches[0], touches[1]];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
      setLastPinchDistance(null);
    } else if (e.touches.length === 2) {
      e.preventDefault();
      setIsDragging(false);
      setLastPinchDistance(getTouchDistance(e.touches));
    }
  }, [position, getTouchDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && lastPinchDistance !== null) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance - lastPinchDistance;
      const zoomSensitivity = 0.003;
      
      setScale((prev) => {
        const newScale = prev + delta * zoomSensitivity;
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
      });
      
      setLastPinchDistance(currentDistance);
    }
  }, [isDragging, dragStart, lastPinchDistance, getTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPinchDistance(null);
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

      {/* Zoom controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 z-20 flex flex-col gap-2 p-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
          className="h-9 w-9"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="text-xs text-center text-muted-foreground font-mono px-1">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
          className="h-9 w-9"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="w-full h-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          className="h-9 w-9"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </motion.div>

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
            <span>Drag to pan • Scroll to zoom</span>
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
