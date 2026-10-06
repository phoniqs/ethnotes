import { resolveFlag, type FlagDef } from '@/lib/flags';

interface FlagStripeProps {
  origin?: string | null;
  region?: string | null;
  group?: string | null;
  className?: string;
}

export default function FlagStripe({ origin, region, group, className = '' }: FlagStripeProps) {
  const flag = resolveFlag(origin, group, region);
  if (!flag || flag.type === 'none') return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 ${className}`}
      role="img"
      aria-label={flag.label ? `Flag of ${flag.label}` : ''}
    >
      <FlagSvg flag={flag} />
    </div>
  );
}

function FlagSvg({ flag }: { flag: FlagDef }) {
  switch (flag.type) {
    case 'tricolor-vertical':
      return (
        <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
          <rect x={0} width={10} height={20} fill={flag.colors[0]} />
          <rect x={10} width={10} height={20} fill={flag.colors[1]} />
          <rect x={20} width={10} height={20} fill={flag.colors[2]} />
        </svg>
      );
    case 'tricolor-horizontal':
      return (
        <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
          <rect y={0} width={30} height={6.67} fill={flag.colors[0]} />
          <rect y={6.67} width={30} height={6.67} fill={flag.colors[1]} />
          <rect y={13.33} width={30} height={6.67} fill={flag.colors[2]} />
        </svg>
      );
    case 'bicolor-horizontal':
      return (
        <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
          <rect y={0} width={30} height={10} fill={flag.colors[0]} />
          <rect y={10} width={30} height={10} fill={flag.colors[1]} />
        </svg>
      );
    case 'nordic-cross':
      return <NordicCross flag={flag} />;
    case 'saltire':
      return <Saltire flag={flag} />;
    case 'split-vertical':
      return <SplitVertical flag={flag} />;
    case 'union-jack':
      return <UnionJack flag={flag} />;
    case 'eu':
      return <EuFlag flag={flag} />;
    case 'solid':
      return (
        <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
          <rect width={30} height={20} fill={flag.colors[0]} />
          {flag.colors.length > 1 && (
            <circle cx={15} cy={10} r={5} fill={flag.colors[1]} opacity={0.85} />
          )}
        </svg>
      );
    default:
      return null;
  }
}

function NordicCross({ flag }: { flag: FlagDef }) {
  if (flag.colors.length === 2) {
    return (
      <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
        <rect width={30} height={20} fill={flag.colors[0]} />
        <rect x={9} width={4} height={20} fill={flag.colors[1]} />
        <rect y={8} width={30} height={4} fill={flag.colors[1]} />
      </svg>
    );
  }
  if (flag.colors.length === 3) {
    return (
      <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
        <rect width={30} height={20} fill={flag.colors[0]} />
        <rect x={8} width={6} height={20} fill={flag.colors[1]} />
        <rect x={9.5} width={3} height={20} fill={flag.colors[2]} />
        <rect y={7} width={30} height={6} fill={flag.colors[1]} />
        <rect y={8.5} width={30} height={3} fill={flag.colors[2]} />
      </svg>
    );
  }
  return <MultiNordic />;
}

function MultiNordic() {
  const palettes = [
    ['#d62828', '#ffffff', '#0033a0'],
    ['#005293', '#fecc00'],
    ['#ed2939', '#ffffff', '#002664'],
    ['#c8102e', '#ffffff'],
    ['#ffffff', '#003580'],
    ['#003897', '#ffffff', '#d72828'],
  ];
  const stripeW = 30 / palettes.length;
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
      {palettes.map((pal, i) => {
        const x = i * stripeW;
        const [bg, cross, inner] = pal;
        return (
          <g key={i}>
            <rect x={x} width={stripeW} height={20} fill={bg} />
            <rect x={x + stripeW * 0.28} width={stripeW * 0.14} height={20} fill={cross} />
            <rect y={8} x={x} width={stripeW} height={4} fill={cross} />
            {inner && (
              <>
                <rect x={x + stripeW * 0.33} width={stripeW * 0.04} height={20} fill={inner} />
                <rect y={9} x={x} width={stripeW} height={2} fill={inner} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Saltire({ flag }: { flag: FlagDef }) {
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
      <rect width={30} height={20} fill={flag.colors[1]} />
      <polygon points="0,0 6,0 30,16 30,20 24,20 0,4" fill={flag.colors[0]} />
      <polygon points="24,0 30,0 30,4 6,20 0,20 0,16" fill={flag.colors[0]} />
    </svg>
  );
}

function SplitVertical({ flag }: { flag: FlagDef }) {
  const left = flag.colors.slice(0, 3);
  const right = flag.colors.slice(3);
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
      <rect x={0} width={5} height={20} fill={left[0]} />
      <rect x={5} width={5} height={20} fill={left[1]} />
      <rect x={10} width={5} height={20} fill={left[2]} />
      <rect x={15} width={5} height={20} fill={right[0]} />
      <rect x={20} width={5} height={20} fill={right[1]} />
      <rect x={25} width={5} height={20} fill={right[2]} />
    </svg>
  );
}

function UnionJack({ flag }: { flag: FlagDef }) {
  const [blue, white, red] = flag.colors;
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
      <rect width={30} height={20} fill={blue} />
      <polygon points="0,0 30,20 30,16 4,0" fill={white} />
      <polygon points="0,20 30,0 30,4 4,20" fill={white} />
      <polygon points="0,0 30,20 30,17.5 2.5,0" fill={red} />
      <polygon points="0,20 30,0 30,2.5 2.5,20" fill={red} />
      <rect x={12} width={6} height={20} fill={white} />
      <rect y={7} width={30} height={6} fill={white} />
      <rect x={13} width={4} height={20} fill={red} />
      <rect y={8} width={30} height={4} fill={red} />
    </svg>
  );
}

function EuFlag({ flag }: { flag: FlagDef }) {
  const [bg, star] = flag.colors;
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" preserveAspectRatio="none">
      <rect width={30} height={20} fill={bg} />
      <g fill={star}>
        <Star cx={15} cy={10} r={2.5} />
      </g>
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points: string[] = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return <polygon points={points.join(' ')} />;
}
