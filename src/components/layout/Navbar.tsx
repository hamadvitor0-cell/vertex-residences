import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navigation } from '../../data/project';
import Logo from '../ui/Logo';

export default function Navbar({ onContact }: { onContact: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const [isOpen, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [isOpen]);
  const close = () => {
    menu.current?.close();
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const open = () => {
    menu.current?.showModal();
    setOpen(true);
  };
  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <a className="navbar__brand" href="#inicio" aria-label="Vertex Residences — início">
          <Logo />
        </a>
        <nav className="navbar__links" aria-label="Navegação principal">
          {navigation.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <button className="button button--small navbar__cta" onClick={onContact}>
          Agendar visita <ArrowUpRight size={15} />
        </button>
        <button
          ref={trigger}
          className="icon-button navbar__toggle"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={open}
        >
          <Menu size={25} />
        </button>
      </header>
      <dialog
        ref={menu}
        className="mobile-menu"
        id="mobile-menu"
        aria-label="Menu principal"
        onCancel={close}
      >
        <div className="mobile-menu__top">
          <Logo />
          <button className="icon-button" aria-label="Fechar menu" onClick={close}>
            <X />
          </button>
        </div>
        <nav aria-label="Navegação mobile">
          {navigation.map((link, i) => (
            <a href={link.href} key={link.href} onClick={close}>
              <span>0{i + 1}</span>
              {link.label}
              <ArrowUpRight size={24} />
            </a>
          ))}
        </nav>
        <p>ARQUITETURA. PERSPECTIVA. PERTENCIMENTO.</p>
      </dialog>
    </>
  );
}
