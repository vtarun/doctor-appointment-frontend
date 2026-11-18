const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient } = require('@tanstack/react-query');

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => name in mocks ? { __esModule: true, ...mocks[name] } : require(name),
    console,
  });
  return exports;
}

const { queryKeys } = load('src/shared/lib/queryKeys.ts');

test('appointment changes invalidate lists, balances, transactions, payouts and slots', async () => {
  const client = new QueryClient();
  const keys = [queryKeys.appointments, queryKeys.wallet, queryKeys.transactions,
    queryKeys.payoutSummary, [...queryKeys.slots, 'doctor-1'],
    [...queryKeys.doctorAvailability, 'doctor-1', '2026-11-18']];
  for (const key of keys) client.setQueryData(key, []);
  client.setQueryData(['unrelated'], 'keep');
  const { invalidateAppointmentQueries } = load(
    'src/features/appointments/api/invalidateAppointmentQueries.ts', {
      '@/shared/lib/queryClient': { default: client },
      '@/shared/lib/queryKeys': { queryKeys },
    });
  await invalidateAppointmentQueries();
  for (const key of keys) assert.equal(client.getQueryState(key).isInvalidated, true);
  assert.equal(client.getQueryState(['unrelated']).isInvalidated, false);
  client.clear();
});

test('patient cancellation collects a reason and submits the selected appointment', () => {
  const values = [];
  let cursor = 0;
  let submitted;
  let invalidations = 0;
  let mutationOptions;
  const appointment = { _id: 'appointment-123', status: 'BOOKED' };
  const Component = load('src/features/patient/pages/PatientDashboard.tsx', {
    react: { useState: (initial) => {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], (value) => { values[index] = value; }];
    } },
    '@tanstack/react-query': { useMutation: (options) => {
      mutationOptions = options;
      return { mutate: options.mutationFn, isPending: false };
    } },
    '@/features/appointments/api/appointment.api': { appointmentApi: {
      cancel: (request) => { submitted = request; },
    } },
    '@/features/appointments/components/AppointmentCard': { default: 'appointment-card' },
    '@/features/appointments/constants': { buttonListAppointmentStatus: ['ALL', 'BOOKED'] },
    '@/features/appointments/api/invalidateAppointmentQueries': {
      invalidateAppointmentQueries: () => { invalidations++; },
    },
    '@/shared/store/authStore': { useAuthStore: () => ({ user: { name: 'Patient' } }) },
    'react-router-dom': { Link: 'a' },
    '@/features/appointments/hooks/useAppointments': { useAppointments: () => ({
      originalAppointmentList: [appointment], isAppointmentsError: false, isAppointmentLoading: false,
    }) },
    '@/features/credit/components/WalletBalanceCard': { default: 'wallet-card' },
    '@/features/appointments/components/CancellationModal': { default: 'cancellation-modal' },
  }).default;
  function render() { cursor = 0; return Component(); }
  function find(node, type) {
    if (!node || typeof node !== 'object') return;
    if (node.type === type) return node;
    const children = Array.isArray(node) ? node : [node.props?.children].flat();
    for (const child of children) { const result = find(child, type); if (result) return result; }
  }
  find(render(), 'appointment-card').props.cancel();
  assert.equal(submitted, undefined);
  let dialog = find(render(), 'cancellation-modal');
  dialog.props.onConfirm();
  assert.equal(submitted, undefined, 'blank reasons cannot be submitted');
  dialog.props.onReasonChange('  Schedule conflict  ');
  dialog = find(render(), 'cancellation-modal');
  dialog.props.onConfirm();
  assert.equal(submitted.appointmentId, 'appointment-123');
  assert.equal(submitted.reason, 'Schedule conflict');
  mutationOptions.onSuccess();
  assert.equal(find(render(), 'cancellation-modal'), undefined);
  assert.equal(invalidations, 1);
});
