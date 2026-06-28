import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function StoreFooter() {
  return (
    <footer className="bg-obsidian text-cream-dark pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold text-white mb-3">ReWear</h3>
            <p className="text-cream-dark/60 text-sm leading-relaxed">
              Wear it again. Save the planet. Giving pre-loved fashion a second life since 2024.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sage-light">
              <Leaf className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Sustainable Fashion</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-cream-dark/40 mb-4">Shop</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/shop" className="text-sm text-cream-dark/70 hover:text-white transition-colors">All Products</Link>
              <Link to="/shop?category=Clothing" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Clothing</Link>
              <Link to="/shop?category=Bags" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Bags</Link>
              <Link to="/shop?category=Shoes" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Shoes</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-cream-dark/40 mb-4">Company</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/about" className="text-sm text-cream-dark/70 hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Contact</Link>
              <span className="text-sm text-cream-dark/70">Privacy Policy</span>
              <span className="text-sm text-cream-dark/70">Terms of Service</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-cream-dark/40 mb-4">Connect</h4>
            <div className="flex flex-col gap-2.5">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Instagram</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Twitter / X</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dark/70 hover:text-white transition-colors">TikTok</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm text-cream-dark/70 hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-dark/40">&copy; {new Date().getFullYear()} ReWear. All rights reserved.</p>
          <p className="text-xs text-cream-dark/40 flex items-center gap-1">
            Made with <Leaf className="w-3 h-3 text-sage-light" /> for a greener planet
          </p>
        </div>
      </div>
    </footer>
  );
}