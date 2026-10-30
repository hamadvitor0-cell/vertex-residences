export function validateLead({ name, email, phone, purpose, date, time, consent }, today) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Informe seu nome com pelo menos dois caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Informe um e-mail válido.';
  const digits = phone.replace(/\D/g, '');
  if (!/^\d{10,11}$/.test(digits)) errors.phone = 'Informe um telefone com DDD e 10 ou 11 dígitos.';
  if (purpose === 'Agendar visita') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today)
      errors.date = 'Escolha uma data a partir de hoje.';
    if (!['09:00', '11:00', '14:00', '16:00'].includes(time)) errors.time = 'Escolha um horário.';
  }
  if (!consent) errors.consent = 'Confirme que compreende o caráter demonstrativo.';
  return errors;
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
