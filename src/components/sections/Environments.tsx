import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Maximize2 } from 'lucide-react';
import { gallery } from '../../data/project';
import Modal from '../ui/Modal';
import SectionLabel from '../ui/SectionLabel';

export default function Environments() {
  const [active, setActive] = useState<number | null>(null);
  const [filter, setFilter] = useState('Todos');
  const filtered = gallery
    .map((item, index) => ({ ...item, index }))
    .filter((item) => filter === 'Todos' || item.category === filter);
  const next = (delta: number) =>
    setActive((index) =>
      index === null ? null : (index + delta + gallery.length) % gallery.length,
    );
  return (
    <section className="environments section wrap" id="ambientes">
      <div className="environments__head reveal">
        <div>
          <SectionLabel number="04">DA ARQUITETURA À ATMOSFERA</SectionLabel>
          <h2>
            O privilégio de
            <br />
            <em>se sentir em casa.</em>
          </h2>
        </div>
        <div>
          <p>
            Texturas que acolhem. Luz que convida.
            <br />
            Ambientes para estar presente.
          </p>
          <a className="text-link text-link--dark" href="#galeria">
            Explore os ambientes <ArrowDown size={15} />
          </a>
        </div>
      </div>
      <div className="environment-feature reveal">
        <button onClick={() => setActive(2)} aria-label="Ampliar imagem do rooftop e piscina">
          <img
            src="/images/rooftop.webp"
            alt={gallery[2].alt}
            loading="lazy"
            width="1672"
            height="940"
          />
          <span className="environment-feature__shade" />
          <span className="environment-feature__copy">
            <span className="eyebrow">ACIMA DE TUDO, BEM-ESTAR.</span>
            <strong>
              Seu tempo.
              <br />
              <em>Seu horizonte.</em>
            </strong>
            <span>Piscina com borda infinita e lounge no rooftop.</span>
          </span>
          <span className="image-expand">
            <Maximize2 size={20} />
          </span>
        </button>
      </div>
      <div className="gallery-heading" id="galeria">
        <span className="eyebrow">UM OLHAR MAIS PRÓXIMO</span>
        <div className="gallery-filters" role="group" aria-label="Filtrar galeria">
          {['Todos', 'Interiores', 'Áreas comuns', 'Arquitetura'].map((item) => (
            <button
              key={item}
              aria-pressed={filter === item}
              className={filter === item ? 'is-active' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="editorial-gallery">
        {filtered.map((item, i) => (
          <figure
            className={`editorial-gallery__item editorial-gallery__item--${i}`}
            key={item.title}
          >
            <button onClick={() => setActive(item.index)} aria-label={`Ampliar ${item.title}`}>
              <img src={item.src} alt={item.alt} loading="lazy" width="1672" height="940" />
              <span className="image-expand">
                <ArrowUpRight size={22} />
              </span>
            </button>
            <figcaption>
              <div>
                <span>
                  0{item.index + 1} / {item.category}
                </span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.note}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      {active !== null && (
        <Modal wide title={gallery[active].title} onClose={() => setActive(null)}>
          <div
            className="lightbox"
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') next(1);
              if (event.key === 'ArrowLeft') next(-1);
            }}
          >
            <img src={gallery[active].src} alt={gallery[active].alt} />
            <div className="lightbox__caption">
              <div>
                <span className="eyebrow">
                  0{active + 1} / 0{gallery.length} — {gallery[active].category}
                </span>
                <h3>{gallery[active].title}</h3>
                <p>Perspectiva ilustrativa do projeto conceitual.</p>
              </div>
              <div>
                <button
                  className="icon-button"
                  aria-label="Imagem anterior"
                  onClick={() => next(-1)}
                >
                  <ArrowLeft />
                </button>
                <button className="icon-button" aria-label="Próxima imagem" onClick={() => next(1)}>
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
