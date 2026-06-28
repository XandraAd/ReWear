import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, Menu, LogOut, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

function SidebarContent({ location, onClose, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '18px', fontFamily: 'serif', letterSpacing: '-0.3px' }}>ReWear</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', marginTop: '3px', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                backgroundColor: isActive ? '#B35C44' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <item.icon size={15} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}
        >
          <ExternalLink size={14} /> View Store
        </Link>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );
}

const SIDEBAR_WIDTH = 240;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F0F0F', color: 'white' }}>

      {/* ── Desktop sidebar ── always visible, fixed left */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: `${SIDEBAR_WIDTH}px`,
        backgroundColor: '#141414',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SidebarContent location={location} onClose={() => {}} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile overlay sidebar ── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0,
            width: `${SIDEBAR_WIDTH}px`,
            backgroundColor: '#141414',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <SidebarContent location={location} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* ── Main content area ── offset by sidebar width */}
      <div style={{ flex: 1, marginLeft: `${SIDEBAR_WIDTH}px`, minWidth: 0 }}>

        {/* Mobile top bar — only meaningful on small screens but harmless on desktop */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          backgroundColor: 'rgba(15,15,15,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0 16px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '6px', display: 'flex' }}
          >
            <Menu size={20} />
          </button>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>ReWear Admin</span>
        </header>

        <main style={{ padding: '32px 32px 48px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}