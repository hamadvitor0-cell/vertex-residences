import test from 'node:test';
import assert from 'node:assert/strict';
import { localDate, validateLead } from '../src/lib/lead.mjs';
const lead = {
  name: 'Pessoa Teste',
  email: 'teste@example.com',
  phone: '(11) 99999-9999',
  purpose: 'Agendar visita',
  date: '2026-11-02',
  time: '14:00',
  consent: true,
};
test('accepts a complete future visit preference', () =>
  assert.deepEqual(validateLead(lead, '2026-10-30'), {}));
test('rejects missing contact data, expired dates, invalid slots and missing consent', () => {
  const errors = validateLead(
    {
      ...lead,
      name: ' ',
      email: 'inválido',
      phone: '123',
      date: '2026-01-01',
      time: '02:00',
      consent: false,
    },
    '2026-10-30',
  );
  for (const key of ['name', 'email', 'phone', 'date', 'time', 'consent']) assert.ok(errors[key]);
});
test('presentation and consultant requests do not require a visit date', () => {
  for (const purpose of ['Receber apresentação', 'Falar com consultor'])
    assert.deepEqual(validateLead({ ...lead, purpose, date: '', time: '' }, '2026-10-30'), {});
});
test('formats the date in the visitor local timezone', () =>
  assert.equal(localDate(new Date(2026, 9, 30, 23, 59)), '2026-10-30'));
