import React, { useState } from 'react';
import { 
  Server, HardDrive, Network, Cloud, Search, Filter, AlertCircle, CheckCircle, 
  Clock, Activity, Cpu, Database, MemoryStick as Memory, Wifi, Settings, 
  MoreVertical, RefreshCw, Power, AlertTriangle, BarChart2, TrendingUp, 
  ArrowUp, ArrowDown, Percent, HardDriveDownload, Plus, Globe, Shield,
  Router, Signal, Zap
} from 'lucide-react';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'access-point';
  model: string;
  manufacturer: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
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
  lastSeen: string;
}

interface Server {
  id: string;
  name: string;
  type: 'physical' | 'virtual';
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  os: string;
  ip: string;
  location: string;
  environment: 'production' | 'staging' | 'development';
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: {
      up: number;
      down: number;
    };
  };
  lastUpdated: string;
}

export function Infrastructure() {
  const [selectedView, setSelectedView] = useState<'overview' | 'servers' | 'storage' | 'network'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');

  // Sample servers data
  const servers: Server[] = [
    {
      id: 'srv-001',
      name: 'PROD-APP-01',
      type: 'physical',
      status: 'running',
      os: 'Ubuntu 22.04 LTS',
      ip: '192.168.1.10',
      location: 'Main DC',
      environment: 'production',
      metrics: {
        cpu: 45,
        memory: 68,
        disk: 72,
        network: { up: 25, down: 18 }
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'srv-002',
      name: 'PROD-DB-01',
      type: 'physical',
      status: 'running',
      os: 'Red Hat Enterprise Linux 8',
      ip: '192.168.1.11',
      location: 'Main DC',
      environment: 'production',
      metrics: {
        cpu: 78,
        memory: 85,
        disk: 65,
        network: { up: 30, down: 22 }
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'srv-003',
      name: 'DEV-APP-01',
      type: 'virtual',
      status: 'maintenance',
      os: 'Windows Server 2022',
      ip: '192.168.2.10',
      location: 'DR Site',
      environment: 'development',
      metrics: {
        cpu: 25,
        memory: 45,
        disk: 30,
        network: { up: 10, down: 8 }
      },
      lastUpdated: new Date().toISOString()
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Server Uptime', 99.98, '%', Server)}
        {renderMetricsCard('Storage Usage', 72, '%', HardDrive, 'up')}
        {renderMetricsCard('Network Load', 45, '%', Network)}
        {renderMetricsCard('Active Servers', 15, '', Server)}
      </div>

      {/* Resource Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Allocation</h3>
          <div className="space-y-4">
            {['CPU', 'Memory', 'Storage', 'Network'].map((resource) => (
              <div key={resource} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{resource}</span>
                  <span className="text-gray-900 font-medium">75%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-4">
            {[
              { type: 'error', message: 'High CPU usage on PROD-APP-01', time: '5m ago' },
              { type: 'warning', message: 'Storage space running low on SAN-PROD-01', time: '15m ago' },
              { type: 'info', message: 'Network switch firmware update available', time: '1h ago' }
            ].map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === 'error' ? 'bg-red-50' :
                  alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}
              >
                {alert.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' :
                    alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderServers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servers.map(server => (
        <div key={server.id} className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{server.name}</h3>
                  <p className="text-sm text-gray-500">{server.os}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(server.status)}`}>
                {server.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">CPU Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${server.metrics.cpu}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {server.metrics.cpu}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Memory</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${server.metrics.memory}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {server.metrics.memory}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{server.ip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{server.metrics.disk}% used</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(server.lastUpdated).toLocaleTimeString()}</span>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNetwork = () => {
    // Sample network devices
    const networkDevices: NetworkDevice[] = [
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
        },
        lastSeen: new Date().toISOString()
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
        lastSeen: new Date().toISOString()
      }
    ];

    const getDeviceIcon = (type: string) => {
      switch (type) {
        case 'router': return Router;
        case 'switch': return Network;
        case 'firewall': return Shield;
        case 'access-point': return Wifi;
        default: return Network;
      }
    };

    const formatSpeed = (mbps: number) => {
      if (mbps >= 1000) {
        return `${(mbps / 1000).toFixed(1)} Gbps`;
      }
      return `${mbps} Mbps`;
    };

    return (
      <div className="space-y-6">
        {/* Network Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricsCard('Total Devices', networkDevices.length, 'active', Network)}
          {renderMetricsCard('Avg Throughput', 1.2, 'Gbps', Activity, 'up')}
          {renderMetricsCard('Avg Latency', 2.5, 'ms', Clock)}
          {renderMetricsCard('Active Ports', 78, '%', Signal)}
        </div>

        {/* Network Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {networkDevices.map(device => {
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
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      device.status === 'online' ? 'bg-green-100 text-green-800' :
                      device.status === 'offline' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
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
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Infrastructure</h1>
            <p className="text-gray-600">Monitor and manage infrastructure resources</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
              <Plus className="h-5 w-5" />
              Add Server
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'servers', label: 'Servers', icon: Server },
            { id: 'storage', label: 'Storage', icon: HardDrive },
            { id: 'network', label: 'Network', icon: Network }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedView === item.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search servers..."
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
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>

            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'servers' && renderServers()}
      {selectedView === 'storage' && <div>Storage content</div>}
      {selectedView === 'network' && renderNetwork()}
    </div>
  );
}