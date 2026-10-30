import { useState } from 'react';
import { ArrowUpRight, Coffee, GraduationCap, MapPin, Trees, TrainFront } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';

const places = [
  {
    name: 'Gastronomia & encontros',
    label: 'Gastronomia',
    description: 'Cafés de bairro, pequenos bistrôs e mesas que convidam a ficar.',
    Icon: Coffee,
    x: 29,
    y: 32,
  },
  {
    name: 'Verde no seu caminho',
    label: 'Áreas verdes',
    description: 'Praças, parques e trajetos para aproveitar a cidade ao ar livre.',
    Icon: Trees,
    x: 71,
    y: 25,
  },
  {
    name: 'Conexões que aproximam',
    label: 'Mobilidade',
    description: 'Acesso a transporte, ciclovias e aos diferentes ritmos da cidade.',
    Icon: TrainFront,
    x: 66,
    y: 75,
  },
  {
    name: 'O essencial por perto',
    label: 'Serviços & educação',
    description: 'Escolas, serviços e conveniências que simplificam a rotina.',
    Icon: GraduationCap,
    x: 27,
    y: 73,
  },
];

export default function Location() {
  const [selected, setSelected] = useState(0);
  return (
    <section className="location section" id="localizacao">
      <div className="wrap location__grid">
        <div className="location__copy reveal">
          <SectionLabel number="05">A CIDADE À SUA VOLTA</SectionLabel>
          <h2>
            O seu lugar.
            <br />O melhor
            <br />
            <em>ao redor.</em>
          </h2>
          <p>
            Um endereço imaginado para aproximar o que importa. A energia de São Paulo e o respiro
            de uma vida de bairro, em equilíbrio.
          </p>
          <ul className="location__list">
            {places.map((place, index) => (
              <li key={place.label}>
                <button onClick={() => setSelected(index)} aria-pressed={selected === index}>
                  <place.Icon size={19} strokeWidth={1.3} />
                  <span>{place.label}</span>
                  <ArrowUpRight size={15} />
                </button>
              </li>
            ))}
          </ul>
          <span className="location__note">
            <MapPin size={13} /> SÃO PAULO / LOCALIZAÇÃO CONCEITUAL
          </span>
        </div>
        <div className="location__map reveal">
          <svg viewBox="0 0 600 600" fill="none" aria-hidden="true" className="map-art">
            <rect width="600" height="600" fill="#deddd0" />
            <g fill="#c9cdbb">
              <path d="m356 0 130 0-62 127-127-25Z" />
              <path d="m492 207 108 49v153l-150-58Z" />
              <path d="M0 418 75 446 34 600H0Z" />
            </g>
            <g stroke="#eeeee4" strokeWidth="14">
              <path d="M-70 110 650 380M-70 268l720 270M-70-48l720 270M112-50-72 700M280-50 96 700M446-50 262 700M612-50 428 700" />
            </g>
            <g stroke="#f9f7ed" strokeWidth="24">
              <path d="M-30 392 650 646M357-50 171 700" />
            </g>
            <g stroke="#acae9b" strokeWidth="1" strokeDasharray="3 7">
              <path d="M-30 392 650 646M357-50 171 700" />
            </g>
            <g fill="#b9bfaa">
              <path d="m326 185 66 24-20 64-64-25Z" />
              <path d="m111 252 59 22-23 67-54-24Z" />
              <path d="m390 386 62 23-23 65-59-20Z" />
            </g>
            <g fill="#86917c" opacity=".45">
              {Array.from({ length: 16 }, (_, i) => (
                <circle key={i} cx={350 + (i % 4) * 19} cy={27 + Math.floor(i / 4) * 18} r={7} />
              ))}
            </g>
            <g fill="#8c907e" fontSize="9" fontFamily="Manrope" letterSpacing="2">
              <text transform="translate(58 128) rotate(21)">ALAMEDA DOS JARDINS</text>
              <text transform="translate(280 400) rotate(21)">AVENIDA CENTRAL</text>
              <text transform="translate(425 80) rotate(104)">RUA DAS OLIVEIRAS</text>
            </g>
          </svg>
          <div className="map-center">
            <span className="map-center__halo" />
            <span className="map-center__pin">
              <svg viewBox="0 0 36 43" fill="none" aria-hidden="true">
                <path
                  d="M3 4 18 38 33 4M11 4l7 17 7-17M18 38V21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <strong>VERTEX</strong>
          </div>
          {places.map((place, index) => (
            <button
              key={place.label}
              className={`map-point ${selected === index ? 'is-active' : ''}`}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              aria-label={place.name}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <place.Icon size={18} strokeWidth={1.4} />
            </button>
          ))}
          <div className="map-card" aria-live="polite">
            <span className="eyebrow">NA SUA VIZINHANÇA</span>
            <h3>{places[selected].name}</h3>
            <p>{places[selected].description}</p>
          </div>
          <span className="map-disclaimer">MAPA ARTÍSTICO · SEM CORRESPONDÊNCIA GEOGRÁFICA</span>
        </div>
      </div>
    </section>
  );
}
