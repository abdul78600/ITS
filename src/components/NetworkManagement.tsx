import React, { useState } from 'react';
import {
  Network,
  Wifi,
  Router,
  Server,
  Search,
  Filter,
  Plus,
  Activity,
  AlertCircle,
  Clock,
  Settings,
  MoreVertical,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Zap,
  Signal,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'access-point' | 'firewall';
  model: string;
  manufacturer: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  firmware: string;
  metrics: {
    throughput: {
      in: number;
      out: number;
    };
    latency: number;
    packetLoss: number;
    errorRate: number;
    utilization: number;
  };
  ports: {
    total: number;
    active: number;
    errors: number;
  };
  alerts?: {
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }[];
}

export function NetworkManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Sample network devices - In a real app, this would come from your backend
  const devices: NetworkDevice[] = [
    {
      id: 'net-001',
      name: 'CORE-RTR-01',
      type: 'router',
      model: 'Cisco ISR 4451',
      manufacturer: 'Cisco',
      ipAddress: '192.168.1.1',
      macAddress: '00:1A:2B:3C:4D:5E',
      location: 'Main DC',
      status: 'online',
      lastSeen: new Date().toISOString(),
      firmware: '15.7(3)M4',
      metrics: {
        throughput: {
          in: 850,
          out: 720
        },
        latency: 2.5,
        packetLoss: 0.01,
        errorRate: 0.001,
        utilization: 45
      },
      ports: {
        total: 48,
        active: 36,
        errors: 0
      }
    },
    {
      id: 'net-002',
      name: 'CORE-SW-01',
      type: 'switch',
      model: 'Catalyst 9300',
      manufacturer: 'Cisco',
      ipAddress: '192.168.1.2',
      macAddress: '00:2B:3C:4D:5E:6F',
      location: 'Main DC',
      status: 'warning',
      lastSeen: new Date().toISOString(),
      firmware: '16.12.4',
      metrics: {
        throughput: {
          in: 1200,
          out: 980
        },
        latency: 0.5,
        packetLoss: 0.02,
        errorRate: 0.005,
        utilization: 78
      },
      ports: {
        total: 48,
        active: 42,
        errors: 2
      },
      alerts: [
        {
          type: 'warning',
          message: 'High port utilization detected',
          timestamp: new Date().toISOString()
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router': return Router;
      case 'switch': return Network;
      case 'access-point': return Wifi;
      case 'firewall': return Shield;
      default: return Network;
    }
  };

  const formatSpeed = (mbps: number) => {
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(1)} Gbps`;
    }
    return `${mbps} Mbps`;
  };

  const renderMetricsCard = (title: string, value: number, unit: string, icon: any, trend?: 'up' | 'down') => {
    const Icon = icon;
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{title}</span>
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-600 mb-1">{unit}</span>
          {trend && (
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'} ml-auto mb-1`}>
              {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network Management</h1>
            <p className="text-gray-600">Monitor and manage network devices and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
              <Plus className="h-5 w-5" />
              Add Device
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices by name, IP, or MAC address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="router">Routers</option>
              <option value="switch">Switches</option>
              <option value="access-point">Access Points</option>
              <option value="firewall">Firewalls</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="main-dc">Main DC</option>
              <option value="dr-site">DR Site</option>
              <option value="branch">Branch Office</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Total Devices', devices.length, 'active', Network)}
        {renderMetricsCard('Avg Throughput', 1.2, 'Gbps', Activity, 'up')}
        {renderMetricsCard('Avg Latency', 2.5, 'ms', Clock)}
        {renderMetricsCard('Active Ports', 78, '%', Signal)}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {devices.map(device => {
          const DeviceIcon = getDeviceIcon(device.type);
          return (
            <div key={device.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DeviceIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-500">{device.manufacturer} {device.model}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Network Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Throughput</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${device.metrics.utilization}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {device.metrics.utilization}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${device.metrics.errorRate * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {(device.metrics.errorRate * 100).toFixed(3)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{device.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {device.ports.active}/{device.ports.total} ports
                      </span>
                    </div>
                  </div>

                  {/* Traffic Stats */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Inbound</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatSpeed(device.metrics.throughput.in)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Outbound</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatSpeed(device.metrics.throughput.out)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {device.alerts && device.alerts.length > 0 && (
                    <div className="space-y-2">
                      {device.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 p-2 rounded-lg ${
                            alert.type === 'error' ? 'bg-red-50' :
                            alert.type === 'warning' ? 'bg-yellow-50' :
                            'bg-blue-50'
                          }`}
                        >
                          {alert.type === 'error' ? (
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last seen {new Date(device.lastSeen).toLocaleTimeString()}</span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}