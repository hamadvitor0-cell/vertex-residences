import { ArrowUpRight, Sun, ScanLine, Layers3, Trees } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';

export default function Project() {
  return (
    <>
      <div className="spec-strip">
        <div className="wrap spec-strip__inner">
          <span>ARQUITETURA COM PROPÓSITO</span>
          <p>
            98 a 196 <small>m² privativos</small>
          </p>
          <i />
          <p>
            2 e 3 <small>suítes</small>
          </p>
          <i />
          <p>
            01 <small>torre exclusiva</small>
          </p>
          <a href="#plantas" aria-label="Conhecer as plantas">
            <ArrowUpRight size={23} />
          </a>
        </div>
      </div>
      <section className="project section wrap" id="projeto">
        <SectionLabel number="01">O EMPREENDIMENTO</SectionLabel>
        <div className="project__intro reveal">
          <h2>
            Espaço para viver.
            <br />
            Luz para sentir.
            <br />
            <em>Um lugar para pertencer.</em>
          </h2>
          <div className="project__text">
            <span className="eyebrow">O EQUILÍBRIO É O NOSSO PONTO DE PARTIDA.</span>
            <p>
              O Vertex nasce do encontro entre a precisão da arquitetura e a liberdade de morar bem.
              Uma torre de linhas contemporâneas, espaços generosos e uma relação aberta com a
              cidade.
            </p>
            <p>
              Do living à varanda. Do primeiro café ao último olhar para o horizonte. Cada escolha
              tem uma razão de ser.
            </p>
            <a className="text-link text-link--dark" href="#ambientes">
              Descubra os ambientes <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="project__image reveal">
          <img
            src="/images/living.webp"
            alt="Living integrado do Vertex: materiais naturais, grandes aberturas e mobiliário contemporâneo."
            loading="lazy"
            width="1672"
            height="940"
          />
          <span className="image-caption">
            LIVING INTEGRADO <span>14º PAVIMENTO · PERSPECTIVA ILUSTRATIVA</span>
          </span>
          <div className="project__image-seal">
            <span>VERTEX</span>
            <em>
              um novo
              <br />
              ponto de vista.
            </em>
          </div>
        </div>
      </section>
      <section className="differences section wrap" aria-labelledby="differences-title">
        <div className="differences__head reveal">
          <SectionLabel number="02">A DIFERENÇA ESTÁ NOS DETALHES</SectionLabel>
          <h2 id="differences-title">
            Precisão no desenho.
            <br />
            <em>Liberdade no cotidiano.</em>
          </h2>
        </div>
        <div className="differences__grid reveal">
          {[
            {
              Icon: ScanLine,
              title: 'Uma fachada, muitos olhares.',
              text: 'Volumes leves, brises em bronze e vidro. Uma arquitetura que se transforma com a luz.',
            },
            {
              Icon: Sun,
              title: 'Luz de fora. Vida por dentro.',
              text: 'Grandes aberturas e varandas integradas aproximam o interior do horizonte.',
            },
            {
              Icon: Layers3,
              title: 'A sua medida de espaço.',
              text: 'Plantas de 98 a 196 m², 2 e 3 suítes e ambientes sociais que se conectam.',
            },
            {
              Icon: Trees,
              title: 'Tempo para simplesmente estar.',
              text: 'Piscina no rooftop, lounge, fitness e paisagismo. Bem-estar em diferentes alturas.',
            },
          ].map(({ Icon, title, text }, index) => (
            <article key={title} className="difference">
              <div className="difference__top">
                <Icon size={26} strokeWidth={1} />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
