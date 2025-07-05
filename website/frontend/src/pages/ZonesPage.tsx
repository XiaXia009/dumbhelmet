import React, { useState } from 'react';
import { 
  Plus, 
  Shield, 
  AlertTriangle, 
  XCircle, 
  Edit, 
  Trash2,
  Play,
  Pause,
  MapPin,
  Users,
  Settings
} from 'lucide-react';

const mockZones = [
  {
    id: 'zone-001',
    name: '起重機作業區',
    type: 'danger' as const,
    isActive: true,
    description: '大型起重機械作業範圍，禁止非作業人員進入',
    currentPersonnel: 0,
    maxPersonnel: 3,
    createdAt: '2024-01-15',
    lastTriggered: '2小時前'
  },
  {
    id: 'zone-002',
    name: '鋼架安裝區',
    type: 'warning' as const,
    isActive: true,
    description: '鋼架安裝作業區域，需配戴完整安全裝備',
    currentPersonnel: 2,
    maxPersonnel: 5,
    createdAt: '2024-01-14',
    lastTriggered: '30分鐘前'
  },
  {
    id: 'zone-003',
    name: '休息區',
    type: 'safe' as const,
    isActive: true,
    description: '工人休息及用餐區域',
    currentPersonnel: 8,
    maxPersonnel: 20,
    createdAt: '2024-01-13',
    lastTriggered: '從未'
  },
  {
    id: 'zone-004',
    name: '材料堆放區',
    type: 'warning' as const,
    isActive: false,
    description: '建築材料暫存區域，注意重物墜落風險',
    currentPersonnel: 1,
    maxPersonnel: 4,
    createdAt: '2024-01-12',
    lastTriggered: '1天前'
  },
];

export const ZonesPage: React.FC = () => {
  const [zones, setZones] = useState(mockZones);
  const [showAddZone, setShowAddZone] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'safe':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getZoneTypeText = (type: string) => {
    switch (type) {
      case 'safe':
        return '安全區域';
      case 'warning':
        return '警告區域';
      case 'danger':
        return '危險區域';
      default:
        return '未知';
    }
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'safe':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleZoneStatus = (zoneId: string) => {
    setZones(zones.map(zone => 
      zone.id === zoneId 
        ? { ...zone, isActive: !zone.isActive }
        : zone
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UWB安全圍籬管理</h1>
          <p className="text-gray-600">設定和管理工地安全區域圍籬</p>
        </div>
        <button
          onClick={() => setShowAddZone(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新增區域</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總區域數</p>
              <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活動區域</p>
              <p className="text-2xl font-bold text-green-600">
                {zones.filter(z => z.isActive).length}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">危險區域</p>
              <p className="text-2xl font-bold text-red-600">
                {zones.filter(z => z.type === 'danger').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">區域內人員</p>
              <p className="text-2xl font-bold text-orange-600">
                {zones.reduce((sum, zone) => sum + zone.currentPersonnel, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Zone Map */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">安全區域配置圖</h3>
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">工地平面圖</p>
            <p className="text-sm text-gray-400">點擊設定 UWB 安全圍籬範圍</p>
          </div>
        </div>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">區域列表</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {zones.map((zone) => (
            <div key={zone.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getZoneIcon(zone.type)}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{zone.name}</h4>
                    <p className="text-sm text-gray-500">{zone.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getZoneColor(zone.type)}`}>
                        {getZoneTypeText(zone.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        建立於 {zone.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {zone.currentPersonnel}/{zone.maxPersonnel} 人
                    </div>
                    <div className="text-xs text-gray-500">
                      最後觸發: {zone.lastTriggered}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleZoneStatus(zone.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        zone.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {zone.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新增安全區域</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  區域名稱
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="例如：電梯井作業區"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  區域類型
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="safe">安全區域</option>
                  <option value="warning">警告區域</option>
                  <option value="danger">危險區域</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大人員數
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="區域描述和注意事項"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddZone(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  新增區域
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};