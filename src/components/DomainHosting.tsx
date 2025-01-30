import React, { useState } from 'react';
import { Globe, Server, Shield, Clock, Search, Filter, Plus, BarChart2, RefreshCw, Settings, MoreVertical, ArrowUp, ArrowDown, Calendar, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  registrar: string;
  status: 'active' | 'expired' | 'transferring';
  expiryDate: string;
  autoRenew: boolean;
  ssl: {
    status: 'valid' | 'expired' | 'warning';
    provider: string;
    expiryDate: string;
  };
  dns: {
    provider: string;
    records: number;
    lastUpdated: string;
  };
  hosting: {
    provider: string;
    plan: string;
    usage: {
      storage: number;
      bandwidth: number;
    };
  };
  monitoring: {
    uptime: number;
    responseTime: number;
    lastCheck: string;
  };
}

export function DomainHosting() {
  const [selectedView, setSelectedView] = useState<'overview' | 'domains' | 'ssl' | 'hosting'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample domains - In a real app, this would come from your backend
  const domains: Domain[] = [
    {
      id: 'dom-001',
      name: 'example.com',
      registrar: 'GoDaddy',
      status: 'active',
      expiryDate: '2025-01-15T00:00:00Z',
      autoRenew: true,
      ssl: {
        status: 'valid',
        provider: 'Let\'s Encrypt',
        expiryDate: '2024-04-15T00:00:00Z'
      },
      dns: {
        provider: 'Cloudflare',
        records: 15,
        lastUpdated: '2024-01-10T15:30:00Z'
      },
      hosting: {
        provider: 'AWS',
        plan: 'Production',
        usage: {
          storage: 25,
          bandwidth: 150
        }
      },
      monitoring: {
        uptime: 99.98,
        responseTime: 250,
        lastCheck: new Date().toISOString()
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'transferring': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Domain & Hosting</h1>
            <p className="text-gray-600">Manage domains, SSL certificates, and hosting services</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
              <Plus className="h-5 w-5" />
              Add Domain
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'ssl', label: 'SSL Certificates', icon: Shield },
            { id: 'hosting', label: 'Hosting', icon: Server }
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

      {/* Domain List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {domains.map(domain => (
          <div key={domain.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{domain.name}</h3>
                    <p className="text-sm text-gray-500">{domain.registrar}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                  {domain.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* SSL Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">SSL Certificate</p>
                      <p className="text-xs text-gray-500">{domain.ssl.provider}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.ssl.status)}`}>
                    {domain.ssl.status}
                  </span>
                </div>

                {/* Hosting Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Storage Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: '45%' }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatBytes(domain.hosting.usage.storage)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bandwidth</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: '60%' }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatBytes(domain.hosting.usage.bandwidth)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monitoring Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {domain.monitoring.uptime}% Uptime
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {domain.monitoring.responseTime}ms
                    </span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Expires {new Date(domain.expiryDate).toLocaleDateString()}</span>
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