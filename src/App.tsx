import { useEffect, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/hero/Hero';
import Project from './components/sections/Project';
import Plans from './components/sections/Plans';
import Environments from './components/sections/Environments';
import Location from './components/sections/Location';
import Contact from './components/sections/Contact';
import Modal from './components/ui/Modal';
import LeadForm from './components/forms/LeadForm';
import { useMotionPreference } from './hooks/useMotionPreference';

export default function App() {
  const motion = useMotionPreference();
  const [contact, setContact] = useState<{ interest: string; purpose: string } | null>(null);
  const openContact = (interest = '', purpose = 'Agendar visita') =>
    setContact({ interest, purpose });
  const toggleMotion = () => {
    const hero = document.getElementById('inicio');
    if (hero && window.scrollY < hero.offsetHeight)
      window.scrollTo({ top: 0, behavior: 'instant' });
    motion.toggle();
  };
  useEffect(() => {
    let cancelled = false;
    const hash = window.location.hash.slice(1);
    if (hash)
      document.fonts.ready.then(() => {
        if (!cancelled)
          document.getElementById(hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motion.reduced ? 'reduced' : 'full';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motion.reduced]);
  return (
    <>
      <a className="skip-link" href="#projeto">
        Pular experiência e ir ao conteúdo
      </a>
      <Navbar onContact={() => openContact()} />
      <main>
        <Hero
          reduced={motion.reduced}
          systemReduced={motion.systemReduced}
          onToggleMotion={toggleMotion}
          onContact={() => openContact()}
        />
        <Project />
        <Plans onContact={openContact} />
        <Environments />
        <Location />
        <Contact onContact={openContact} />
      </main>
      <Footer />
      {contact && (
        <Modal title={contact.purpose} onClose={() => setContact(null)}>
          <div className="contact-modal">
            <span className="eyebrow">VERTEX / UM NOVO PONTO DE VISTA</span>
            <h2>
              {contact.purpose === 'Agendar visita' ? (
                <>
                  O seu próximo
                  <br />
                  <em>ponto de vista.</em>
                </>
              ) : contact.purpose === 'Receber apresentação' ? (
                <>
                  Todos os detalhes.
                  <br />
                  <em>No seu tempo.</em>
                </>
              ) : (
                <>
                  Vamos conversar
                  <br />
                  <em>sobre o seu espaço.</em>
                </>
              )}
            </h2>
            <p>Preencha seus dados para explorar o atendimento demonstrativo.</p>
            <LeadForm initialInterest={contact.interest} initialPurpose={contact.purpose} />
          </div>
        </Modal>
      )}
    </>
  );
}
