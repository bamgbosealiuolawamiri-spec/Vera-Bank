// Seed data for the VERA Bank prototype (fictional, fully simulated).
// Loaded into localStorage on first run; the store then becomes source of truth.

export const DEMO_EMAIL = 'demo@vera.bank'
export const DEMO_PASSWORD = 'password'

let _n = Date.now()
export const uid = (p = 'id') => `${p}_${(_n++).toString(36)}${Math.random().toString(36).slice(2, 7)}`

// ---- Reference catalogs (Nigeria-appropriate, all simulated) ----
export const NG_BANKS = [
  'VERA Bank', 'Access Bank', 'Guaranty Trust Bank', 'Zenith Bank', 'United Bank for Africa',
  'First Bank of Nigeria', 'Fidelity Bank', 'Union Bank', 'Sterling Bank', 'Wema Bank',
  'Kuda Microfinance Bank', 'Opay', 'PalmPay', 'Stanbic IBTC Bank', 'Polaris Bank',
]

export const NG_NETWORKS = [
  { id: 'mtn', name: 'MTN', tint: 'qi-amber' },
  { id: 'airtel', name: 'Airtel', tint: 'qi-blue' },
  { id: 'glo', name: 'Glo', tint: 'qi-green' },
  { id: '9mobile', name: '9mobile', tint: 'qi-navy' },
]

export const DATA_BUNDLES = [
  { id: 'd1', label: '500MB \u00b7 1 day', amount: 1 },
  { id: 'd2', label: '1GB \u00b7 7 days', amount: 2.5 },
  { id: 'd3', label: '2GB \u00b7 30 days', amount: 4 },
  { id: 'd4', label: '5GB \u00b7 30 days', amount: 8 },
  { id: 'd5', label: '10GB \u00b7 30 days', amount: 14 },
  { id: 'd6', label: '40GB \u00b7 30 days', amount: 40 },
]

export const GIFT_CARDS = [
  { id: 'apple', name: 'Apple Gift Card', tint: 'qi-navy', amounts: [10, 25, 50, 100, 200] },
  { id: 'amazon', name: 'Amazon Gift Card', tint: 'qi-amber', amounts: [10, 25, 50, 100] },
  { id: 'google', name: 'Google Play Card', tint: 'qi-green', amounts: [10, 25, 50] },
  { id: 'steam', name: 'Steam Gift Card', tint: 'qi-blue', amounts: [20, 50, 100] },
  { id: 'spotify', name: 'Spotify Card', tint: 'qi-green', amounts: [10, 30, 60] },
  { id: 'netflix', name: 'Netflix Gift Card', tint: 'qi-navy', amounts: [25, 50, 100] },
]

