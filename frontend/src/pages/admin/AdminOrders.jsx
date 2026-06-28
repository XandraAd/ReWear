import { useState, useEffect } from 'react';
import { Search, Download, Eye, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from "../../components/ui/use-toast";

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'text-yellow-400 bg-yellow-400/10',
  Processing: 'text-blue-400 bg-blue-400/10',
  Shipped: 'text-sage-light bg-sage/10',
  Delivered: 'text-green-400 bg-green-400/10',
  Cancelled: 'text-red-400 bg-red-400/10',
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailOrder, setDetailOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) console.error('Load orders error:', error);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Update status error:', error);
      toast({ title: 'Failed to update status', description: error.message, variant: 'destructive' });
    } else {
      // Update local state immediately — no need to reload all orders
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (detailOrder?.id === id) setDetailOrder(prev => ({ ...prev, status }));
      toast({ title: `Status updated to ${status}` });
    }
    setUpdatingId(null);
  };

  const exportCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Date', 'Address'];
    const rows = filtered.map(o => [
      o.order_number, o.customer_name, o.email,
      o.total_amount?.toFixed(2), o.status,
      new Date(o.created_at).toLocaleDateString(),
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rewear-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  let content;
  if (loading) {
    content = (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  } else if (filtered.length === 0) {
    content = (
      <div className="text-center py-16 text-white/30">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No orders found</p>
      </div>
    );
  } else {
    content = (
      <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Order</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Customer</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30 hidden sm:table-cell">Date</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Total</th>
                <th className="p-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/30">Status</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 font-mono text-white">{o.order_number}</td>
                  <td className="p-3">
                    <p className="text-white">{o.customer_name}</p>
                    <p className="text-[10px] text-white/30">{o.email}</p>
                  </td>
                  <td className="p-3 text-white/50 hidden sm:table-cell">{formatDate(o.created_at)}</td>
                  <td className="p-3 text-white font-mono">GHS {o.total_amount?.toFixed(2)}</td>
                  <td className="p-3">
                    <Select
                      value={o.status}
                      onValueChange={v => updateStatus(o.id, v)}
                      disabled={updatingId === o.id}
                    >
                      <SelectTrigger className="h-7 px-2 border-0 bg-transparent w-auto min-w-[110px]">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${statusColors[o.status] || 'text-white/40 bg-white/5'}`}>
                          {updatingId === o.id ? '...' : o.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setDetailOrder(o)}
                      className="text-white/40 hover:text-white h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
          <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
          <p className="text-white/40 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-white/10 text-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, name or email..."
            className="pl-10 bg-[#1A1A1A] border-white/10 text-white h-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] bg-[#1A1A1A] border-white/10 text-white h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {content}

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-lg bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-display">Order {detailOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/30 mb-0.5">Customer</p>
                  <p className="text-sm text-white">{detailOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/30 mb-0.5">Email</p>
                  <p className="text-sm text-white">{detailOrder.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/30 mb-0.5">Phone</p>
                  <p className="text-sm text-white">{detailOrder.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/30 mb-0.5">Date</p>
                  <p className="text-sm text-white">{formatDate(detailOrder.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/30 mb-1">Shipping Address</p>
                <p className="text-sm text-white/70">{detailOrder.shipping_address}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/30 mb-2">Items</p>
                <div className="space-y-2">
                  {(detailOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">
                          Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-mono text-white">GHS {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/5 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span>GHS {detailOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Shipping</span>
                  <span>{(detailOrder.shipping_fee || 0) > 0 ? `GHS ${detailOrder.shipping_fee.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Total</span>
                  <span className="text-terracotta-light">GHS {detailOrder.total_amount?.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/30 mb-1.5">Update Status</p>
                <Select
                  value={detailOrder.status}
                  onValueChange={v => updateStatus(detailOrder.id, v)}
                  disabled={updatingId === detailOrder.id}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
