import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { ArrowUpRight, MoveDown, Pause, Play } from 'lucide-react';
import { chapters } from '../../data/project';
import { useScrollTimeline } from '../../hooks/useScrollTimeline';
import { tourStops } from '../../lib/apartmentTour.mjs';
import SceneBoundary from '../ui/SceneBoundary';
import Logo from '../ui/Logo';
import TourNavigation from './TourNavigation';

const BuildingScene = lazy(() => import('../scene/BuildingScene'));

function ArchitecturalFallback({ floors }: { floors: number }) {
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
}: {
  reduced: boolean;
  systemReduced: boolean;
  onToggleMotion: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const { section, viewport, meter, progressRef, step, floors, goTo } = useScrollTimeline(
    reduced,
    failed,
  );
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [reducedRoom, setReducedRoom] = useState(-1);
  const reducedProgress = useRef(chapters[2].progress);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const loading = !ready && !failed;
  const roomIndex = reduced ? reducedRoom : step - 3;
  const currentRoom = tourStops[roomIndex];
  const chapter = currentRoom ? 3 : reduced ? 0 : Math.min(step, 2);
  const selectRoom = (index: number) => {
    const destination = tourStops[index]?.at ?? chapters[2].progress;
    if (reduced) {
      reducedProgress.current = destination;
      setReducedRoom(index);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      goTo(destination);
    }
  };
  const toggleMotion = () => {
    if (!reduced) {
      reducedProgress.current = currentRoom?.at ?? chapters[2].progress;
      setReducedRoom(currentRoom ? roomIndex : -1);
    }
    onToggleMotion();
    // Wait for the hero's height to change before repositioning the viewport.
    requestAnimationFrame(() => {
      if (reduced && currentRoom) goTo(currentRoom.at);
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  };
  return (
    <section
      ref={section}
      id="inicio"
      className={`hero ${reduced ? 'hero--reduced' : ''}`}
      aria-label="A experiência Vertex"
    >
      <div ref={viewport} className={`hero__sticky hero__sticky--chapter-${chapter}`}>
        <div className="hero__atmosphere" />
        <div
          className="hero__scene"
          aria-hidden={loading}
          style={{ visibility: loading ? 'hidden' : 'visible' }}
        >
          {failed && <ArchitecturalFallback floors={floors} />}
          {!failed && (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <BuildingScene
                  progress={reduced ? reducedProgress : progressRef}
                  reduced={reduced}
                  onProgress={setLoadingPercent}
                  onReady={onReady}
                  onError={onError}
                />
              </Suspense>
            </SceneBoundary>
          )}
        </div>
        <div className="hero__shade" />
        <div className="hero__interface" inert={loading} aria-hidden={loading}>
          {chapter !== 3 && (
            <div className="hero__eyebrow">
              <span className="status-dot" /> UMA NOVA PERSPECTIVA DE MORAR{' '}
              <span className="hero__edition">SÃO PAULO · EDIÇÃO 01</span>
            </div>
          )}
          {currentRoom ? (
            <div className="hero__copy hero__tour-copy" aria-live="polite" aria-atomic="true">
              <h1 className="sr-only">VERTEX RESIDENCES — Visita ao apartamento</h1>
              <div className="tour-room" key={currentRoom.name}>
                <span className="eyebrow hero__chapter-label">
                  {failed ? 'ROTEIRO DO APARTAMENTO' : 'TOUR DO APARTAMENTO'} ·{' '}
                  {String(roomIndex + 1).padStart(2, '0')}/
                  {String(tourStops.length).padStart(2, '0')}
                </span>
                <h2>{currentRoom.title}</h2>
                <p className="tour-room__description">{currentRoom.description}</p>
              </div>
            </div>
          ) : (
            <div className="hero__copy" key={chapter}>
              {chapter > 0 && <h1 className="sr-only">VERTEX RESIDENCES — O próximo horizonte.</h1>}
              <span className="eyebrow hero__chapter-label">
                {
                  [
                    'DO PRIMEIRO TRAÇO A UM NOVO HORIZONTE',
                    '01 / A INTENÇÃO GANHA FORMA',
                    '02 / A ARQUITETURA ENCONTRA A CIDADE',
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
                        reduced
                          ? document.getElementById('projeto')?.scrollIntoView()
                          : goTo(chapters[1].progress)
                      }
                    >
                      Explore o projeto <ArrowUpRight size={17} />
                    </button>
                    <button className="text-link" onClick={() => selectRoom(0)}>
                      Tour do apartamento <ArrowUpRight size={15} />
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
                  <button
                    type="button"
                    className="button button--filled"
                    onClick={() => selectRoom(0)}
                  >
                    Visitar apartamento <ArrowUpRight size={17} />
                  </button>
                </>
              )}
            </div>
          )}
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
          <div className={`hero__bottom ${currentRoom ? 'hero__bottom--tour' : ''}`}>
            {currentRoom ? (
              <TourNavigation index={roomIndex} onSelect={selectRoom} />
            ) : (
              <>
                <button
                  className="scroll-cue"
                  onClick={() => (reduced ? selectRoom(0) : goTo(chapters[chapter + 1].progress))}
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
              </>
            )}
            <button
              className="motion-control"
              onClick={toggleMotion}
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
          <div ref={meter} className="hero__progress" />
        </div>
        <div className="scene-loading" aria-hidden={!loading}>
          <div className="scene-loading__content">
            <Logo />
            <span className="scene-loading__label" id="scene-loading-label">
              {loadingPercent < 75 ? 'Carregando a experiência 3D' : 'Preparando o tour 3D'}
            </span>
            <div
              className="scene-loading__progress"
              role="progressbar"
              aria-labelledby="scene-loading-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={loadingPercent}
            >
              <span aria-hidden="true">
                {loadingPercent}
                <small>%</small>
              </span>
              <i style={{ transform: `scaleX(${loadingPercent / 100})` }} />
            </div>
          </div>
        </div>
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
