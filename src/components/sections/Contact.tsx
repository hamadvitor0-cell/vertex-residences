import { ArrowUpRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import LeadForm from '../forms/LeadForm';

export default function Contact({
  onContact,
}: {
  onContact: (interest?: string, purpose?: string) => void;
}) {
  return (
    <section className="contact section" id="contato">
      <div className="wrap contact__grid">
        <div className="contact__intro reveal">
          <SectionLabel number="06">O PRÓXIMO PASSO É SEU</SectionLabel>
          <h2>
            Uma nova
            <br />
            perspectiva
            <br />
            <em>começa aqui.</em>
          </h2>
          <p>
            Conheça os detalhes. Encontre a sua planta.
            <br />
            Imagine o seu cotidiano de um novo ponto de vista.
          </p>
          <div className="contact__links">
            <button className="text-link" onClick={() => onContact('', 'Falar com consultor')}>
              Falar com consultor <ArrowUpRight size={17} />
            </button>
            <button className="text-link" onClick={() => onContact('', 'Receber apresentação')}>
              Receber apresentação <ArrowUpRight size={17} />
            </button>
          </div>
          <span className="contact__signature">
            VERTEX RESIDENCES<span>ARQUITETURA. PERSPECTIVA. PERTENCIMENTO.</span>
          </span>
        </div>
        <div className="contact__form">
          <span className="eyebrow">AGENDE UMA VISITA AO PROJETO</span>
          <h3>
            Vamos olhar
            <br />
            <em>mais de perto?</em>
          </h3>
          <p>Explore o atendimento demonstrativo e acesse a apresentação do empreendimento.</p>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
