import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { io } from "socket.io-client";
import {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  Battery,
  MapPin,
  Clock,
  ThermometerSun,
  Wind,
  Wifi,
  WifiOff,
  BatteryLow,
  UserPlus,
  Info,
  Zap,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const stats = [
  { label: '應到人員', value: 'n/n', change: '0', icon: Users, color: 'bg-blue-500' },
  { label: '低電量裝置', value: 'n/n', change: '0', icon: BatteryLow, color: 'bg-yellow-500' },
  { label: '安全區域', value: 'n/n', change: '0', icon: Shield, color: 'bg-orange-500' },
  { label: '安全警報', value: 'n/n', change: '0', icon: AlertTriangle, color: 'bg-red-500' },
];

const recentActivity = [
  {
    id: 1,
    type: 'device_connect',
    message: '測試01-安全帽已連線',
    time: '5分鐘前',
    status: 'success',
    icon: Wifi
  },
  {
    id: 2,
    type: 'zone_warning',
    message: '危險區域2有人員進入',
    time: '12分鐘前',
    status: 'warning',
    icon: ShieldAlert
  },
  {
    id: 3,
    type: 'personnel_add',
    message: '新增人員：測試01',
    time: '25分鐘前',
    status: 'info',
    icon: UserPlus
  },
  {
    id: 4,
    type: 'device_low_battery',
    message: '設備 [測試01] 電量低於20%',
    time: '1小時前',
    status: 'warning',
    icon: BatteryLow
  },
  {
    id: 5,
    type: 'emergency',
    message: '緊急按鈕被觸發 - A區',
    time: '2小時前',
    status: 'danger',
    icon: Zap
  },
  {
    id: 6,
    type: 'device_disconnect',
    message: '測試01-安全帽已斷線',
    time: '3小時前',
    status: 'error',
    icon: WifiOff
  },
  {
    id: 7,
    type: 'general_info',
    message: '系統維護完成',
    time: '4小時前',
    status: 'info',
    icon: Info
  },
  {
    id: 8,
    type: 'zone_danger',
    message: '高壓電區域檢測到異常且人員未回應',
    time: '5小時前',
    status: 'danger',
    icon: AlertTriangle
  },
  {
    id: 9,
    type: 'zone_safe_response',
    message: '高壓電區域檢測到異常但人員回報安全',
    time: '6小時前',
    status: 'resolved',
    icon: ShieldCheck
  }
];


const deviceStatus = [
  { id: 'HD-001', name: 'Test_User1', battery: 85, location: 'A區', status: 'online' },
  { id: 'HD-002', name: 'Test_User2', battery: 92, location: 'B區', status: 'online' },
  { id: 'HD-003', name: 'Test_User3', battery: 76, location: 'C區', status: 'online' },
  { id: 'HD-004', name: 'Test_User4', battery: 18, location: 'A區', status: 'warning' },
  { id: 'HD-005', name: 'Test_User5', battery: 0, location: '未知', status: 'offline' },
];

const iconMap = {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  Battery,
  MapPin,
  Clock,
  ThermometerSun,
  Wind,
  Wifi,
  WifiOff,
  BatteryLow,
  UserPlus,
  Info,
  Zap,
  ShieldAlert,
  ShieldCheck
};

export const DashboardPage: React.FC = () => {
  // 天氣與時間 state
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [time, setTime] = useState<string>("");
  const [ampm, setAmpm] = useState<string>("");
  const [activities, setActivities] = useState(recentActivity);

  // 取得定位
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          // 定位失敗，預設台北
          setLocation({ lat: 25.038, lon: 121.5645 });
        }
      );
    } else {
      setLocation({ lat: 25.038, lon: 121.5645 });
    }
  }, []);

  // 取得天氣
  useEffect(() => {
    if (location) {
      // Open-Meteo 免費 API
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m&timezone=Asia%2FTaipei`)
        .then(res => res.json())
        .then(data => setWeather(data.current_weather))
        .catch(() => {
          // API 失敗時的預設值
          setWeather({ temperature: 28, weathercode: 0, windspeed: 5 });
        });
    }
  }, [location]);

  // 固定 UTC+8 時區時間
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // 轉換為 UTC+8
      const utc8 = new Date(now.getTime() + (8 + now.getTimezoneOffset() / 60) * 60 * 60 * 1000);
      const localeTime = utc8.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
      setTime(localeTime.replace(/^([AP]M) /, ''));
      setAmpm(localeTime.includes('AM') ? 'AM' : 'PM');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket'] // 可以不寫，它自己會 fallback
    });

    socket.on("connect", () => {
      console.log("✅ Socket.IO 已連線");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO 已斷線");
    });

    socket.on("activity", (data) => {
      try {
        const parsed =
          typeof data === "string" ? JSON.parse(data) : data;

        console.log("收到 activity:", parsed);

        setActivities((prev) => [
          {
            id: parsed.id ?? Date.now(),
            type: parsed.type || "general_info",
            message: parsed.message || "未知訊息",
            time: parsed.time ?? Date.now(),
            status: parsed.status || "info",
            icon: iconMap[parsed.icon as keyof typeof iconMap] || Info,
          },
          ...prev.slice(0, 49),
        ]);
      } catch (err) {
        console.error("解析 Socket.IO 訊息失敗", err);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket.IO 出錯", err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  // 天氣中文轉換
  const weatherDesc = (code: number) => {
    // 只處理常見幾種
    if (code === 0) return '晴天';
    if (code === 1 || code === 2) return '多雲';
    if (code === 3) return '陰天';
    if (code >= 45 && code <= 48) return '霧';
    if (code >= 51 && code <= 67) return '毛毛雨';
    if (code >= 80 && code <= 82) return '陣雨';
    if (code >= 95) return '雷雨';
    return '未知';
  };

  // 取得活動狀態顏色和背景
  const getActivityStyle = (status: string) => {
    switch (status) {
      case 'success':
        return {
          dotColor: 'bg-green-500',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'warning':
        return {
          dotColor: 'bg-yellow-500',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'danger':
        return {
          dotColor: 'bg-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'error':
        return {
          dotColor: 'bg-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'info':
      default:
        return {
          dotColor: 'bg-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather & Time */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ThermometerSun className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{weather ? `${weather.temperature}°C` : '--'}</span>
              <span className="text-gray-500">{weather ? weatherDesc(weather.weathercode) : '載入中'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{weather ? `風速 ${weather.windspeed} km/h` : '--'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">{time}</span>
            <span className="text-sm text-gray-500">{ampm}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs 昨日</span>
                  </div>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const style = getActivityStyle(activity.status);

              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`${style.iconBg} rounded-full p-2 flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-5">{activity.message}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${style.dotColor} mr-2`}></div>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">設備狀態</h3>
          <div className="space-y-3">
            {deviceStatus.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' :
                    device.status === 'warning' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{device.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Battery className={`w-4 h-4 ${device.battery > 50 ? 'text-green-500' :
                      device.battery > 20 ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                    <span className="text-sm text-gray-600">{device.battery}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Zone Map Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">工地安全區域圖</h3>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">工地平面圖與安全區域</p>
            <p className="text-sm text-gray-400">即時人員位置追蹤</p>
          </div>
        </div>
      </div>
    </div>
  );
};