import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import ProductCard from '../components/store/ProductCard';

const CATEGORIES = ['Clothing', 'Bags', 'Shoes'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const GENDERS = ['Women', 'Men', 'Unisex', 'Kids'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    conditions: [],
    genders: [],
    priceRange: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== filters.category) {
      setFilters(f => ({ ...f, category: cat }));
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);

    // ← Replaces base44.entities.Product.filter(query, '-created_date', 100)
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    query
      .then(({ data }) => setProducts(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters.category]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q)
      );
    }
    if (filters.conditions.length > 0) {
      result = result.filter(p => filters.conditions.includes(p.condition));
    }
    if (filters.genders.length > 0) {
      result = result.filter(p => filters.genders.includes(p.gender));
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return result;
  }, [products, searchQuery, filters, sortBy]);

  const toggleFilter = (key, value) => {
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ category: '', conditions: [], genders: [], priceRange: '' });
    setSearchQuery('');
    setSearchParams({});
  };

  const activeCount = (filters.category ? 1 : 0) + filters.conditions.length + filters.genders.length + (filters.priceRange ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }))}
              className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${filters.category === cat ? 'bg-sage/10 text-sage font-medium' : 'text-obsidian/60 hover:text-obsidian'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-3">Condition</h4>
        <div className="space-y-2">
          {CONDITIONS.map(cond => (
            <label key={cond} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={filters.conditions.includes(cond)} onCheckedChange={() => toggleFilter('conditions', cond)} />
              <span className="text-sm text-obsidian/70">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-3">Gender</h4>
        <div className="space-y-2">
          {GENDERS.map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={filters.genders.includes(g)} onCheckedChange={() => toggleFilter('genders', g)} />
              <span className="text-sm text-obsidian/70">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-3">Price Range</h4>
        <div className="space-y-2">
          {[
            { label: 'Under GHS 50', value: '0-50' },
            { label: 'GHS 50 – 150', value: '50-150' },
            { label: 'GHS 150 – 300', value: '150-300' },
            { label: 'Over GHS 300', value: '300-' },
          ].map(pr => (
            <button key={pr.value} onClick={() => setFilters(f => ({ ...f, priceRange: f.priceRange === pr.value ? '' : pr.value }))}
              className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${filters.priceRange === pr.value ? 'bg-sage/10 text-sage font-medium' : 'text-obsidian/60 hover:text-obsidian'}`}>
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-obsidian/50">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sage font-mono text-xs uppercase tracking-[0.3em] mb-2">The Archive</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-obsidian">
            {filters.category || 'All Products'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian/30" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or tag..."
              className="pl-10 bg-white/60 border-linen focus:border-sage h-11"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-obsidian/30" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white/60 border-linen h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden border-linen h-11 relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  {activeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-cream w-80">
                <SheetHeader><SheetTitle className="font-display">Filters</SheetTitle></SheetHeader>
                <div className="mt-6"><FilterPanel /></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterPanel />
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-linen rounded-lg mb-3" />
                    <div className="h-4 bg-linen rounded w-3/4 mb-2" />
                    <div className="h-3 bg-linen rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-obsidian/30 mb-2">No items found</p>
                <p className="text-sm text-obsidian/40 mb-6">Try adjusting your filters or search query</p>
                <Button variant="outline" onClick={clearFilters} className="border-linen">Clear Filters</Button>
              </div>
            ) : (
              <>
                <p className="text-xs font-mono text-obsidian/40 mb-6">{filtered.length} item{filtered.length === 1 ? '' : 's'}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}