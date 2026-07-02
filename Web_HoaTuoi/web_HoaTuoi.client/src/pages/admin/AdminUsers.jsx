import { useState, useEffect } from 'react';
import { Search, ListOrdered, CalendarDays } from 'lucide-react';
import apiClient from '../../api/client';
import { formatVnd } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const PAGE_SIZE = 15;

  const fetchUsers = () => {
    apiClient.get(`/users?page=${page}&pageSize=${PAGE_SIZE}${search ? `&search=${search}` : ''}`)
      .then(r => { 
        setUsers(r.data.items ?? []); 
        setTotal(r.data.total ?? 0); 
      })
      .catch(() => toast.error('Không thể tải danh sách khách hàng'));
  };

  useEffect(() => { 
    fetchUsers(); 
  }, [page]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchUsers();
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Khách hàng</h1>
        <p className="text-sm text-gray-400">{total} khách hàng</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Tìm kiếm theo Tên, Email, SĐT (Nhấn Enter)..." 
          className="input pl-9 text-sm focus:ring-amber-500/20" 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Khách hàng</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Thông tin liên hệ</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Lịch sử Mua hàng</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Ngày đăng ký</th>
                <th className="px-5 py-4 text-left font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
                        {u.fullName?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{u.fullName || 'Khách vãng lai'}</p>
                        <p className="text-xs text-gray-400 font-mono">{u.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-600">{u.email}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{u.phoneNumber || 'Không có SĐT'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <ListOrdered size={14} className="text-blue-400" />
                        <span><b className="text-gray-800">{u.totalOrders}</b> đơn hàng</span>
                      </div>
                      <div className="text-amber-600 font-medium">
                        Tổng: {formatVnd(u.totalSpent)}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-gray-400" />
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1.5 rounded-lg ${u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    Chưa có khách hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-amber-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
