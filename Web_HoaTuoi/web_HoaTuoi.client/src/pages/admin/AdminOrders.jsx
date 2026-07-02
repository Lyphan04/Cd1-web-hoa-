// src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import { resolveImage } from '../../utils/imageResolver';
import toast from 'react-hot-toast';

const STATUSES = ['', 'Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled', 'Refunded'];
const STATUS_LABELS = {
  Pending:    { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  Processing: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-700' },
  Shipping:   { label: 'Đang giao',    cls: 'bg-purple-100 text-purple-700' },
  Completed:  { label: 'Hoàn thành',   cls: 'bg-green-100 text-green-700' },
  Cancelled:  { label: 'Đã hủy',       cls: 'bg-red-100 text-red-700' },
  Refunded: { label: 'Đã hoàn tiền', cls: 'bg-gray-100 text-gray-600' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const PAGE_SIZE = 15;

  const fetchOrders = () => {
    apiClient.get(`/orders?page=${page}&pageSize=${PAGE_SIZE}${statusFilter ? `&status=${statusFilter}` : ''}`)
      .then(r => { setOrders(r.data.items ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  async function updateStatus(orderId, status) {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
 if (detail?.id === orderId) setDetail(d => ({ ...d, status }));
    } catch { toast.error('Không thể cập nhật'); }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
  <div className="space-y-5">
      <div className="flex items-center justify-between">
<h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
     <p className="text-sm text-gray-400">{total} đơn hàng</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => {
     const st = STATUS_LABELS[s];
      return (
      <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
  ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {s === '' ? 'Tất cả' : (st?.label ?? s)}
       </button>
   );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-sm">
      <thead className="bg-gray-50">
      <tr>
    {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày đặt', ''].map(h => (
     <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
      ))}
           </tr>
       </thead>
     <tbody className="divide-y divide-gray-50">
       {orders.map(o => {
      const st = STATUS_LABELS[o.status] ?? { label: o.status, cls: 'bg-gray-100 text-gray-600' };
       return (
  <tr key={o.id} className="hover:bg-gray-50">
   <td className="px-5 py-3 font-mono text-gray-700">#{o.id}</td>
         <td className="px-5 py-3">
     <p className="font-medium text-gray-800">{o.receiverName}</p>
         <p className="text-xs text-gray-400">{o.receiverPhone}</p>
   </td>
    <td className="px-5 py-3 font-semibold text-gray-900">{formatVnd(o.finalAmount)}</td>
        <td className="px-5 py-3">
    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${st.cls}`}>
     {Object.entries(STATUS_LABELS).map(([k, v]) => (
         <option key={k} value={k}>{v.label}</option>
    ))}
    </select>
 </td>
<td className="px-5 py-3 text-gray-400 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
  <td className="px-5 py-3">
 <button onClick={() => {
    apiClient.get(`/orders/${o.id}`).then(r => setDetail(r.data)).catch(() => toast.error('Lỗi tải chi tiết'));
 }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
   <Eye size={15} />
            </button>
         </td>
     </tr>
  );
 })}
        {orders.length === 0 && (
   <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có đơn hàng nào</td></tr>
      )}
  </tbody>
  </table>
  </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
    <button key={p} onClick={() => setPage(p)}
           className={`w-8 h-8 rounded-lg text-xs font-medium ${p === page ? 'bg-amber-500 text-white' : 'border border-gray-200 hover:border-amber-400'}`}>
        {p}
            </button>
  ))}
  </div>
        )}
      </div>

    {/* Order detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4">
     <div className="flex items-center justify-between">
         <h2 className="font-bold text-gray-900">Chi tiết đơn #{detail.id}</h2>
  <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
       </div>
     <div className="space-y-2 text-sm">
   {[
           ['Khách hàng', detail.receiverName],
    ['Điện thoại', detail.receiverPhone],
         ['Địa chỉ', detail.receiverAddress],
     ['Tổng tiền', formatVnd(detail.finalAmount)],
  ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
 <span className="text-gray-500">{k}</span>
<span className="font-medium text-gray-800">{v}</span>
  </div>
   ))}
       </div>
  <div className="border-t pt-4">
   <h3 className="font-semibold text-gray-800 mb-3 text-sm">Sản phẩm</h3>
<div className="space-y-2">
    {detail.items?.map(item => (
      <div key={item.id} className="flex items-center gap-3 text-sm">
   <img src={resolveImage(item.productImage || item.mainImageUrl)} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
    <div className="flex-1">
    <p className="font-medium text-gray-800 line-clamp-1">{item.productName}</p>
    <p className="text-xs text-gray-400">x{item.quantity}</p>
   </div>
    <span className="font-semibold text-gray-900">{formatVnd(item.unitPrice * item.quantity)}</span>
    </div>
          ))}
       </div>
</div>
  </div>
     </div>
      )}
  </div>
  );
}
