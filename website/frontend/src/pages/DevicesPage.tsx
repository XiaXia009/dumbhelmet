import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Battery,
  Wifi,
  WifiOff,
  MapPin,
  Settings,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const mockDevices = [
  {
    id: 'HD-001',
    name: 'Test_User1',
    battery: 85,
    location: 'A區-鋼架工程',
    status: 'online',
    lastSeen: '剛剛',
    assignedAt: '2024-01-15',
    phone: '0912-345-678'
  },
  {
    id: 'HD-002',
    name: 'Test_User2',
    battery: 92,
    location: 'B區-混凝土澆築',
    status: 'online',
    lastSeen: '2分鐘前',
    assignedAt: '2024-01-14',
    phone: '0912-345-679'
  },
  {
    id: 'HD-003',
    name: 'Test_User3',
    battery: 76,
    location: 'C區-基礎工程',
    status: 'online',
    lastSeen: '5分鐘前',
    assignedAt: '2024-01-13',
    phone: '0912-345-680'
  },
  {
    id: 'HD-004',
    name: 'Test_User4',
    battery: 18,
    location: 'A區-鋼架工程',
    status: 'warning',
    lastSeen: '30分鐘前',
    assignedAt: '2024-01-12',
    phone: '0912-345-681'
  },
  {
    id: 'HD-005',
    name: 'Test_User5',
    battery: 0,
    location: '未知',
    status: 'offline',
    lastSeen: '2小時前',
    assignedAt: '2024-01-11',
    phone: '0912-345-682'
  },
];

export const DevicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [devices, setDevices] = useState(mockDevices);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '線上';
      case 'warning':
        return '警告';
      case 'offline':
        return '離線';
      default:
        return '未知';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-500';
    if (battery > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">安全帽裝置管理</h1>
          <p className="text-gray-600">管理和監控所有安全帽設備</p>
        </div>
        <button
          onClick={() => setShowAddDevice(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新增設備</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總設備數</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">線上設備</p>
              <p className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.status === 'online').length}
              </p>
            </div>
            <Wifi className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">警告設備</p>
              <p className="text-2xl font-bold text-yellow-600">
                {devices.filter(d => d.status === 'warning').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">離線設備</p>
              <p className="text-2xl font-bold text-red-600">
                {devices.filter(d => d.status === 'offline').length}
              </p>
            </div>
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋設備ID或人員姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">全部狀態</option>
              <option value="online">線上</option>
              <option value="warning">警告</option>
              <option value="offline">離線</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">設備列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  設備資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  位置
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後上線
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{device.name}</div>
                      <div className="text-sm text-gray-500">{device.id}</div>
                      <div className="text-xs text-gray-400">{device.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(device.status)}
                      <span className={`text-sm font-medium ${device.status === 'online' ? 'text-green-600' :
                        device.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {getStatusText(device.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(device.battery)}`} />
                      <span className="text-sm text-gray-900">{device.battery}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{device.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {device.lastSeen}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新增安全帽</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  人員名稱
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="配對人員姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  血型
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="A/B/O/AB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  裝置序號
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="862636052640529"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDevice(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  新增設備
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};