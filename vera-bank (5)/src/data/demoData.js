// -----------------------------------------------------------------------------
// VERA Bank \u2014 DEMO DATA ONLY.
// This is a fictional banking prototype. No real accounts, cards, BVN, payment
// processors or card networks are involved. All values below are illustrative.
// -----------------------------------------------------------------------------

export const DEMO_USER = {
  id: 'usr_001',
  name: 'Babajide Adesina',
  displayName: 'BABAJIDE ADESINA',
  email: 'demo@verabank.example',
  phone: '0813 697 1145',
  initials: 'BA',
}

export const DEMO_ACCOUNT = {
  accountNumber: '2048591244',
  balance: 145250.0,
  accountHolder: 'BABAJIDE ADESINA',
  accountType: 'VERA Everyday (Savings)',
  bankName: 'VERA Bank',
  currency: '\u20A6',
}

export const DEMO_CARD = {
  cardType: 'VERA Premium Debit',
  maskedNumber: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4821',
  fullDisplay: '4821',
  holder: 'BABAJIDE ADESINA',
  expiry: '08/29',
  network: 'VERA',
  status: 'active', // active | frozen
  limits: { daily: 500000, monthly: 3000000, dailyUsed: 84250, monthlyUsed: 612300 },
}

export const DEMO_TRANSACTIONS = [
  { id: 'txn_1012', type: 'credit', amount: 60000, party: 'Salary \u2014 Zenith Corp', description: 'Monthly salary', date: '2026-09-24T09:12:00', status: 'completed', reference: 'VRA-8841203' },
  { id: 'txn_1011', type: 'debit', amount: 12500, party: 'Ikeja Electric', description: 'Electricity (Prepaid)', date: '2026-09-23T18:40:00', status: 'completed', reference: 'VRA-8840114' },
  { id: 'txn_1010', type: 'debit', amount: 8300, party: 'Chidinma Okeke', description: 'Split dinner', date: '2026-09-23T13:05:00', status: 'completed', reference: 'VRA-8839002' },
  { id: 'txn_1009', type: 'credit', amount: 25000, party: 'Tunde Bakare', description: 'Refund', date: '2026-09-22T20:22:00', status: 'completed', reference: 'VRA-8837781' },
  { id: 'txn_1008', type: 'debit', amount: 4500, party: 'DSTV Nigeria', description: 'Cable TV \u2014 Compact', date: '2026-09-22T08:15:00', status: 'completed', reference: 'VRA-8836540' },
  { id: 'txn_1007', type: 'debit', amount: 15000, party: 'Aisha Bello', description: 'Rent contribution', date: '2026-09-21T11:48:00', status: 'completed', reference: 'VRA-8834219' },
  { id: 'txn_1006', type: 'debit', amount: 3200, party: 'MTN Data', description: 'Internet \u2014 20GB', date: '2026-09-20T07:30:00', status: 'completed', reference: 'VRA-8831110' },
  { id: 'txn_1005', type: 'credit', amount: 42000, party: 'Freelance \u2014 Payoneer', description: 'Design project', date: '2026-09-19T16:02:00', status: 'completed', reference: 'VRA-8829004' },
  { id: 'txn_1004', type: 'debit', amount: 2000, party: 'LAWMA', description: 'Government levy', date: '2026-09-18T10:10:00', status: 'pending', reference: 'VRA-8825541' },
]

export const BILL_CATEGORIES = [
  { id: 'electricity', label: 'Electricity', icon: 'bolt', tint: 'qi-amber', providers: ['Ikeja Electric', 'Eko Electric', 'Abuja (AEDC)', 'PHED'] },
  { id: 'cabletv', label: 'Cable TV', icon: 'tv', tint: 'qi-blue', providers: ['DSTV', 'GOtv', 'StarTimes'] },
  { id: 'internet', label: 'Internet', icon: 'wifi', tint: 'qi-green', providers: ['MTN', 'Airtel', 'Glo', 'Spectranet'] },
  { id: 'government', label: 'Government', icon: 'building', tint: 'qi-navy', providers: ['LAWMA', 'FRSC', 'Land Use Charge', 'Vehicle Licence'] },
]

export const SAVED_RECIPIENTS = [
  { id: 'r1', name: 'Chidinma Okeke', bank: 'VERA Bank', account: '2048223110', initials: 'CO' },
  { id: 'r2', name: 'Tunde Bakare', bank: 'GTBank', account: '0123998812', initials: 'TB' },
  { id: 'r3', name: 'Aisha Bello', bank: 'Access Bank', account: '0781200345', initials: 'AB' },
  { id: 'r4', name: 'Emeka Nwosu', bank: 'VERA Bank', account: '2048771290', initials: 'EN' },
]

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', title: 'Salary received', body: '\u20A660,000.00 credited from Zenith Corp.', time: '2h ago', unread: true, kind: 'credit' },
  { id: 'n2', title: 'Bill payment successful', body: 'Ikeja Electric \u2014 \u20A612,500.00 paid.', time: '18h ago', unread: true, kind: 'info' },
  { id: 'n3', title: 'New login detected', body: 'iPhone 15 \u2022 Lagos, NG. Was this you?', time: '1d ago', unread: false, kind: 'security' },
  { id: 'n4', title: 'Refund from Tunde Bakare', body: '\u20A625,000.00 added to your balance.', time: '2d ago', unread: false, kind: 'credit' },
]

export const DEMO_DEVICES = [
  { id: 'd1', name: 'iPhone 15 Pro', meta: 'Lagos, NG \u2022 Current session', current: true },
  { id: 'd2', name: 'Chrome \u2014 Windows', meta: 'Lagos, NG \u2022 3 days ago', current: false },
  { id: 'd3', name: 'iPad Air', meta: 'Ibadan, NG \u2022 2 weeks ago', current: false },
]

export function formatMoney(n, currency = '\u20A6') {
  return currency + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(iso, opts) {
  const d = new Date(iso)
  return d.toLocaleString('en-NG', opts || { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
