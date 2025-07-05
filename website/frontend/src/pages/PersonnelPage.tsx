import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2,
  Shield,
  HardHat,
  Clock,
  CheckCircle,
  XCircle,
  Droplets
} from 'lucide-react';

const mockPersonnel = [
  {
    id: '001',
    name: '李文和',
    role: '鋼架工程師',
    department: '結構工程部',
    phone: '0912-345-678',
    email: 'wang@construction.com',
    bloodType: 'A+',
    status: 'active',
    deviceId: 'HD-001',
    currentLocation: 'A區-鋼架工程',
    joinDate: '2024-01-15',
    lastSeen: '5分鐘前',
    certifications: ['高空作業證', '焊接證']
  },
  {
    id: '002',
    name: '李東承',
    role: '混凝土工程師',
    department: '土木工程部',
    phone: '0912-345-679',
    email: 'li@construction.com',
    bloodType: 'B+',
    status: 'active',
    deviceId: 'HD-002',
    currentLocation: 'B區-混凝土澆築',
    joinDate: '2024-01-14',
    lastSeen: '2分鐘前',
    certifications: ['混凝土技師證', '品管證']
  },
  {
    id: '003',
    name: '林玉涵',
    role: '基礎工程師',
    department: '土木工程部',
    phone: '0912-345-680',
    email: 'zhang@construction.com',
    bloodType: 'O-',
    status: 'active',
    deviceId: 'HD-003',
    currentLocation: 'C區-基礎工程',
    joinDate: '2024-01-13',
    lastSeen: '10分鐘前',
    certifications: ['基礎工程證']
  },
  {
    id: '004',
    name: '林育宏',
    role: '廢物',
    department: '安全管理部',
    phone: '0912-345-681',
    email: 'chen@construction.com',
    bloodType: 'AB+',
    status: 'inactive',
    deviceId: 'HD-004',
    currentLocation: '辦公室',
    joinDate: '2024-01-12',
    lastSeen: '1小時前',
    certifications: ['安全督導證', '急救證']
  }
];

export const PersonnelPage: React.FC = () => {
  const [personnel, setPersonnel] = useState(mockPersonnel);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.phone.includes(searchTerm);
    const matchesDepartment = departmentFilter === 'all' || person.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    return status === 'active' 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? '在職' : '離職';
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('安全')) return <Shield className="w-4 h-4 text-blue-500" />;
    return <HardHat className="w-4 h-4 text-orange-500" />;
  };

  const getBloodTypeColor = (bloodType: string) => {
    switch (bloodType) {
      case 'A+':
      case 'A-':
        return 'bg-red-100 text-red-800';
      case 'B+':
      case 'B-':
        return 'bg-blue-100 text-blue-800';
      case 'AB+':
      case 'AB-':
        return 'bg-purple-100 text-purple-800';
      case 'O+':
      case 'O-':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const departments = [...new Set(personnel.map(p => p.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人員管理</h1>
          <p className="text-gray-600">管理工地人員資訊和權限</p>
        </div>
        <button
          onClick={() => setShowAddPersonnel(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新增人員</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總人員</p>
              <p className="text-2xl font-bold text-gray-900">{personnel.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">在職人員</p>
              <p className="text-2xl font-bold text-green-600">
                {personnel.filter(p => p.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">在線設備</p>
              <p className="text-2xl font-bold text-orange-600">
                {personnel.filter(p => p.status === 'active').length}
              </p>
            </div>
            <HardHat className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">部門數</p>
              <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
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
                placeholder="搜尋人員姓名、職位或電話..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">全部部門</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">全部狀態</option>
              <option value="active">在職</option>
              <option value="inactive">離職</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonnel.map((person) => (
          <div key={person.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(person.status)}
                <span className={`text-sm font-medium ${
                  person.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getStatusText(person.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {getRoleIcon(person.role)}
                <span className="text-sm text-gray-900">{person.role}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-600">血型:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBloodTypeColor(person.bloodType)}`}>
                  {person.bloodType}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.currentLocation}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">最後上線: {person.lastSeen}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">證照</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {person.certifications.map((cert, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-orange-600 hover:text-orange-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Personnel Modal */}
      {showAddPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新增人員</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="請輸入姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    職位
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="例如：鋼架工程師"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部門
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">選擇部門</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0912-345-678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電子信箱
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="example@construction.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    血型
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">選擇血型</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  證照 (多個證照請用逗號分隔)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="例如：高空作業證,焊接證"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddPersonnel(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  新增人員
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};