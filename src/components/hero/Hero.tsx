import { lazy, Suspense, useCallback, useState } from 'react';
import { ArrowDown, ArrowUpRight, MoveDown, Pause, Play } from 'lucide-react';
import { chapters } from '../../data/project';
import { useScrollTimeline } from '../../hooks/useScrollTimeline';
import { range } from '../../lib/timeline.mjs';
import SceneBoundary from '../ui/SceneBoundary';

const BuildingScene = lazy(() => import('../scene/BuildingScene'));

function ArchitecturalFallback({ progress, reduced }: { progress: number; reduced: boolean }) {
  const floors = reduced ? 22 : Math.min(22, Math.floor(progress * 45) + 1);
  return (
    <div
      className="architectural-fallback"
      role="img"
      aria-label="Representação arquitetônica da torre, com 22 pavimentos construídos progressivamente."
    >
      <svg viewBox="0 0 400 700" fill="none" aria-hidden="true">
        <g stroke="#b59870" strokeWidth="1">
          <path d="m95 610 125 35 100-70-123-29Z" />
          <path d="M110 602V95l118 25v513M228 120l78-51v507M110 95l78-46 118 20" opacity=".25" />
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i} opacity={i < floors ? 1 : 0.12}>
              <path d={`M110 ${601 - i * 23}l118 29 78-52M110 ${598 - i * 23}l118 29 78-52`} />
              <path d={`M135 ${600 - i * 23}v-20m30 27v-20m30 27v-20m58 12v-20m26 3v-20`} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function Hero({
  reduced,
  systemReduced,
  onToggleMotion,
  onContact,
}: {
  reduced: boolean;
  systemReduced: boolean;
  onToggleMotion: () => void;
  onContact: () => void;
}) {
  const { section, progressRef, progress, goTo } = useScrollTimeline(reduced);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const chapter = reduced ? 0 : progress < 0.21 ? 0 : progress < 0.52 ? 1 : progress < 0.89 ? 2 : 3;
  const interiorOpacity = reduced ? 0 : range(progress, 0.971, 0.997);
  return (
    <section
      ref={section}
      id="inicio"
      className={`hero ${reduced ? 'hero--reduced' : ''}`}
      aria-label="A experiência Vertex"
    >
      <div className={`hero__sticky hero__sticky--chapter-${chapter}`}>
        <div className="hero__atmosphere" />
        <div className={`hero__scene ${progress > 0.78 && !reduced ? 'hero__scene--close' : ''}`}>
          {(!ready || failed) && <ArchitecturalFallback progress={progress} reduced={reduced} />}
          {!failed && (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <BuildingScene
                  progress={progressRef}
                  reduced={reduced}
                  onReady={onReady}
                  onError={onError}
                />
              </Suspense>
            </SceneBoundary>
          )}
        </div>
        <div className="hero__interior" style={{ opacity: interiorOpacity }} aria-hidden="true">
          <img src="/images/living.webp" alt="" fetchPriority="high" />
        </div>
        <div className="hero__shade" />
        <div className="hero__eyebrow">
          <span className="status-dot" /> UMA NOVA PERSPECTIVA DE MORAR{' '}
          <span className="hero__edition">SÃO PAULO · EDIÇÃO 01</span>
        </div>
        <div className="hero__copy" key={chapter}>
          <span className="eyebrow hero__chapter-label">
            {
              [
                'DO PRIMEIRO TRAÇO A UM NOVO HORIZONTE',
                '01 / A INTENÇÃO GANHA FORMA',
                '02 / A ARQUITETURA ENCONTRA A CIDADE',
                '03 / BEM-VINDO AO SEU ESPAÇO',
              ][chapter]
            }
          </span>
          {chapter === 0 && (
            <>
              <h1>
                O próximo
                <br />
                <em>horizonte.</em>
              </h1>
              <p>
                Um novo ponto de vista.
                <br />
                Um novo jeito de pertencer.
              </p>
              <div className="hero__actions">
                <button
                  className="button button--filled"
                  onClick={() =>
                    reduced ? document.getElementById('projeto')?.scrollIntoView() : goTo(0.34)
                  }
                >
                  Explore o projeto <ArrowUpRight size={17} />
                </button>
                <button className="text-link" onClick={onContact}>
                  Agendar visita <ArrowUpRight size={15} />
                </button>
              </div>
            </>
          )}
          {chapter === 1 && (
            <>
              <h2>
                Cada traço.
                <br />
                <em>Uma intenção.</em>
              </h2>
              <p>
                22 pavimentos. Uma torre.
                <br />A expressão de uma arquitetura que se eleva.
              </p>
            </>
          )}
          {chapter === 2 && (
            <>
              <h2>
                A cidade,
                <br />
                sob outra
                <br />
                <em>perspectiva.</em>
              </h2>
              <p>
                Linhas que acolhem a luz.
                <br />
                Espaços que ampliam o olhar.
              </p>
            </>
          )}
          {chapter === 3 && (
            <>
              <h2>
                Por dentro,
                <br />
                <em>a sua essência.</em>
              </h2>
              <p>
                Madeira, luz e proporção.
                <br />O conforto está em cada escolha.
              </p>
              <a className="button button--filled" href="#projeto">
                Conheça o Vertex <ArrowDown size={16} />
              </a>
            </>
          )}
        </div>
        <div
          className="hero__annotation"
          style={{ opacity: chapter === 0 || chapter === 2 ? 1 : 0 }}
          aria-hidden="true"
        >
          <span className="hero__annotation-line" />
          <span>
            22 PAVIMENTOS
            <br />
            <small>DESENHADOS PARA O HORIZONTE</small>
          </span>
        </div>
        <div className="hero__bottom">
          <button
            className="scroll-cue"
            onClick={() =>
              reduced
                ? document.getElementById('projeto')?.scrollIntoView()
                : goTo(Math.min(1, progress + 0.22))
            }
          >
            <span className="scroll-cue__icon">
              <MoveDown size={19} />
            </span>
            <span>
              ROLE PARA
              <br />
              <strong>VER NASCER.</strong>
            </span>
          </button>
          {!reduced && (
            <nav className="chapters" aria-label="Capítulos da experiência">
              {chapters.map((item, index) => (
                <button
                  key={item.name}
                  aria-label={`0${index + 1} ${item.name}`}
                  onClick={() => goTo(item.progress)}
                  aria-current={chapter === index ? 'step' : undefined}
                  className={chapter === index ? 'is-active' : ''}
                >
                  <span>0{index + 1}</span>
                  <span>{item.name}</span>
                  <i />
                </button>
              ))}
            </nav>
          )}
          <button
            className="motion-control"
            onClick={onToggleMotion}
            aria-pressed={reduced}
            disabled={systemReduced}
            aria-label={
              systemReduced
                ? 'Movimento reduzido conforme preferência do sistema'
                : reduced
                  ? 'Ativar animações da experiência'
                  : 'Reduzir movimentos'
            }
          >
            {reduced ? <Play size={12} /> : <Pause size={12} />}
            <span>{reduced ? 'Movimento reduzido' : 'Reduzir movimento'}</span>
          </button>
        </div>
        <div className="hero__progress" style={{ transform: `scaleX(${progress})` }} />
        {failed && (
          <span className="sr-only">
            A maquete 3D está indisponível. A representação arquitetônica e todas as informações do
            projeto continuam disponíveis.
          </span>
        )}
      </div>
    </section>
  );
}
