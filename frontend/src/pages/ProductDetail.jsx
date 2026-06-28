import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Leaf, ShoppingBag, Shield, Recycle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useCart } from '../lib/CartContext';
import ProductCard from '../components/store/ProductCard';
import ProductReviews from '../components/store/ProductReviews';

const conditionInfo = {
  'New': 'Brand new with tags, never worn.',
  'Like New': 'Worn once or twice, no visible wear.',
  'Good': 'Gently used with minor signs of wear.',
  'Fair': 'Well-loved with visible wear — still has life left.'
};

const conditionColors = {
  'New': 'bg-terracotta text-white',
  'Like New': 'bg-sage text-white',
  'Good': 'bg-sage-light/20 text-sage-dark',
  'Fair': 'bg-linen text-obsidian/60'
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setAdded(false);

    const fetchProduct = async () => {
      try {
        // ← Replaces base44.entities.Product.get(id)
        const { data: p, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !p) return;
        setProduct(p);

        // ← Replaces supabase.from()({...}) (was malformed)
        const { data: items } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .eq('category', p.category)
          .order('created_at', { ascending: false })
          .limit(5);

        setRelated((items || []).filter(r => r.id !== id).slice(0, 4));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-linen rounded-2xl" />
          <div className="space-y-4 pt-8">
            <div className="h-8 bg-linen rounded w-3/4" />
            <div className="h-6 bg-linen rounded w-1/4" />
            <div className="h-20 bg-linen rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16 text-center">
        <p className="font-display text-2xl text-obsidian/30">Product not found</p>
        <Button asChild variant="outline" className="mt-4 border-linen"><Link to="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-obsidian/40 mb-8">
          <Link to="/" className="hover:text-obsidian">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-obsidian">Shop</Link>
          <span>/</span>
          {product.category && <><Link to={`/shop?category=${product.category}`} className="hover:text-obsidian">{product.category}</Link><span>/</span></>}
          <span className="text-obsidian/60 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 lg:gap-14">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-linen mb-4">
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-obsidian/20"><ShoppingBag className="w-16 h-16" /></div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-terracotta' : 'border-transparent hover:border-linen'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${conditionColors[product.condition]}`}>
                        {product.condition} <Info className="w-3 h-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-obsidian text-white text-xs max-w-[200px]">
                      {conditionInfo[product.condition]}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {product.gender && <span className="text-xs font-mono text-obsidian/40 uppercase">{product.gender}</span>}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-obsidian leading-tight">{product.name}</h1>
              {product.brand && <p className="text-sm font-mono text-obsidian/40 uppercase tracking-wider mt-2">{product.brand}</p>}
            </div>

            <p className="text-3xl font-display font-bold text-terracotta">GHS {product.price?.toFixed(2)}</p>

            <div className="grid grid-cols-2 gap-3">
              {product.size && (
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-obsidian/40 mb-0.5">Size</p>
                  <p className="text-sm font-medium">{product.size}</p>
                </div>
              )}
              {product.colour && (
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-obsidian/40 mb-0.5">Colour</p>
                  <p className="text-sm font-medium">{product.colour}</p>
                </div>
              )}
              {product.category && (
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-obsidian/40 mb-0.5">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
              )}
              {product.subcategory && (
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-[10px] font-mono uppercase text-obsidian/40 mb-0.5">Type</p>
                  <p className="text-sm font-medium">{product.subcategory}</p>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-2">Description</h3>
                <p className="text-sm text-obsidian/70 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {product.stock > 0 ? (
                <Button onClick={handleAdd} size="lg" className={`w-full rounded-full text-white transition-all ${added ? 'bg-sage hover:bg-sage-dark' : 'bg-terracotta hover:bg-terracotta-dark'}`}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {added ? 'Added to Bag!' : 'Add to Bag'}
                </Button>
              ) : (
                <Button disabled size="lg" className="w-full rounded-full">Sold Out</Button>
              )}
              <p className="text-xs text-obsidian/40 text-center font-mono">
                {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
              </p>
            </div>

            <div className="bg-sage/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-sage" />
                <h3 className="font-display text-base font-semibold text-obsidian">Sustainability Impact</h3>
              </div>
              <p className="text-sm text-obsidian/60 leading-relaxed">
                By buying this item, you're keeping it out of landfill and reducing the demand for new production. Every pre-loved purchase saves water, energy, and CO₂.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-sage-dark">
                  <Recycle className="w-3.5 h-3.5" /> Circular fashion
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-sage-dark">
                  <Shield className="w-3.5 h-3.5" /> Quality checked
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews productId={id} />

        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-linen">
            <h2 className="font-display text-2xl font-bold text-obsidian mb-8">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}