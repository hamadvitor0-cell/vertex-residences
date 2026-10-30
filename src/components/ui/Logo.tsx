export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'brand--compact' : ''}`}>
      <svg className="brand__mark" viewBox="0 0 36 43" fill="none" aria-hidden="true">
        <path
          d="M2 3 18 39 34 3M10 3l8 18 8-18M18 39V21"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
      <span className="brand__word">
        VERTEX<span>RESIDENCES</span>
      </span>
    </span>
  );
}
