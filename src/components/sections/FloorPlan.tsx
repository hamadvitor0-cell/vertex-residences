import { useId } from 'react';

export default function FloorPlan({ variant }: { variant: number }) {
  const prefix = useId().replace(/:/g, '');
  const three = variant > 0;
  return (
    <svg
      className="floor-plan"
      viewBox="0 0 700 525"
      role="img"
      aria-label={`Planta ilustrativa ${variant === 0 ? 'de duas suítes' : variant === 1 ? 'de três suítes' : 'da cobertura com três suítes e terraço'}`}
    >
      <defs>
        <pattern id={`${prefix}-floor`} width="18" height="90" patternUnits="userSpaceOnUse">
          <path d="M0 0v90m18-90v90M0 0h18M0 45h18" stroke="#c8c0b0" strokeWidth=".5" />
        </pattern>
        <pattern id={`${prefix}-terrace`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0h14v14" fill="none" stroke="#bcb6a7" strokeWidth=".4" />
        </pattern>
      </defs>
      <g transform="translate(38 12)">
        <path d="M55 40h480v360H55z" fill="#e6dfd2" />
        <path
          d="M65 50h210v240H65zm220 0h240v130H285zm0 140h240v100H285z"
          fill={`url(#${prefix}-floor)`}
        />
        <path d="M55 310h480v90H55z" fill={`url(#${prefix}-terrace)`} />
        <g stroke="#575b53" strokeWidth="7" fill="none" strokeLinejoin="miter">
          <path d="M55 310V40h480v270M55 400h480M55 345v55m480-55v55" />
          <path d="M280 40v90m0 43v137M280 185h98m40 0h117" />
          <path d="M390 40v95m0 35v15" />
          {three && <path d="M400 185v70m0 30v25" />}
        </g>
        <g stroke="#7b7d70" strokeWidth="2" fill="none">
          <path d="M55 310h480M55 320h480M65 310v10m110-10v10m110-10v10m110-10v10m110-10v10" />
          <path d="M280 130a43 43 0 0 1-43 43v-43zm110 5a35 35 0 0 1-35 35v-35z" />
          <path d="M378 185a40 40 0 0 1 40 40v-40z" />
          {three && <path d="M400 255a30 30 0 0 1-30 30v-30z" />}
        </g>
        <g fill="#d1c6b3" stroke="#aaa48f" strokeWidth="1">
          <rect x="305" y="58" width="62" height="74" rx="3" />
          <rect x="307" y="60" width="27" height="16" rx="2" />
          <rect x="337" y="60" width="27" height="16" rx="2" />
          <path d="M303 80h66m-32 0v48" />
          <rect x="430" y="58" width="62" height="74" rx="3" />
          <rect x="432" y="60" width="27" height="16" rx="2" />
          <rect x="462" y="60" width="27" height="16" rx="2" />
          <path d="M428 80h66m-32 0v48" />
          {three && (
            <>
              <rect x="435" y="205" width="58" height="65" rx="3" />
              <rect x="438" y="208" width="23" height="14" rx="2" />
              <rect x="465" y="208" width="23" height="14" rx="2" />
            </>
          )}
          <rect x="84" y="193" width="100" height="36" rx="7" />
          <rect x="84" y="193" width="100" height="9" rx="3" />
          <path d="M117 202v25m33-25v25" />
          <rect x="113" y="246" width="52" height="22" rx="11" />
          <rect x="212" y="225" width="26" height="30" rx="5" />
          <rect x="92" y="59" width="143" height="28" />
          <rect x="92" y="59" width="27" height="67" />
          <rect x="167" y="99" width="66" height="29" rx="1" />
          <rect x="96" y="337" width="85" height="28" rx="14" />
          <circle cx="108" cy="379" r="9" />
          <circle cx="167" cy="379" r="9" />
          <rect x="465" y="335" width="45" height="41" rx="3" />
        </g>
        <g fill="#f4efe4" stroke="#aaa48f" strokeWidth="1">
          <rect x="295" y="205" width="35" height="66" rx="3" />
          <ellipse cx="350" cy="218" rx="9" ry="13" />
          <rect x="342" y="249" width="30" height="20" rx="4" />
          {!three && (
            <>
              <rect x="433" y="214" width="69" height="43" rx="22" />
              <circle cx="450" cy="203" r="8" />
              <circle cx="485" cy="203" r="8" />
              <circle cx="450" cy="270" r="8" />
              <circle cx="485" cy="270" r="8" />
            </>
          )}
        </g>
        <g fill="#7a8869">
          <circle cx="79" cy="376" r="11" />
          <circle cx="210" cy="376" r="12" />
          <circle cx="514" cy="381" r="10" />
        </g>
        <g fill="#65665a" fontSize="8" fontFamily="Manrope, sans-serif" letterSpacing="1">
          <text x="113" y="166">
            LIVING INTEGRADO
          </text>
          <text x="129" y="144">
            COZINHA
          </text>
          <text x="309" y="153">
            SUÍTE 01
          </text>
          <text x="437" y="153">
            SUÍTE 02
          </text>
          <text x="319" y="295">
            BANHOS
          </text>
          <text x="437" y="292">
            {three ? 'SUÍTE 03' : 'JANTAR'}
          </text>
          <text x="280" y="364">
            {variant === 2 ? 'TERRAÇO PRIVATIVO' : 'VARANDA INTEGRADA'}
          </text>
        </g>
        <g stroke="#a79d86" strokeWidth=".8" fill="none">
          <path d="M55 423h480m-480-5v10m480-10v10M27 40v360m-5-360h10m-10 360h10" />
        </g>
        <text
          x="276"
          y="440"
          fill="#8a816c"
          fontFamily="Manrope, sans-serif"
          fontSize="8"
          letterSpacing="2"
        >
          ESPAÇOS CONECTADOS
        </text>
        <g transform="translate(580 49)" stroke="#928168" strokeWidth="1" fill="none">
          <path d="m0 22 7-22 7 22-7-6z" />
          <text x="3" y="37" fill="#928168" stroke="none" fontSize="9">
            N
          </text>
        </g>
        {variant === 2 && (
          <g>
            <path d="M55 400h480v45H55z" fill={`url(#${prefix}-terrace)`} stroke="#aaa48f" />
            <rect x="380" y="404" width="140" height="35" fill="#95a8a4" opacity=".7" />
            <text x="175" y="428" fill="#65665a" fontSize="8" letterSpacing="1">
              SOLARIUM
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}
