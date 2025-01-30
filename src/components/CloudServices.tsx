import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Database,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart2,
  Settings,
  MoreVertical,
  RefreshCw,
  Power,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Search,
  Filter
} from 'lucide-react';

interface CloudResource {
  id: string;
  name: string;
  type: 'compute' | 'database' | 'storage' | 'network';
  provider: 'aws' | 'azure' | 'gcp';
  service: string;
  region: string;
  status: 'running' | 'stopped' | 'error';
  metrics: {
    cpu?: number;
    memory?: number;
    storage?: number;
    network?: {
      ingress: number;
      egress: number;
    };
    cost: {
      current: number;
      projected: number;
      lastMonth: number;
    };
    uptime: number;
  };
  lastUpdated: string;
}

export function CloudServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample cloud resources - In a real app, this would come from your backend
  const resources: CloudResource[] = [
    {
      id: 'aws-ec2-001',
      name: 'prod-web-cluster',
      type: 'compute',
      provider: 'aws',
      service: 'EC2',
      region: 'us-east-1',
      status: 'running',
      metrics: {
        cpu: 65,
        memory: 72,
        network: {
          ingress: 150,
          egress: 80
        },
        cost: {
          current: 450.75,
          projected: 620.50,
          lastMonth: 580.25
        },
        uptime: 99.99
      },
      lastUpdated: new Date().toISOString()
    },
    // Add more resources...
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws': return '🔶';
      case 'azure': return '🔷';
      case 'gcp': return '🔴';
      default: return '☁️';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderMetricsCard = (title: string, value: number, unit: string, trend?: number) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-600 mb-1">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cloud Services</h1>
            <p className="text-gray-600">Monitor and manage cloud resources across providers</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Providers</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">Google Cloud</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="compute">Compute</option>
              <option value="database">Database</option>
              <option value="storage">Storage</option>
              <option value="network">Network</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Total Resources', 24, 'active', 5)}
        {renderMetricsCard('Monthly Cost', 3250.75, 'USD', -2)}
        {renderMetricsCard('Avg CPU Usage', 68, '%', 8)}
        {renderMetricsCard('Uptime', 99.98, '%')}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cloud className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getProviderIcon(resource.provider)}</span>
                      <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{resource.service}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Resource Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {resource.metrics.cpu && (
                    <div>
                      <span className="text-sm text-gray-500">CPU Usage</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${resource.metrics.cpu}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {resource.metrics.cpu}%
                        </span>
                      </div>
                    </div>
                  )}
                  {resource.metrics.memory && (
                    <div>
                      <span className="text-sm text-gray-500">Memory</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${resource.metrics.memory}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {resource.metrics.memory}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resource Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{resource.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ${resource.metrics.cost.current}/mo
                    </span>
                  </div>
                </div>

                {/* Network Metrics */}
                {resource.metrics.network && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {formatBytes(resource.metrics.network.egress)}/s
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        {formatBytes(resource.metrics.network.ingress)}/s
                      </span>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(resource.lastUpdated).toLocaleTimeString()}</span>
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