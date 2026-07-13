import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi 3 endpoints analytics mới
      const [resChart, resTopProducts, resOrderStatus] = await Promise.all([
        apiClient.get(`/analytics/revenue-chart?type=${timeRange}`),
        apiClient.get('/analytics/top-products'),
        apiClient.get('/analytics/order-status'),
      ]);
      setChartData(resChart.data);
      setTopProducts(resTopProducts.data);
      setOrderStatus(resOrderStatus.data);
    } catch {
      toast.error('Lỗi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích doanh thu và khách hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" /> Biểu đồ Doanh Thu
              </h2>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {formatVnd(totalRevenue)}
              </div>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['week', 'month', 'year'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setTimeRange(r)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${timeRange === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {r === 'week' ? 'Tuần này' : r === 'month' ? 'Tháng này' : 'Năm nay'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {timeRange === 'year' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₫${(val / 1000000).toFixed(1)}M`} />
                    <RechartsTooltip 
                      formatter={(value) => [formatVnd(value), 'Doanh thu']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₫${(val / 1000000).toFixed(1)}M`} />
                    <RechartsTooltip 
                      formatter={(value) => [formatVnd(value), 'Doanh thu']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Sản phẩm + Trạng thái đơn */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {/* Top 5 sản phẩm */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-amber-500" />
              <h2 className="font-bold text-gray-900 text-lg">Top 5 Sản phẩm</h2>
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

          {/* Trạng thái đơn hàng */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-blue-500" />
              <h2 className="font-bold text-gray-900 text-lg">Trạng thái đơn</h2>
            </div>
            <div className="space-y-2">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)
              ) : orderStatus.length > 0 ? (
                orderStatus.map((s, idx) => {
                  const cls = {
                    Pending: 'bg-yellow-100 text-yellow-700',
                    Processing: 'bg-blue-100 text-blue-700',
                    Shipping: 'bg-purple-100 text-purple-700',
                    Completed: 'bg-green-100 text-green-700',
                    Cancelled: 'bg-red-100 text-red-700',
                  }[s.status] ?? 'bg-gray-100 text-gray-600';
                  const label = {
                    Pending: 'Chờ xác nhận', Processing: 'Đang xử lý',
                    Shipping: 'Đang giao', Completed: 'Hoàn thành', Cancelled: 'Đã hủy',
                  }[s.status] ?? s.status;
                  return (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>{label}</span>
                      <span className="font-bold text-gray-800">{s.count}</span>
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