// Country catalog with international dial code, flag and the accepted
// national-number digit length(s). `len` is the number of digits AFTER any
// leading 0 and the dial code are removed. Used to keep the country selector
// and the phone field in sync (the dial code is derived from the country and
// can never be mismatched).
export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', dial: '234', flag: '\uD83C\uDDF3\uD83C\uDDEC', len: [10], example: '801 234 5678' },
  { code: 'GH', name: 'Ghana', dial: '233', flag: '\uD83C\uDDEC\uD83C\uDDED', len: [9], example: '24 123 4567' },
  { code: 'KE', name: 'Kenya', dial: '254', flag: '\uD83C\uDDF0\uD83C\uDDEA', len: [9], example: '712 345 678' },
  { code: 'ZA', name: 'South Africa', dial: '27', flag: '\uD83C\uDDFF\uD83C\uDDE6', len: [9], example: '71 234 5678' },
  { code: 'US', name: 'United States', dial: '1', flag: '\uD83C\uDDFA\uD83C\uDDF8', len: [10], example: '201 555 0123' },
  { code: 'GB', name: 'United Kingdom', dial: '44', flag: '\uD83C\uDDEC\uD83C\uDDE7', len: [10], example: '7400 123456' },
  { code: 'CA', name: 'Canada', dial: '1', flag: '\uD83C\uDDE8\uD83C\uDDE6', len: [10], example: '204 555 0123' },
  { code: 'IN', name: 'India', dial: '91', flag: '\uD83C\uDDEE\uD83C\uDDF3', len: [10], example: '98765 43210' },
  { code: 'EG', name: 'Egypt', dial: '20', flag: '\uD83C\uDDEA\uD83C\uDDEC', len: [10], example: '100 123 4567' },
  { code: 'TZ', name: 'Tanzania', dial: '255', flag: '\uD83C\uDDF9\uD83C\uDDFF', len: [9], example: '712 345 678' },
  { code: 'UG', name: 'Uganda', dial: '256', flag: '\uD83C\uDDFA\uD83C\uDDEC', len: [9], example: '712 345 678' },
  { code: 'RW', name: 'Rwanda', dial: '250', flag: '\uD83C\uDDF7\uD83C\uDDFC', len: [9], example: '788 123 456' },
  { code: 'CM', name: 'Cameroon', dial: '237', flag: '\uD83C\uDDE8\uD83C\uDDF2', len: [9], example: '6 71 23 45 67' },
  { code: 'CI', name: "C\u00f4te d'Ivoire", dial: '225', flag: '\uD83C\uDDE8\uD83C\uDDEE', len: [10], example: '01 23 45 6789' },
  { code: 'SN', name: 'Senegal', dial: '221', flag: '\uD83C\uDDF8\uD83C\uDDF3', len: [9], example: '77 123 4567' },
  { code: 'FR', name: 'France', dial: '33', flag: '\uD83C\uDDEB\uD83C\uDDF7', len: [9], example: '6 12 34 56 78' },
  { code: 'DE', name: 'Germany', dial: '49', flag: '\uD83C\uDDE9\uD83C\uDDEA', len: [10, 11], example: '1512 3456789' },
  { code: 'AE', name: 'United Arab Emirates', dial: '971', flag: '\uD83C\uDDE6\uD83C\uDDEA', len: [9], example: '50 123 4567' },
  { code: 'AU', name: 'Australia', dial: '61', flag: '\uD83C\uDDE6\uD83C\uDDFA', len: [9], example: '412 345 678' },
  { code: 'BR', name: 'Brazil', dial: '55', flag: '\uD83C\uDDE7\uD83C\uDDF7', len: [10, 11], example: '11 91234 5678' },
  { code: 'CN', name: 'China', dial: '86', flag: '\uD83C\uDDE8\uD83C\uDDF3', len: [11], example: '131 2345 6789' },
  { code: 'JP', name: 'Japan', dial: '81', flag: '\uD83C\uDDEF\uD83C\uDDF5', len: [10, 11], example: '90 1234 5678' },
  { code: 'MX', name: 'Mexico', dial: '52', flag: '\uD83C\uDDF2\uD83C\uDDFD', len: [10], example: '55 1234 5678' },
  { code: 'ES', name: 'Spain', dial: '34', flag: '\uD83C\uDDEA\uD83C\uDDF8', len: [9], example: '612 34 56 78' },
  { code: 'IT', name: 'Italy', dial: '39', flag: '\uD83C\uDDEE\uD83C\uDDF9', len: [9, 10], example: '312 345 6789' },
  { code: 'NL', name: 'Netherlands', dial: '31', flag: '\uD83C\uDDF3\uD83C\uDDF1', len: [9], example: '6 12345678' },
  { code: 'SE', name: 'Sweden', dial: '46', flag: '\uD83C\uDDF8\uD83C\uDDEA', len: [7, 8, 9], example: '70 123 45 67' },
]

function acctNo() {
  return '40' + Math.floor(10 + Math.random() * 89) + ' ' +
    Math.floor(1000 + Math.random() * 8999) + ' ' + Math.floor(1000 + Math.random() * 8999)
}
export { acctNo }

