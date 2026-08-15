import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Package, Award, Users, RefreshCw, DollarSign, Wallet, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, totalQty: 0, totalOrders: 0 });
  const [timeRange, setTimeRange] = useState('year'); // month, year
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resChart, resTopProducts, resCustomerSegments, resStats] = await Promise.all([
        apiClient.get(`/analytics/revenue-chart?type=${timeRange}`),
        apiClient.get('/analytics/top-products'),
        apiClient.get('/analytics/customer-segments'),
        apiClient.get('/analytics/stats'),
      ]);
      setChartData(resChart.data);
      setTopProducts(resTopProducts.data);
      setCustomerSegments(resCustomerSegments.data);
      setStats(resStats.data || { totalRevenue: 0, totalProfit: 0, totalQty: 0, totalOrders: 0 });
    } catch {
      toast.error('Lỗi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDwh = async () => {
    setSyncing(true);
    const loadToast = toast.loading('Đang đồng bộ dữ liệu giao dịch sang DWH...');
    try {
      await apiClient.post('/analytics/sync');
      toast.success('Đồng bộ dữ liệu DWH thành công!', { id: loadToast });
      fetchData();
    } catch (e) {
      toast.error('Lỗi đồng bộ DWH: ' + (e.response?.data?.message || e.message), { id: loadToast });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header với nút đồng bộ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo & Thống kê (DWH)</h1>
          <p className="text-sm text-gray-500 mt-1">Dữ liệu phân tích trực tiếp từ Data Warehouse (HoaTuoi_DWH)</p>
        </div>
        <button
          onClick={handleSyncDwh}
          disabled={syncing}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ Kho dữ liệu (ETL)'}
        </button>
      </div>

      {/* Grid thẻ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng Doanh Thu</p>
            <p className="text-lg font-black text-slate-800 mt-1">{formatVnd(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lợi Nhuận Ròng</p>
            <p className="text-lg font-black text-slate-800 mt-1">{formatVnd(stats.totalProfit)}</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sản Lượng Bán</p>
            <p className="text-lg font-black text-slate-800 mt-1">{stats.totalQty} cành/bó</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Số Đơn Hàng</p>
            <p className="text-lg font-black text-slate-800 mt-1">{stats.totalOrders} đơn</p>
          </div>
        </div>
      </div>

      {/* Grid Biểu đồ và Top sản phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Doanh thu & Lợi nhuận cột kép */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" /> Báo cáo Doanh thu & Lợi nhuận
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">So sánh tăng trưởng doanh thu so với lợi nhuận ròng hàng tháng</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              <span className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white text-gray-900 shadow-sm">
                Năm nay
              </span>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₫${(val / 1000000).toFixed(1)}M`} />
                  <RechartsTooltip 
                    formatter={(value, name) => [formatVnd(value), name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận ròng']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  <Bar dataKey="profit" name="Lợi nhuận ròng" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Sản phẩm + Phân khúc KH */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {/* Top 5 sản phẩm */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-amber-500" />
              <h2 className="font-bold text-gray-900 text-lg">Top hoa bán chạy</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)
              ) : topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div key={p.productId ?? idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                      ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-600'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.productName}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{p.totalSold} bán</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Phân khúc khách hàng */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-blue-500" />
              <h2 className="font-bold text-gray-900 text-lg">Phân khúc khách hàng</h2>
            </div>
            <div className="space-y-2">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)
              ) : customerSegments.length > 0 ? (
                customerSegments.map((s, idx) => {
                  const cls = idx === 0 ? 'bg-purple-100 text-purple-700' : idx === 1 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
                  return (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>{s.segment}</span>
                      <span className="font-bold text-gray-800">{s.count} KH</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
