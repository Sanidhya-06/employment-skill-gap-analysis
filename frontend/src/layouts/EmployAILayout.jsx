import { NavLink, Outlet } from 'react-router-dom'

const Icon = ({ name, size = 17 }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    person: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/></>,
    bars: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    mark: <><path d="m5 14 4-4 3 3 7-7"/><path d="M15 6h4v4"/><path d="M4 19h16"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function NavigationItem({ to, icon, children }) {
  return <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="nav-icon"><Icon name={icon}/></span>{children}</NavLink>
}

export function Sidebar() {
  return <aside className="sidebar"><div className="brand"><div className="brand-mark"><Icon name="mark" size={19}/></div><div><div className="brand-name">EmployAI</div><div className="brand-sub">Career intelligence</div></div></div><div className="nav-section">Workspace</div><nav className="nav-list"><NavigationItem to="/" icon="grid">Dashboard</NavigationItem><NavigationItem to="/analyze" icon="person">Analyze profile</NavigationItem><NavigationItem to="/results" icon="bars">Results</NavigationItem><NavigationItem to="/insights" icon="spark">Model insights</NavigationItem></nav><div className="side-bottom"><div className="side-note"><span className="eyebrow">A clearer next step</span><p>Turn your experience into a focused skills conversation.</p></div><div className="user-row"><div className="avatar">JD</div><div><div className="user-name">Jordan Davis</div><div className="user-role">Career explorer</div></div></div></div></aside>
}

export default function EmployAILayout() { return <div className="app-shell"><Sidebar/><main className="main-area"><Outlet/></main></div> }
