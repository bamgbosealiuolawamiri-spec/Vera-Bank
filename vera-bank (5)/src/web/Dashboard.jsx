import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Button, Avatar, Modal, Input } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useFetch } from './dashboardData.js'
import { TransferModal, BillPayModal } from '../components/Actions.jsx'
import { ReceiptModal, ReceiveModal, NotificationsModal, BankTransferModal, RequestMoneyModal, AirtimeDataModal, GiftCardModal, QRPayModal, SavingsModal } from '../components/Services.jsx'
import { Overview, TransactionsView, CardsView, PaymentsView, SettingsView } from './dashboardViews.jsx'

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt' },
  { id: 'cards', label: 'Cards', icon: 'card' },
  { id: 'payments', label: 'Payments', icon: 'send' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]
const TITLES = { overview: 'Overview', transactions: 'Transactions', cards: 'Your cards', payments: 'Payments', settings: 'Settings' }

export default function Dashboard() {
  const { user, logout, api, patchUserBalance, toast } = useApp()
  const nav = useNavigate()
  const [view, setView] = useState('overview')
  const [drawer, setDrawer] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addAmt, setAddAmt] = useState('')
  const [service, setService] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [showNotif, setShowNotif] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: bens } = useFetch(() => api.getBeneficiaries(user.id), [user.id])
  const { data: notes, reload: reloadNotes } = useFetch(() => api.getNotifications(user.id), [user.id, refreshKey])
  const unread = (notes || []).filter((n) => !n.read).length

  const bump = () => setRefreshKey((k) => k + 1)
  const go = (id) => { setView(id); setDrawer(false) }
  const openService = (id) => setService(id)
  const showReceipt = (txn) => setReceipt(txn)
  async function openNotifs() {
    setShowNotif(true)
    await api.markNotificationsRead(user.id)
    reloadNotes()
  }

  function handleAddMoney(target) {
    if (target === 'cards') return setView('cards')
    setShowAdd(true)
  }
  async function addMoney(e) {
    e.preventDefault()
    const amt = Number(addAmt)
    if (!amt || amt <= 0) return
    try {
      const res = await api.deposit(user.id, amt)
      patchUserBalance(res.balance)
      toast({ tone: 'success', title: 'Money added', message: 'Your balance has been topped up.' })
      setShowAdd(false); setAddAmt(''); bump(); reloadNotes()
    } catch (err) {
      toast({ tone: 'error', message: err.message })
    }
  }

  return (
    <div className="dash">
      <div className={`side-backdrop ${drawer ? 'show' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`sidebar ${drawer ? 'open' : ''}`}>
        <div className="brand"><Logo onDark /></div>
        <nav className="side-nav">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => go(n.id)}>
              <Icon name={n.icon} size={20} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button className="" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 0, color: '#c8d5ef', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 14.5, fontWeight: 500 }}
            onClick={() => { logout(); nav('/') }}><Icon name="logout" size={20} /> Sign out</button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <button className="dash-hamburger" aria-label="Menu" onClick={() => setDrawer(true)}><Icon name="menu" /></button>
            <h2 style={{ fontSize: 20 }}>{TITLES[view]}</h2>
          </div>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <button className="icon-btn" aria-label="Notifications" onClick={openNotifs}><Icon name="bell" size={20} />{unread > 0 && <span className="dot" />}</button>
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <Avatar name={user.name} />
              <div style={{ lineHeight: 1.2 }}><b style={{ fontSize: 14 }}>{user.name}</b><br />
                <small className="muted">{user.email}</small></div>
            </div>
          </div>
        </header>

        <main className="dash-body">
          {view === 'overview' && <Overview refreshKey={refreshKey}
            onTransfer={() => setShowTransfer(true)} onPayBill={() => setShowBill(true)} onAddMoney={handleAddMoney} onReceipt={showReceipt} />}
          {view === 'transactions' && <TransactionsView refreshKey={refreshKey} onReceipt={showReceipt} />}
          {view === 'cards' && <CardsView />}
          {view === 'payments' && <PaymentsView onTransfer={() => setShowTransfer(true)} onPayBill={() => setShowBill(true)} onAddMoney={() => setShowAdd(true)} onService={openService} />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>

      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} beneficiaries={bens || []} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <BillPayModal open={showBill} onClose={() => setShowBill(false)} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <BankTransferModal open={service === 'bank'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <RequestMoneyModal open={service === 'request'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} />
      <AirtimeDataModal open={service === 'airtime'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <GiftCardModal open={service === 'gift'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <QRPayModal open={service === 'qr'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} onReceipt={showReceipt} />
      <ReceiveModal open={service === 'receive'} onClose={() => setService(null)} />
      <SavingsModal open={service === 'savings'} onClose={() => setService(null)} onDone={() => { bump(); reloadNotes() }} />
      <ReceiptModal open={!!receipt} txn={receipt} onClose={() => setReceipt(null)} />
      <NotificationsModal open={showNotif} onClose={() => setShowNotif(false)} items={notes || []} />
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add money">
        <form onSubmit={addMoney}>
          <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>Top up your VERA account (simulated).</p>
          <Input label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={addAmt}
            onChange={(e) => setAddAmt(e.target.value)} lead={<b>$</b>} autoFocus />
          <Button type="submit" block size="lg">Add money</Button>
        </form>
      </Modal>
    </div>
  )
}
