// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import { resolveImage } from '../../utils/imageResolver';

function StatCard({ icon: Icon, label, value, sub, color = 'amber', to }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue:  'bg-blue-50 text-blue-600',
    red:   'bg-red-50 text-red-600',
  };
  return (
    <Link to={to} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={22} />
        </div>
        <ArrowUpRight size={18} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Fetch stats
    apiClient.get('/stats/dashboard').then(r => setStats(r.data)).catch(console.error);
    apiClient.get('/orders?pageSize=5').then(r => setRecentOrders(r.data.items ?? [])).catch(() => setRecentOrders([]));
  }, []);

  const STATUS_LABELS = {
    Pending: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
    Processing: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-700' },
    Shipping: { label: 'Đang giao', cls: 'bg-purple-100 text-purple-700' },
    Completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
    Cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tổng quan hoạt động kinh doanh hoa</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Doanh thu hôm nay" value={stats ? formatVnd(stats.revenueToday) : '—'}
          sub={`Tháng này: ${stats ? formatVnd(stats.revenueMonth) : '—'}`} color="green" to="/admin/don-hang" />
        <StatCard icon={ShoppingBag} label="Đơn hàng hôm nay" value={stats?.newOrdersToday ?? '—'}
          sub={`Tháng này: ${stats?.totalOrdersMonth ?? '—'}`} color="blue" to="/admin/don-hang" />
        <StatCard icon={Users} label="Tổng Khách hàng" value={stats?.totalUsers ?? '—'}
          sub="Hệ thống" color="amber" to="/admin/nguoi-dung" />
        <StatCard icon={Package} label="Top SP Bán Chạy" value={stats?.topProducts?.length ?? '—'}
          sub="Hoa được yêu thích" color="red" to="/admin/san-pham" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top 5 hoa bán chạy</h2>
          </div>
          <div className="p-5 space-y-4">
            {stats?.topProducts?.map((p, idx) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="text-gray-400 font-bold w-4">{idx + 1}</span>
                <img src={resolveImage(p.mainImageUrl || '/placeholder.png')} alt={p.productName} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.productName}</p>
                  <p className="text-xs text-gray-500">Đã bán: <span className="font-bold text-amber-600">{p.totalSold}</span></p>
                </div>
              </div>
            ))}
            {!stats?.topProducts?.length && <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu thống kê</p>}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
     <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
   <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
        <Link to="/admin/don-hang" className="text-sm text-amber-600 hover:text-amber-700">Xem tất cả</Link>
   </div>
     {recentOrders.length === 0 ? (
     <div className="py-12 text-center text-gray-400">
    <Clock size={32} className="mx-auto mb-2 text-gray-200" />
   <p className="text-sm">Chưa có đơn hàng nào</p>
   </div>
   ) : (
          <div className="overflow-x-auto">
    <table className="w-full text-sm">
    <thead className="bg-gray-50">
  <tr>
              {['Mã đơn', 'Khách hàng', 'Số tiền', 'Trạng thái', 'Ngày'].map(h => (
         <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
      ))}
  </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {recentOrders.map(o => {
     const st = STATUS_LABELS[o.status] ?? { label: o.status, cls: 'bg-gray-100 text-gray-600' };
    return (
          <tr key={o.id} className="hover:bg-gray-50">
         <td className="px-5 py-3 font-mono text-gray-700">#{o.id}</td>
 <td className="px-5 py-3 text-gray-700">{o.receiverName}</td>
 <td className="px-5 py-3 font-semibold text-gray-900">{formatVnd(o.finalAmount)}</td>
     <td className="px-5 py-3">
<span className={`text-xs font-medium px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
    </td>
         <td className="px-5 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
  </tr>
  );
  })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>

</div>
  );
}
