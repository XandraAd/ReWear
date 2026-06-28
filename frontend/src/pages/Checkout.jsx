import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase} from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useCart } from '../lib/CartContext';
import { useStoreSettings } from '../lib/useStoreSettings';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const shippingFee = settings.free_shipping_threshold > 0 && subtotal >= settings.free_shipping_threshold ? 0 : (settings.shipping_fee || 0);
  const total = subtotal + shippingFee;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.address.trim()) errs.address = 'Shipping address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setSubmitting(true);

  const orderNumber =
    "RW-" + Date.now().toString(36).toUpperCase();

  const orderItems = items.map((item) => ({
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    image: item.image,
  }));

  try {
    // Create Order
    const { error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: form.name,
          email: form.email,
          phone: form.phone,
          shipping_address: form.address,
          items: orderItems,
          subtotal,
          shipping_fee: shippingFee,
          total_amount: total,
          status: "Pending",
        },
      ]);

    if (orderError) throw orderError;

    // Update Product Stock
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (productError) continue;

      const newStock = Math.max(
        0,
        (product.stock || 0) - item.quantity
      );

      await supabase
        .from("products")
        .update({
          stock: newStock,
        })
        .eq("id", item.id);
    }

    clearCart();

    navigate(`/order-confirmation?order=${orderNumber}`);
  } catch (error) {
    console.error(error);

    setErrors({
      submit: error.message || "Something went wrong. Please try again.",
    });
  } finally {
    setSubmitting(false);
  }
};

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 text-center max-w-lg mx-auto px-4">
        <ShoppingBag className="w-12 h-12 text-obsidian/20 mx-auto mb-4" />
        <p className="font-display text-xl text-obsidian/40 mb-4">Your bag is empty</p>
        <Button asChild variant="outline" className="border-linen"><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-obsidian/50 hover:text-obsidian mb-8">
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-obsidian mb-10">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-10">
            {/* Form Fields */}
            <div className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-4">Shipping Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-white/60 border-linen h-11" placeholder="Kwame Asante" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email Address *</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-white/60 border-linen h-11" placeholder="you@email.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone Number</Label>
                <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="bg-white/60 border-linen h-11" placeholder="0XX XXX XXXX" />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium mb-1.5 block">Shipping Address *</Label>
                <Textarea id="address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="bg-white/60 border-linen min-h-[100px]" placeholder="Street, City, Region, GPS/Landmark" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="bg-sage/10 rounded-xl p-4">
                <p className="text-sm text-obsidian/70"><strong>Payment:</strong> Cash on Delivery (COD). You'll pay when your order arrives.</p>
              </div>

              {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
            </div>

            {/* Order Summary */}
            <div className="bg-white/60 rounded-2xl p-6 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-xs font-mono uppercase tracking-widest text-obsidian/40 mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-obsidian/40 font-mono">{item.size && `Size ${item.size} · `}Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-linen pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-obsidian/60">Subtotal</span><span>GHS {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-obsidian/60">Shipping</span><span>{shippingFee > 0 ? `GHS ${shippingFee.toFixed(2)}` : 'Free'}</span></div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-linen"><span>Total</span><span className="text-terracotta">GHS {total.toFixed(2)}</span></div>
              </div>

              <Button type="submit" disabled={submitting} size="lg" className="w-full mt-6 bg-terracotta hover:bg-terracotta-dark text-white rounded-full">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</> : 'Place Order'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}