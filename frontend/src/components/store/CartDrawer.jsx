import { Link } from 'react-router-dom';
import {Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, subtotal, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-cream border-linen flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Your Bag ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="w-12 h-12 text-obsidian/20" />
            <p className="text-obsidian/50 font-body">Your bag is empty</p>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline" className="border-obsidian text-obsidian hover:bg-obsidian hover:text-white">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 py-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-white/50 rounded-lg">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-obsidian truncate">{item.name}</h4>
                    {item.size && <p className="text-xs text-obsidian/50 font-mono mt-0.5">{item.size}</p>}
                    <p className="text-sm font-semibold text-terracotta mt-1">GHS {item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded border border-linen hover:bg-linen transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-mono w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock))} className="w-6 h-6 flex items-center justify-center rounded border border-linen hover:bg-linen transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto p-1 text-obsidian/30 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-linen pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-obsidian/60">Subtotal</span>
                <span className="font-semibold">GHS {subtotal.toFixed(2)}</span>
              </div>
              <Button asChild className="w-full bg-terracotta hover:bg-terracotta-dark text-white" onClick={() => setIsOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button variant="ghost" className="w-full text-obsidian/60" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}