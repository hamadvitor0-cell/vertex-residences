import { useState } from 'react';
import { ArrowUpRight, BedDouble, Bath, CarFront, Maximize2, MoveUpRight } from 'lucide-react';
import { plans } from '../../data/project';
import SectionLabel from '../ui/SectionLabel';
import Modal from '../ui/Modal';
import FloorPlan from './FloorPlan';

export default function Plans({ onContact }: { onContact: (interest?: string) => void }) {
  const [selected, setSelected] = useState(1);
  const [details, setDetails] = useState(false);
  const plan = plans[selected];
  const selectPlan = (index: number) => setSelected(index);
  return (
    <section className="plans-section section" id="plantas">
      <div className="wrap">
        <div className="plans__head reveal">
          <div>
            <SectionLabel number="03">ENCONTRE A SUA MEDIDA</SectionLabel>
            <h2>
              A vida pede espaço.
              <br />
              <em>Escolha o seu.</em>
            </h2>
          </div>
          <p>
            Três formas de morar.
            <br />O mesmo cuidado em cada metro quadrado.
          </p>
        </div>
        <div
          className="plans__tabs"
          role="tablist"
          aria-label="Opções de planta"
          onKeyDown={(event) => {
            if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 2
                    : (selected + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              selectPlan(next);
              document.getElementById(`plan-tab-${next}`)?.focus();
            }
          }}
        >
          {plans.map((item, index) => (
            <button
              key={item.id}
              id={`plan-tab-${index}`}
              role="tab"
              aria-selected={selected === index}
              aria-controls="plan-panel"
              tabIndex={selected === index ? 0 : -1}
              className={selected === index ? 'is-active' : ''}
              onClick={() => selectPlan(index)}
            >
              <span>
                0{index + 1} / {item.name}
              </span>
              <strong>
                {item.area} <small>m²</small>
              </strong>
              <span>
                {item.suites} suítes <MoveUpRight size={18} />
              </span>
            </button>
          ))}
        </div>
        <div
          id="plan-panel"
          role="tabpanel"
          aria-labelledby={`plan-tab-${selected}`}
          className="plans__display"
        >
          <button
            className="plans__drawing"
            onClick={() => setDetails(true)}
            aria-label={`Ampliar planta ${plan.name} de ${plan.area} metros quadrados`}
          >
            <FloorPlan variant={selected} />
            <span className="plans__enlarge">
              <Maximize2 size={16} /> AMPLIAR PLANTA
            </span>
            <span className="plans__drawing-note">
              PLANTA HUMANIZADA · ILUSTRAÇÃO CONCEITUAL SEM ESCALA
            </span>
          </button>
          <div className="plans__info" key={plan.id}>
            <span className="eyebrow">
              {plan.type} / {plan.name}
            </span>
            <p className="plans__area">
              {plan.area}
              <span>m²</span>
            </p>
            <h3>{plan.description}</h3>
            <div className="plans__specs">
              <span>
                <BedDouble size={18} />
                {plan.suites} suítes
              </span>
              <span>
                <Bath size={18} />
                {plan.bathrooms} banheiros
              </span>
              <span>
                <CarFront size={18} />
                {plan.parking} vagas
              </span>
              <span>
                <MoveUpRight size={18} />
                {plan.terrace}
              </span>
            </div>
            <button className="button button--filled" onClick={() => setDetails(true)}>
              Ver detalhes <ArrowUpRight size={16} />
            </button>
            <button
              className="text-link"
              onClick={() => onContact(`${plan.name} · ${plan.area} m²`)}
            >
              Tenho interesse nesta planta <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <p className="plans__disclaimer">
          Metragens e configurações ilustrativas. Layouts conceituais, sem escala, desenvolvidos
          exclusivamente para esta demonstração.
        </p>
        {details && (
          <Modal wide title={`Detalhes da planta ${plan.name}`} onClose={() => setDetails(false)}>
            <div className="plan-detail">
              <div className="plan-detail__drawing">
                <FloorPlan variant={selected} />
              </div>
              <div>
                <span className="eyebrow">VERTEX / {plan.type}</span>
                <h2>
                  {plan.name}
                  <em>{plan.area} m²</em>
                </h2>
                <p>{plan.detail}</p>
                <p>
                  {plan.suites} suítes · {plan.bathrooms} banheiros · {plan.parking} vagas
                </p>
                <button
                  className="button button--filled"
                  onClick={() => {
                    setDetails(false);
                    onContact(`${plan.name} · ${plan.area} m²`);
                  }}
                >
                  Quero conhecer <ArrowUpRight size={16} />
                </button>
                <small>Planta conceitual sem escala. Empreendimento fictício.</small>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
}
