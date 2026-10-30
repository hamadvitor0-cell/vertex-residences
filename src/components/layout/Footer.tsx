import { ArrowUpRight, ArrowUp } from 'lucide-react';
import Logo from '../ui/Logo';
import { navigation } from '../../data/project';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main wrap">
        <div>
          <a href="#inicio" aria-label="Vertex Residences — início">
            <Logo />
          </a>
          <p>
            Arquitetura que encontra
            <br />o seu horizonte.
          </p>
        </div>
        <nav aria-label="Navegação do rodapé">
          {navigation.slice(1).map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="https://vitorhamad.me" target="_blank" rel="noreferrer" className="footer__credit">
          <span>DESIGN & DESENVOLVIMENTO</span>
          <strong>
            Viham Dev <ArrowUpRight size={18} />
          </strong>
        </a>
      </div>
      <div className="footer__bottom wrap">
        <p>
          Projeto conceitual desenvolvido por Viham Dev.
          <br />
          Empreendimento fictício para demonstração de design e desenvolvimento web. Imagens
          ilustrativas.
        </p>
        <span>© {new Date().getFullYear()} VERTEX RESIDENCES</span>
        <a href="#inicio" aria-label="Voltar ao início">
          <ArrowUp size={18} />
        </a>
      </div>
    </footer>
  );
}
