import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import Input from '../../components/Input.jsx'
import Modal from '../../components/Modal.jsx'
import { PhoneField } from '../../components/ui.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DEMO_DEVICES } from '../../data/demoData.js'
import { COUNTRIES } from '../../data/seed.js'
import { countryByName, splitE164, validatePhone } from '../../data/phone.js'

function Row({ icon, title, sub, onClick, right }) {
  return (
    <button className="settings-row" onClick={onClick}>
      <span className="si"><Icon name={icon} size={19} /></span>
      <span className="s-txt"><b>{title}</b>{sub && <small>{sub}</small>}</span>
      {right || <Icon name="chevron" size={18} style={{ color: 'var(--text-secondary)' }} />}
    </button>
  )
}

export function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [showProfile, setShowProfile] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  // Phone editing keeps the country selector and dial code in sync (same rule
  // as Create Account): the dial code is derived from the chosen country and
  // is never shown without it.
  const initial = splitE164(user?.phone || '')
  const [country, setCountry] = useState((initial.country && initial.country.name) || user?.country || 'Nigeria')
  const [phone, setPhone] = useState(initial.national || '')
  const [phoneErr, setPhoneErr] = useState('')
  const selCountry = countryByName(country)

  const saveProfile = () => {
    setPhoneErr('')
    if (String(phone).trim()) {
      const pr = validatePhone(selCountry, phone)
      if (!pr.ok) { setPhoneErr(pr.error); return }
    }
    setShowProfile(false)
    toast.success('Profile updated', 'Your details were saved (demo).')
  }

  const doLogout = () => { logout(); toast.info('Logged out', 'You have been signed out of VERA.'); navigate('/app/welcome', { replace: true }) }

  return (
    <div className="app-pad-b">
      <div className="screen-head" style={{ paddingTop: 20 }}><h1>Settings</h1></div>
      <div className="app-pad" style={{ paddingTop: 8 }}>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{user?.initials || 'BA'}</span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 17 }}>{user?.name || 'Babajide Adesina'}</b>
            <div className="muted" style={{ fontSize: 13.5 }}>{user?.email || 'demo@verabank.example'}</div>
          </div>
          <span className="badge badge-blue"><Icon name="star" size={13} /> Premium</span>
        </div>

        <div className="settings-group">
          <Row icon="user" title="My Profile" sub="Name, phone and email" onClick={() => setShowProfile(true)} />
          <Row icon="shield" title="Security & Control" sub="Password, PIN, devices" onClick={() => navigate('/app/security')} />
          <Row icon="bell" title="Notifications" sub="Alerts and preferences" onClick={() => toast.info('Notifications', 'Preferences saved (demo).')} />
          <Row icon="card" title="My Cards" sub="Manage your VERA card" onClick={() => navigate('/app/cards')} />
          <Row icon="help" title="Help & Support" sub="FAQs and contact" onClick={() => toast.info('Support', 'Our team is here 24/7 (demo).')} />
        </div>

        <Button variant="danger" block iconLeft={<Icon name="logout" size={18} />} onClick={() => setShowLogout(true)}>Logout</Button>
        <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 16 }}>VERA Bank \u00b7 Demo prototype \u00b7 v1.0</p>
      </div>

      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="My Profile"
        footer={<Button block onClick={saveProfile}>Save Changes</Button>}>
        <Input label="Full Name" icon="user" defaultValue={user?.name || 'Babajide Adesina'} />
        <div className="field">
          <label htmlFor="prof-country">Country</label>
          <div className="input-wrap">
            <span className="lead"><Icon name="user" size={18} /></span>
            <select id="prof-country" className="input has-lead" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <PhoneField label="Phone Number" country={selCountry} value={phone} error={phoneErr}
          onChange={setPhone} />
        <Input label="Email" icon="mail" defaultValue={user?.email || 'demo@verabank.example'} />
      </Modal>

      <Modal open={showLogout} onClose={() => setShowLogout(false)} title="Log out of VERA?"
        footer={<div className="stack gap-3"><Button variant="danger" block onClick={doLogout}>Yes, log me out</Button><Button variant="outline" block onClick={() => setShowLogout(false)}>Cancel</Button></div>}>
        <p className="muted">You\u2019ll need to log in again to access your account.</p>
      </Modal>
    </div>
  )
}

export function Security() {
  const navigate = useNavigate()
  const toast = useToast()
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [biometric, setBiometric] = useState(true)
  const [modal, setModal] = useState(null) // 'password' | 'pin'
  const [devices, setDevices] = useState(DEMO_DEVICES)

  const revoke = (id) => { setDevices((d) => d.filter((x) => x.id !== id)); toast.info('Session ended', 'The device was signed out (demo).') }

  return (
    <div className="app-pad-b">
      <div className="app-topbar"><button className="back-btn" onClick={() => navigate('/app/settings')}><Icon name="arrowLeft" size={20} /> Security & Control</button></div>
      <div className="app-pad" style={{ paddingTop: 4 }}>
        <div className="settings-group">
          <Row icon="lock" title="Change Password" sub="Last changed 2 months ago" onClick={() => setModal('password')} />
          <Row icon="card" title="Change PIN" sub="Your 4-digit transaction PIN" onClick={() => setModal('pin')} />
        </div>
        <div className="settings-group">
          <Row icon="bell" title="Login alerts" sub="Get notified of new sign-ins"
            right={<span className={'toggle-sw' + (loginAlerts ? ' on' : '')} onClick={(e) => { e.stopPropagation(); setLoginAlerts((v) => !v) }}><i /></span>} />
          <Row icon="shield" title="Biometric login" sub="Face / fingerprint unlock"
            right={<span className={'toggle-sw' + (biometric ? ' on' : '')} onClick={(e) => { e.stopPropagation(); setBiometric((v) => !v) }}><i /></span>} />
        </div>

        <div className="section-title"><h3>Devices &amp; Sessions</h3></div>
        <div className="settings-group">
          {devices.map((d) => (
            <div className="settings-row" key={d.id} style={{ cursor: 'default' }}>
              <span className="si"><Icon name="device" size={19} /></span>
              <span className="s-txt"><b>{d.name}</b><small>{d.meta}</small></span>
              {d.current ? <span className="badge badge-green">This device</span>
                : <button className="btn btn-ghost" style={{ color: 'var(--error)' }} onClick={() => revoke(d.id)}>Sign out</button>}
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'pin' ? 'Change PIN' : 'Change Password'}
        footer={<Button block onClick={() => { setModal(null); toast.success('Updated', (modal === 'pin' ? 'PIN' : 'Password') + ' changed (demo).') }}>Save</Button>}>
        {modal === 'pin' ? (
          <>
            <Input label="Current PIN" type="password" icon="lock" placeholder="\u2022\u2022\u2022\u2022" maxLength={4} inputMode="numeric" />
            <Input label="New PIN" type="password" icon="lock" placeholder="\u2022\u2022\u2022\u2022" maxLength={4} inputMode="numeric" />
          </>
        ) : (
          <>
            <Input label="Current Password" type="password" icon="lock" placeholder="Current password" />
            <Input label="New Password" type="password" icon="lock" placeholder="New password" />
            <Input label="Confirm New Password" type="password" icon="lock" placeholder="Re-enter new password" />
          </>
        )}
      </Modal>
    </div>
  )
}