export function seedData() {
  const demoId = 'usr_demo'
  // Controlled DEMO/simulated registered users \u2014 used only as searchable
  // recipients when looked up by a valid account number / email / username.
  const users = [
    {
      id: demoId, name: 'Alex Morgan', email: DEMO_EMAIL, username: 'alexmorgan',
      password: DEMO_PASSWORD, phone: '+234 801 234 5678', country: 'Nigeria',
      accountNumber: '4021 7788 0031', balance: 12480.55, currency: 'USD',
      createdAt: '2024-11-02',
    },
    { id: 'usr_chidi', name: 'Chidi Okafor', email: 'chidi@vera.bank', username: 'chidi', password: 'password', phone: '+234 802 111 2233', country: 'Nigeria', accountNumber: '4055 1092 8841', balance: 5400.0, currency: 'USD', createdAt: '2025-01-04' },
    { id: 'usr_amara', name: 'Amara Eze', email: 'amara@vera.bank', username: 'amara', password: 'password', phone: '+234 803 445 6677', country: 'Nigeria', accountNumber: '4088 3321 7010', balance: 3120.0, currency: 'USD', createdAt: '2025-02-12' },
    { id: 'usr_tunde', name: 'Tunde Bello', email: 'tunde@vera.bank', username: 'tunde', password: 'password', phone: '+234 806 778 9900', country: 'Nigeria', accountNumber: '4012 6654 2098', balance: 8730.0, currency: 'USD', createdAt: '2025-03-01' },
    { id: 'usr_ngozi', name: 'Ngozi Adeyemi', email: 'ngozi@vera.bank', username: 'ngozi', password: 'password', phone: '+234 809 223 1144', country: 'Nigeria', accountNumber: '4077 9083 5521', balance: 6650.0, currency: 'USD', createdAt: '2025-03-19' },
  ]

  const cards = [
    { id: 'card_1', userId: demoId, name: 'VERA Debit', last4: '4417', brand: 'VERA', frozen: false, type: 'physical', exp: '08/28' },
    { id: 'card_2', userId: demoId, name: 'VERA Virtual', last4: '9920', brand: 'VERA', frozen: false, type: 'virtual', exp: '03/27' },
  ]

  const beneficiaries = [
    { id: 'ben_1', userId: demoId, name: 'Jordan Lee', accountNumber: '5580 2231 7745', bank: 'VERA Bank', initials: 'JL' },
    { id: 'ben_2', userId: demoId, name: 'Priya Nair', accountNumber: '3390 0087 1120', bank: 'Access Bank', initials: 'PN' },
    { id: 'ben_3', userId: demoId, name: 'Marco Silva', accountNumber: '7712 4456 9033', bank: 'VERA Bank', initials: 'MS' },
  ]

  const now = new Date()
  const d = (daysAgo, h = 10) => {
    const t = new Date(now)
    t.setDate(t.getDate() - daysAgo)
    t.setHours(h, (daysAgo * 7) % 60, 0, 0)
    return t.toISOString()
  }
  const ref = () => 'VRA-' + Math.floor(1000000 + Math.random() * 8999999)
  const tx = (over) => ({ id: uid('txn'), userId: demoId, status: 'completed', reference: ref(), ...over })
  const transactions = [
    tx({ type: 'credit', title: 'Salary \u2014 Northwind Ltd', category: 'Income', amount: 3200.0, date: d(1, 9) }),
    tx({ type: 'debit', title: 'Whole Foods Market', category: 'Payment', amount: 86.42, date: d(1, 18) }),
    tx({ type: 'debit', title: 'Netflix', category: 'Payment', amount: 15.99, date: d(2, 7) }),
    tx({ type: 'debit', title: 'Transfer to Jordan Lee', category: 'Transfer', amount: 250.0, date: d(3, 12), recipient: { name: 'Jordan Lee', accountNumber: '5580 2231 7745', bank: 'VERA Bank' }, method: 'Account number' }),
    tx({ type: 'credit', title: 'Refund \u2014 Amazon', category: 'Money Added', amount: 42.1, date: d(4, 15) }),
    tx({ type: 'debit', title: 'Shell Fuel', category: 'Payment', amount: 61.3, date: d(5, 8) }),
    tx({ type: 'debit', title: 'Electricity bill', category: 'Payment', amount: 128.75, date: d(6, 11) }),
    tx({ type: 'debit', title: 'Spotify', category: 'Payment', amount: 11.99, date: d(7, 6) }),
    tx({ type: 'credit', title: 'Transfer from Priya Nair', category: 'Transfer', amount: 500.0, date: d(9, 14) }),
    tx({ type: 'debit', title: 'Uber', category: 'Payment', amount: 23.4, date: d(11, 20) }),
    tx({ type: 'debit', title: 'Apple Store', category: 'Payment', amount: 199.0, date: d(13, 13) }),
    tx({ type: 'debit', title: 'Water bill', category: 'Payment', amount: 44.2, date: d(15, 10) }),
  ]

  const savings = [
    { id: 'pk_1', userId: demoId, name: 'Emergency Fund', target: 5000, saved: 1800, targetDate: '', createdAt: d(30) },
    { id: 'pk_2', userId: demoId, name: 'New Laptop', target: 1500, saved: 650, targetDate: '', createdAt: d(20) },
  ]

  const requests = []

  const notifications = [
    { id: uid('ntf'), userId: demoId, kind: 'success', title: 'Welcome to VERA', message: 'Your simulated demo account is ready.', date: d(1, 8), read: false },
  ]

  return { users, cards, beneficiaries, transactions, savings, requests, notifications }
}
