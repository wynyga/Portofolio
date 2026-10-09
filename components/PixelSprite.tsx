import { PALETTE, SIZE } from "@/lib/astronaut";

// Renders a 16x16 astronaut code as crisp SVG squares. Use a multiple of 16 for `size` so edges stay sharp.
export default function PixelSprite({ code, size = 64, className }: { code: string; size?: number; className?: string }) {
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < code.length; i++) {
    const idx = parseInt(code[i], 16);
    if (!idx) continue;
    cells.push(<rect key={i} x={i % SIZE} y={Math.floor(i / SIZE)} width="1" height="1" fill={PALETTE[idx]} />);
  }
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={size} height={size} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {cells}
    </svg>
  );
}
