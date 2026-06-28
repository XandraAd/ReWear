import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
    ]).then(([{ data: products }, { data: orders }]) => {
      const p = products || [];
      const o = orders || [];
      const revenue = o.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const lowStock = p.filter(item => item.status === 'published' && (item.stock || 0) <= 2).length;
      setStats({ products: p.length, orders: o.length, revenue, lowStock });
      setRecentOrders(o.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-sage-light', bg: 'bg-sage/10' },
    { label: 'Revenue', value: `GHS ${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-terracotta-light', bg: 'bg-terracotta/10' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  const statusColors = {
    'Pending':    'text-yellow-400 bg-yellow-400/10',
    'Processing': 'text-blue-400 bg-blue-400/10',
    'Shipped':    'text-purple-400 bg-purple-400/10',
    'Delivered':  'text-green-400 bg-green-400/10',
    'Cancelled':  'text-red-400 bg-red-400/10',
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short'
  });

  // Generate a short readable ID from UUID if order_number missing
  const orderLabel = (order) =>
    order.order_number || `#${order.id?.slice(0, 8).toUpperCase()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Overview of your store</p>
        </div>
        <Link to="/" target="_blank"
          className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5">
          View Store <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-[#1A1A1A] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-white/40 mt-1 font-mono uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Recent Orders */}
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="font-display text-base font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders"
              className="text-xs text-white/30 hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No orders yet</p>
              <p className="text-white/20 text-xs mt-1">Orders will appear here once customers check out</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map(order => (
                <Link key={order.id} to="/admin/orders"
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5 text-white/30" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-white group-hover:text-terracotta-light transition-colors">
                        {orderLabel(order)}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {order.customer_name}
                        {order.created_at && <span className="ml-2 text-white/20">· {formatDate(order.created_at)}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-white">GHS {order.total_amount?.toFixed(2)}</p>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${statusColors[order.status] || 'text-white/40 bg-white/5'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + low stock */}
        <div className="space-y-4">

          {/* Quick links */}
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/30 mb-3">Quick actions</h3>
            <div className="space-y-1">
              {[
                { label: 'Add new product', path: '/admin/products', icon: Package },
                { label: 'View all orders', path: '/admin/orders', icon: ShoppingCart },
                { label: 'Store settings', path: '/admin/settings', icon: TrendingUp },
              ].map(item => (
                <Link key={item.path} to={item.path}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock warning */}
          {stats.lowStock > 0 && (
            <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-400/70">Low stock</h3>
              </div>
              <p className="text-sm text-white/50">
                <span className="text-yellow-400 font-semibold">{stats.lowStock} product{stats.lowStock !== 1 ? 's' : ''}</span> {stats.lowStock === 1 ? 'is' : 'are'} running low or sold out.
              </p>
              <Link to="/admin/products"
                className="text-xs text-yellow-400/60 hover:text-yellow-400 mt-2 inline-flex items-center gap-1 transition-colors">
                Review products <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Items stat */}
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/30 mb-3">Catalogue</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total items</span>
                <span className="text-white font-mono">{stats.products}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total orders</span>
                <span className="text-white font-mono">{stats.orders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total revenue</span>
                <span className="text-white font-mono">GHS {stats.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}