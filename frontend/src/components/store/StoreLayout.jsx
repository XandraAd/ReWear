import { Outlet } from 'react-router-dom';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-cream noise-bg">
      <StoreHeader />
      <main className="relative z-0">
        <Outlet />
      </main>
      <StoreFooter />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}