import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Search,
  Clock,
  User,
  Users,
  MessageCircle,
  Video,
  VideoOff,
  Settings,
  UserPlus,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatar?: string;
  lastSeen?: string;
}

interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  timestamp: Date;
  status: 'completed' | 'missed' | 'declined';
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: '李文和',
    role: '鋼架工程師',
    department: '結構工程部',
    phone: '0912-345-678',
    status: 'online'
  },
  {
    id: '2',
    name: '林玉涵',
    role: '混凝土工程師',
    department: '土木工程部',
    phone: '0912-345-679',
    status: 'busy'
  },
  {
    id: '3',
    name: '李東承',
    role: '基礎工程師',
    department: '土木工程部',
    phone: '0912-345-680',
    status: 'online'
  },
  {
    id: '4',
    name: '林育宏',
    role: '安全督導',
    department: '安全管理部',
    phone: '0912-345-681',
    status: 'away'
  },
  {
    id: '5',
    name: '林育宏',
    role: '現場主管',
    department: '管理部',
    phone: '0912-345-682',
    status: 'offline'
  }
];

const mockCallRecords: CallRecord[] = [
  {
    id: '1',
    contactId: '1',
    contactName: '王小明',
    type: 'outgoing',
    duration: '05:23',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed'
  },
  {
    id: '2',
    contactId: '2',
    contactName: '李大華',
    type: 'incoming',
    duration: '02:15',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'completed'
  },
  {
    id: '3',
    contactId: '4',
    contactName: '陳四',
    type: 'missed',
    duration: '00:00',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'missed'
  }
];

export const CommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'calls' | 'history'>('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCall, setCurrentCall] = useState<Contact | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Contact | null>(null);
  
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '線上';
      case 'busy':
        return '忙碌';
      case 'away':
        return '離開';
      case 'offline':
        return '離線';
      default:
        return '未知';
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = (contact: Contact) => {
    setCurrentCall(contact);
    setIsCallActive(true);
    setCallDuration(0);
    
    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCurrentCall(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsVideoOn(false);
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const answerCall = () => {
    if (incomingCall) {
      startCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const declineCall = () => {
    setIncomingCall(null);
  };

  const simulateIncomingCall = (contact: Contact) => {
    setIncomingCall(contact);
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="w-4 h-4 text-green-500" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通訊中心</h1>
          <p className="text-gray-600">與工地人員進行語音通話和即時通訊</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>新增聯絡人</span>
          </button>
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">線上人員</p>
              <p className="text-2xl font-bold text-green-600">
                {mockContacts.filter(c => c.status === 'online').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">今日通話</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <PhoneCall className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">通話時長</p>
              <p className="text-2xl font-bold text-purple-600">2.5h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">未接來電</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <PhoneMissed className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Communication Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'contacts', label: '聯絡人', icon: Users },
                { id: 'calls', label: '通話中', icon: PhoneCall },
                { id: 'history', label: '通話記錄', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋聯絡人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contact.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                        <p className="text-xs text-gray-400">{contact.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{getStatusText(contact.status)}</span>
                      <button
                        onClick={() => startCall(contact)}
                        disabled={contact.status === 'offline'}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => simulateIncomingCall(contact)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calls' && (
              <div className="text-center py-12">
                {isCallActive ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{currentCall?.name}</h3>
                      <p className="text-gray-500">{currentCall?.role}</p>
                      <p className="text-lg font-mono text-gray-700 mt-2">{formatCallDuration(callDuration)}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <PhoneCall className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">目前沒有進行中的通話</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {mockCallRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getCallIcon(record.type)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{record.contactName}</h4>
                        <p className="text-xs text-gray-500">
                          {record.timestamp.toLocaleString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{record.duration}</p>
                      <p className="text-xs text-gray-500">{record.status === 'completed' ? '已完成' : record.status === 'missed' ? '未接' : '已拒絕'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">通話控制</h3>
          
          {isCallActive ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900">{currentCall?.name}</h4>
                <p className="text-sm text-gray-500">{currentCall?.role}</p>
                <p className="text-lg font-mono text-gray-700 mt-2">{formatCallDuration(callDuration)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5 mx-auto" /> : <Mic className="w-5 h-5 mx-auto" />}
                </button>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3 rounded-lg transition-colors ${
                    isSpeakerOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5 mx-auto" /> : <VolumeX className="w-5 h-5 mx-auto" />}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-lg transition-colors ${
                    isVideoOn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isVideoOn ? <Video className="w-5 h-5 mx-auto" /> : <VideoOff className="w-5 h-5 mx-auto" />}
                </button>
                <button
                  onClick={endCall}
                  className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <PhoneOff className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">選擇聯絡人開始通話</p>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{incomingCall.name}</h3>
            <p className="text-gray-500 mb-6">來電中...</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={declineCall}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={answerCall}
                className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-colors"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};