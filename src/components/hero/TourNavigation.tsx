import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { tourStops } from '../../lib/apartmentTour.mjs';

export default function TourNavigation({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (index: number) => void;
}) {
  const last = index === tourStops.length - 1;
  return (
    <nav className="tour-nav" aria-label="Ambientes do apartamento">
      <div className="tour-nav__rooms">
        {tourStops.map((room, number) => (
          <button
            type="button"
            key={room.name}
            aria-label={room.title}
            aria-current={number === index ? 'step' : undefined}
            onClick={() => onSelect(number)}
          >
            <span aria-hidden="true">{String(number + 1).padStart(2, '0')}</span>
            <span aria-hidden="true" className="tour-nav__room-name">
              {room.name}
            </span>
          </button>
        ))}
      </div>
      <div className="tour-nav__arrows">
        <button
          type="button"
          aria-label={index === 0 ? 'Voltar à fachada' : 'Ambiente anterior'}
          onClick={() => onSelect(index - 1)}
        >
          <ArrowLeft size={17} />
        </button>
        {last ? (
          <a href="#projeto" className="tour-nav__continue">
            Ver projeto <ArrowDown size={16} />
          </a>
        ) : (
          <button type="button" className="tour-nav__continue" onClick={() => onSelect(index + 1)}>
            Próximo ambiente <ArrowRight size={17} />
          </button>
        )}
      </div>
    </nav>
  );
}
