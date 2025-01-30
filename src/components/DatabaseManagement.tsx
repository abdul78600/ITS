import React, { useState } from 'react';
import { Database, Server, HardDrive, Activity, AlertCircle, CheckCircle, Clock, Search, Filter, Plus, BarChart2, RefreshCw, Settings, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface DatabaseInstance {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'redis';
  version: string;
  status: 'running' | 'stopped' | 'maintenance';
  host: string;
  port: number;
  size: string;
  metrics: {
    connections: number;
    cpu: number;
    memory: number;
    storage: {
      total: number;
      used: number;
    };
    iops: number;
    latency: number;
  };
  backupStatus: {
    lastBackup: string;
    nextBackup: string;
    status: 'success' | 'failed' | 'in-progress';
  };
  lastUpdated: string;
}

export function DatabaseManagement() {
  const [selectedView, setSelectedView] = useState<'overview' | 'instances' | 'backups' | 'monitoring'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Sample database instances - In a real app, this would come from your backend
  const databases: DatabaseInstance[] = [
    {
      id: 'db-001',
      name: 'prod-main-db',
      type: 'postgresql',
      version: '14.5',
      status: 'running',
      host: 'prod-db.example.com',
      port: 5432,
      size: 'xlarge',
      metrics: {
        connections: 250,
        cpu: 45,
        memory: 72,
        storage: {
          total: 500,
          used: 320
        },
        iops: 3500,
        latency: 2.5
      },
      backupStatus: {
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      lastUpdated: new Date().toISOString()
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
            <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
            <p className="text-gray-600">Monitor and manage database instances</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
              <Plus className="h-5 w-5" />
              New Instance
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'instances', label: 'Instances', icon: Database },
            { id: 'backups', label: 'Backups', icon: HardDrive },
            { id: 'monitoring', label: 'Monitoring', icon: BarChart2 }
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
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Total Instances', databases.length, 'active', Database)}
        {renderMetricsCard('Avg CPU Usage', 45, '%', Activity, 'up')}
        {renderMetricsCard('Total Storage', 2.5, 'TB', HardDrive)}
        {renderMetricsCard('Active Connections', 250, '', Server)}
      </div>

      {/* Database Instances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {databases.map(db => (
          <div key={db.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{db.name}</h3>
                    <p className="text-sm text-gray-500">{db.type} {db.version}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(db.status)}`}>
                  {db.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Resource Usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">CPU Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${db.metrics.cpu}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {db.metrics.cpu}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Memory</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${db.metrics.memory}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {db.metrics.memory}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connection Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{db.host}:{db.port}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{db.metrics.connections} connections</span>
                  </div>
                </div>

                {/* Backup Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Backup</p>
                      <p className="text-xs text-gray-500">
                        {new Date(db.backupStatus.lastBackup).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    db.backupStatus.status === 'success' ? 'bg-green-100 text-green-800' :
                    db.backupStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {db.backupStatus.status}
                  </span>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(db.lastUpdated).toLocaleTimeString()}</span>
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
    </div>
  );
}