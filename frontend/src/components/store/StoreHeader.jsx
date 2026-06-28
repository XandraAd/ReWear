import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
//import { Button } from '../../components/ui/button';

export default function StoreHeader() {
  const { itemCount, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-cream/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="font-display text-2xl sm:text-3xl font-bold text-obsidian tracking-tight">
              ReWear
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/shop" className="text-sm font-medium text-obsidian/70 hover:text-obsidian transition-colors tracking-wide uppercase">Shop</Link>
              <Link to="/shop?category=Clothing" className="text-sm font-medium text-obsidian/70 hover:text-obsidian transition-colors tracking-wide uppercase">Clothing</Link>
              <Link to="/shop?category=Bags" className="text-sm font-medium text-obsidian/70 hover:text-obsidian transition-colors tracking-wide uppercase">Bags</Link>
              <Link to="/shop?category=Shoes" className="text-sm font-medium text-obsidian/70 hover:text-obsidian transition-colors tracking-wide uppercase">Shoes</Link>
              <Link to="/about" className="text-sm font-medium text-obsidian/70 hover:text-obsidian transition-colors tracking-wide uppercase">About</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/shop" className="p-2 hover:bg-obsidian/5 rounded-full transition-colors">
                <Search className="w-5 h-5 text-obsidian/70" />
              </Link>
              <button onClick={() => setIsOpen(true)} className="relative p-2 hover:bg-obsidian/5 rounded-full transition-colors">
                <ShoppingBag className="w-5 h-5 text-obsidian/70" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-xs flex items-center justify-center rounded-full font-medium">
                    {itemCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenu(true)} className="md:hidden p-2 hover:bg-obsidian/5 rounded-full transition-colors">
                <Menu className="w-5 h-5 text-obsidian" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] bg-cream">
          <div className="flex items-center justify-between p-4">
            <span className="font-display text-2xl font-bold text-obsidian">ReWear</span>
            <button onClick={() => setMobileMenu(false)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <nav className="flex flex-col items-center gap-6 pt-16">
            {[
              { label: 'Shop All', to: '/shop' },
              { label: 'Clothing', to: '/shop?category=Clothing' },
              { label: 'Bags', to: '/shop?category=Bags' },
              { label: 'Shoes', to: '/shop?category=Shoes' },
              { label: 'About Us', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileMenu(false)} className="text-2xl font-display text-obsidian hover:text-terracotta transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}