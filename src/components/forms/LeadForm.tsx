import { useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, CalendarDays } from 'lucide-react';
import { localDate, validateLead } from '../../lib/lead.mjs';

export default function LeadForm({
  initialInterest = '',
  initialPurpose = 'Agendar visita',
}: {
  initialInterest?: string;
  initialPurpose?: string;
}) {
  const prefix = useId();
  const [purpose, setPurpose] = useState(initialPurpose);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const submit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      purpose,
      date: String(data.get('date') || ''),
      time: String(data.get('time') || ''),
      consent: data.get('consent') === 'on',
    };
    const issues = validateLead(values, localDate());
    setErrors(issues);
    if (Object.keys(issues).length) {
      form.current?.querySelector<HTMLInputElement>(`[name="${Object.keys(issues)[0]}"]`)?.focus();
      return;
    }
    setFirstName(values.name.trim().split(' ')[0]);
    setSubmitted(true);
  };
  const error = (field: string) =>
    errors[field] && (
      <span className="field-error" role="alert" id={`${prefix}-${field}-error`}>
        {errors[field]}
      </span>
    );
  const aria = (field: string) => ({
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `${prefix}-${field}-error` : undefined,
  });
  if (submitted)
    return (
      <div className="form-success" role="status" tabIndex={-1} ref={(element) => element?.focus()}>
        <span className="form-success__icon">
          <CheckCheck size={31} strokeWidth={1.3} />
        </span>
        <span className="eyebrow">EXPERIÊNCIA CONCLUÍDA</span>
        <h3>
          Obrigado,
          <br />
          <em>{firstName}.</em>
        </h3>
        <p>
          {purpose === 'Agendar visita'
            ? 'Sua preferência de visita foi simulada com sucesso.'
            : 'Você explorou nosso atendimento demonstrativo.'}{' '}
          Este é um projeto de portfólio: seus dados não foram armazenados nem enviados, e nenhum
          agendamento real foi criado.
        </p>
        <a
          className="button button--filled"
          href="/apresentacao.html"
          target="_blank"
          rel="noreferrer"
        >
          Abrir apresentação <ArrowUpRight size={16} />
        </a>
        <button
          className="text-link"
          onClick={() => {
            setSubmitted(false);
            setErrors({});
          }}
        >
          Preencher novamente <ArrowUpRight size={14} />
        </button>
      </div>
    );
  return (
    <form className="lead-form" onSubmit={submit} ref={form} noValidate>
      <div className="form-grid">
        <label htmlFor={`${prefix}-name`}>
          NOME COMPLETO <span>*</span>
          <input
            id={`${prefix}-name`}
            name="name"
            autoComplete="name"
            placeholder="Como podemos chamar você?"
            required
            maxLength={100}
            {...aria('name')}
          />
          {error('name')}
        </label>
        <label htmlFor={`${prefix}-email`}>
          E-MAIL <span>*</span>
          <input
            id={`${prefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            required
            maxLength={254}
            {...aria('email')}
          />
          {error('email')}
        </label>
        <label htmlFor={`${prefix}-phone`}>
          TELEFONE COM DDD <span>*</span>
          <input
            id={`${prefix}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            required
            maxLength={22}
            {...aria('phone')}
          />
          {error('phone')}
        </label>
        <label htmlFor={`${prefix}-interest`}>
          PLANTA DE INTERESSE
          <select id={`${prefix}-interest`} name="interest" defaultValue={initialInterest}>
            <option value="">Ainda estou explorando</option>
            <option>Essencial · 98 m²</option>
            <option>Panorama · 128 m²</option>
            <option>Horizonte · 196 m²</option>
          </select>
        </label>
        <label className="field-full" htmlFor={`${prefix}-purpose`}>
          COMO PREFERE CONHECER?
          <select
            id={`${prefix}-purpose`}
            name="purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          >
            <option>Agendar visita</option>
            <option>Receber apresentação</option>
            <option>Falar com consultor</option>
          </select>
        </label>
        {purpose === 'Agendar visita' && (
          <>
            <label htmlFor={`${prefix}-date`}>
              DATA PREFERIDA <span>*</span>
              <input
                id={`${prefix}-date`}
                name="date"
                type="date"
                min={localDate()}
                required
                {...aria('date')}
              />
              {error('date')}
            </label>
            <label htmlFor={`${prefix}-time`}>
              HORÁRIO <span>*</span>
              <select id={`${prefix}-time`} name="time" defaultValue="" required {...aria('time')}>
                <option value="" disabled>
                  Selecione
                </option>
                {['09:00', '11:00', '14:00', '16:00'].map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
              {error('time')}
            </label>
          </>
        )}
        <label className="field-full" htmlFor={`${prefix}-message`}>
          MENSAGEM <span className="optional">OPCIONAL</span>
          <textarea
            id={`${prefix}-message`}
            name="message"
            placeholder="O que é importante para o seu próximo lugar?"
            rows={2}
            maxLength={1200}
          />
        </label>
      </div>
      <label className="form-consent" htmlFor={`${prefix}-consent`}>
        <input
          id={`${prefix}-consent`}
          name="consent"
          type="checkbox"
          required
          {...aria('consent')}
        />
        <span className="form-consent__box">
          <Check size={12} />
        </span>
        <span>
          Entendo que este é um formulário demonstrativo. Os dados não serão armazenados nem
          enviados.
        </span>
      </label>
      {error('consent')}
      <button className="button button--filled form-submit" type="submit">
        {purpose === 'Agendar visita' ? (
          <>
            <CalendarDays size={16} /> Simular agendamento
          </>
        ) : purpose === 'Receber apresentação' ? (
          'Acessar apresentação'
        ) : (
          'Simular atendimento'
        )}
        <ArrowUpRight size={17} />
      </button>
      <p className="form-note">
        * Campos obrigatórios. Nenhum contato comercial real será realizado.
      </p>
    </form>
  );
}
