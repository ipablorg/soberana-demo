import { getBezierPath, type EdgeProps } from 'reactflow';

interface AnimatedEdgeData {
  active?: boolean;
}

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<AnimatedEdgeData>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isActive = data?.active ?? false;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke={selected ? 'var(--primary)' : 'var(--border)'}
        fill="none"
        strokeOpacity={selected ? 1 : 0.7}
      />
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          strokeWidth={2}
          stroke="var(--primary)"
          strokeDasharray="8 4"
          strokeOpacity={0.9}
          style={{ animation: 'dashdraw 1s linear infinite' }}
        />
      )}
    </>
  );
}
