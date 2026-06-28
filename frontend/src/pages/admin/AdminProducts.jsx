import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, MoreHorizontal, Upload, X, Loader2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../components/ui/use-toast';

const CATEGORIES = ['Clothing', 'Bags', 'Shoes'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const GENDERS = ['Women', 'Men', 'Unisex', 'Kids'];
const SUBCATEGORIES = {
  Clothing: ['Tops', 'Dresses', 'Pants', 'Skirts', 'Jackets', 'Sweaters', 'Shorts', 'Activewear', 'Traditional', 'Other'],
  Bags: ['Handbags', 'Crossbody', 'Backpacks', 'Tote Bags', 'Clutches', 'Wallets', 'Other'],
  Shoes: ['Sneakers', 'Sandals', 'Heels', 'Boots', 'Flats', 'Slippers', 'Loafers', 'Other'],
};

const emptyProduct = {
  name: '', category: '', subcategory: '', brand: '', description: '',
  price: '', condition: '', size: '', colour: '', gender: '',
  stock: 1, images: [], is_featured: false, status: 'draft', tags: ''
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    }
    return true;
  });

  const openNew = () => { setEditing(null); setForm({ ...emptyProduct }); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...emptyProduct, ...p,
      price: p.price?.toString() || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(filename, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);
        urls.push(publicUrl);
      } catch (err) {
        console.error('Image upload error:', err);
        toast({ title: 'Image upload failed', description: err?.message, variant: 'destructive', duration: 4000 });
      }
    }
    setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
    setUploading(false);
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price || !form.condition) {
      toast({ title: 'Missing fields', description: 'Please fill name, category, price, and condition.', variant: 'destructive', duration: 4000 });
      return;
    }
    setSaving(true);

    const payload = {
      name:        form.name,
      category:    form.category,
      subcategory: form.subcategory || null,
      brand:       form.brand || null,
      description: form.description || null,
      price:       parseFloat(form.price) || 0,
      condition:   form.condition,
      size:        form.size || null,
      colour:      form.colour || null,
      gender:      form.gender || null,
      stock:       parseInt(form.stock) || 0,
      images:      form.images || [],
      is_featured: form.is_featured || false,
      status:      form.status || 'draft',
      tags:        form.tags
                     ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
                     : [],
    };

    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Product updated', duration: 3000 });
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast({ title: 'Product created', duration: 3000 });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      console.error('DB save error:', err);
      toast({
        title: 'Error saving product',
        description: err?.message || 'Unknown error — check console for details',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive', duration: 4000 });
    } else {
      toast({ title: 'Product deleted', duration: 3000 });
      load();
    }
  };

  const bulkAction = async (action) => {
    for (const id of selected) {
      try {
        if (action === 'delete') await supabase.from('products').delete().eq('id', id);
        else if (action === 'unpublish') await supabase.from('products').update({ status: 'draft' }).eq('id', id);
        else if (action === 'sold') await supabase.from('products').update({ stock: 0 }).eq('id', id);
      } catch {}
    }
    setSelected([]);
    toast({ title: `Bulk ${action} completed`, duration: 3000 });
    load();
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(p => p.id));

  let tableSection;
  if (loading) {
    tableSection = (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  } else if (filtered.length === 0) {
    tableSection = (
      <div className="text-center py-16 text-white/30">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No products found</p>
      </div>
    );
  } else {
    tableSection = (
      <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-left w-10">
                  <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
                </th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Product</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30 hidden sm:table-cell">Category</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Price</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30 hidden md:table-cell">Stock</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30 hidden md:table-cell">Status</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <Package className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium truncate max-w-[200px]">{p.name}</p>
                        {p.brand && <p className="text-[10px] font-mono text-white/30">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-white/50 hidden sm:table-cell">{p.category}</td>
                  <td className="p-3 text-white font-mono">GHS {p.price?.toFixed(2)}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`font-mono text-xs ${(p.stock || 0) <= 2 ? 'text-yellow-400' : 'text-white/50'}`}>{p.stock || 0}</span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${p.status === 'published' ? 'text-green-400 bg-green-400/10' : 'text-white/40 bg-white/5'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEdit(p)}><Edit2 className="w-3 h-3 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-400"><Trash2 className="w-3 h-3 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Products</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} total products</p>
        </div>
        <Button onClick={openNew} className="bg-terracotta hover:bg-terracotta-dark text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-10 bg-[#1A1A1A] border-white/10 text-white h-10" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[150px] bg-[#1A1A1A] border-white/10 text-white h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {selected.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 text-white">{selected.length} selected</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => bulkAction('sold')}>Mark as Sold</DropdownMenuItem>
              <DropdownMenuItem onClick={() => bulkAction('unpublish')}>Unpublish</DropdownMenuItem>
              <DropdownMenuItem onClick={() => bulkAction('delete')} className="text-red-400">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {tableSection}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#1A1A1A] border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Product Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Brand</Label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v, subcategory: '' }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Subcategory</Label>
                <Select value={form.subcategory} onValueChange={v => setForm(f => ({ ...f, subcategory: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{(SUBCATEGORIES[form.category] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Price (GHS) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Condition *</Label>
                <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Size</Label>
                <Input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="e.g. M, 42, US 9" />
              </div>
              <div>
                <Label className="text-xs text-white/50 mb-1.5 block">Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Colour</Label>
              <Input value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 text-white min-h-[100px]" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-1.5 block">Tags (comma separated)</Label>
              <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="vintage, summer, casual" />
            </div>
            <div>
              <Label className="text-xs text-white/50 mb-2 block">Product Images</Label>
              <div className="flex flex-wrap gap-3 mb-3">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 text-white/30 animate-spin" /> : <Upload className="w-5 h-5 text-white/20" />}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
                <Label className="text-sm text-white/70">Featured Product</Label>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-sm text-white/70">Status:</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-white h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-terracotta hover:bg-terracotta-dark text-white flex-1">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editing ? 'Update Product' : 'Create Product'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white/60">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
