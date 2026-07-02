import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [chartData, setChartData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resChart, resCustomers] = await Promise.all([
        apiClient.get(`/stats/revenue-chart?type=${timeRange}`),
        apiClient.get('/stats/top-customers')
      ]);
      setChartData(resChart.data);
      setTopCustomers(resCustomers.data);
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

        {/* Khách hàng top */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-blue-500" />
            <h2 className="font-bold text-gray-900 text-lg">Khách hàng VIP</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse"></div>)}
              </div>
            ) : topCustomers.length > 0 ? (
              topCustomers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none
                    ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                      idx === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                      idx === 2 ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-blue-50 text-blue-600'}
                  `}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user.fullName || user.email}</p>
                    <p className="text-xs text-gray-500">{user.totalOrders} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600 text-sm group-hover:scale-110 transition-transform origin-right">
                      {formatVnd(user.totalSpent)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto text-gray-200 mb-2" />
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
