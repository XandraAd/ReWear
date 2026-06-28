import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../lib/CartContext';

const conditionColors = {
  'New': 'bg-terracotta text-white',
  'Like New': 'bg-sage text-white',
  'Good': 'bg-sage-light/20 text-sage-dark',
  'Fair': 'bg-linen text-obsidian/60'
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const mainImage = product.images?.[0];
  const secondImage = product.images?.[1];

  return (
    <div className="group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-linen mb-3">
          {mainImage ? (
            <>
              <img src={mainImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {secondImage && (
                <img src={secondImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-obsidian/20">
              <ShoppingBag className="w-10 h-10" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${conditionColors[product.condition] || conditionColors['Good']}`}>
              {product.condition}
            </span>
          </div>
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-mono text-xs uppercase tracking-widest">Sold Out</span>
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-sm text-obsidian leading-tight hover:text-terracotta transition-colors">{product.name}</h3>
          </Link>
          {product.stock > 0 && (
            <button onClick={() => addItem(product)} className="shrink-0 p-1.5 rounded-full hover:bg-terracotta/10 text-obsidian/40 hover:text-terracotta transition-colors" title="Add to bag">
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
        {product.brand && <p className="text-xs font-mono text-obsidian/40 uppercase tracking-wider">{product.brand}</p>}
        <p className="text-sm font-semibold text-terracotta">GHS {product.price?.toFixed(2)}</p>
        <p className="text-xs text-obsidian/40">{product.size && `Size ${product.size}`}{product.size && product.gender ? ' · ' : ''}{product.gender}</p>
      </div>
    </div>
  );
}