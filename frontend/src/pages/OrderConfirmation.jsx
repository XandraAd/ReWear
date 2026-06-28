import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function OrderConfirmation() {
  const orderNumber = new URLSearchParams(window.location.search).get('order') || 'N/A';

  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-sage" />
        </div>
        <h1 className="font-display text-3xl font-bold text-obsidian mb-3">Order Confirmed!</h1>
        <p className="text-obsidian/60 mb-2">Thank you for shopping sustainably.</p>
        <p className="text-sm font-mono text-obsidian/40 mb-1">Order Number</p>
        <p className="text-xl font-mono font-bold text-terracotta mb-6">{orderNumber}</p>
        <p className="text-sm text-obsidian/50 mb-8">
          We've received your order and will send a confirmation email shortly. Payment is cash on delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-terracotta hover:bg-terracotta-dark text-white rounded-full px-8">
            <Link to="/shop">Continue Shopping <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button asChild variant="outline" className="border-linen rounded-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}