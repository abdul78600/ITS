import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  Plus,
  Lock,
  Bell,
  AlertTriangle,
  FileCheck,
  Clock,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  BarChart2,
  ArrowUp,
  ArrowDown,
  FileText,
  Key,
  Users,
  Eye,
  RefreshCw,
  Calendar,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SecurityIncident {
  id: string;
  type: 'breach' | 'attempt' | 'policy' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  title: string;
  description: string;
  affectedSystems: string[];
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

interface SecurityPolicy {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  version: string;
  lastReviewed: string;
  nextReview: string;
  approvedBy?: string;
  content: string;
  attachments?: string[];
}

interface AccessControl {
  id: string;
  resourceType: string;
  resourceName: string;
  permissions: string[];
  grantedTo: {
    type: 'user' | 'role' | 'group';
    id: string;
    name: string;
  }[];
  createdAt: string;
  modifiedAt: string;
  expiresAt?: string;
}

interface SecurityAlert {
  id: string;
  type: 'intrusion' | 'malware' | 'policy' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  affectedUsers?: string[];
  affectedSystems?: string[];
}

export function Security() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'access-control' | 'monitoring' | 'incidents' | 'compliance'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  // Load data from storage
  useEffect(() => {
    const storedIncidents = localStorage.getItem('securityIncidents');
    const storedPolicies = localStorage.getItem('securityPolicies');
    const storedAccessControls = localStorage.getItem('accessControls');
    const storedAlerts = localStorage.getItem('securityAlerts');

    if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
    if (storedPolicies) setPolicies(JSON.parse(storedPolicies));
    if (storedAccessControls) setAccessControls(JSON.parse(storedAccessControls));
    if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
  }, []);

  // Save data to storage when updated
  useEffect(() => {
    localStorage.setItem('securityIncidents', JSON.stringify(incidents));
    localStorage.setItem('securityPolicies', JSON.stringify(policies));
    localStorage.setItem('accessControls', JSON.stringify(accessControls));
    localStorage.setItem('securityAlerts', JSON.stringify(alerts));
  }, [incidents, policies, accessControls, alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMetricsCard = (title: string, value: string | number, subtitle: string, icon: any, trend?: number) => {
    const Icon = icon;
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{title}</span>
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-600 mb-1">{subtitle}</span>
          {trend !== undefined && (
            <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'} ml-auto mb-1`}>
              {trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Active Incidents', incidents.filter(i => i.status === 'open').length, 'Open cases', AlertTriangle, 5)}
        {renderMetricsCard('Security Score', '85', 'out of 100', Shield, 2)}
        {renderMetricsCard('Policy Compliance', '92%', 'Adherence rate', FileCheck, -1)}
        {renderMetricsCard('Active Alerts', alerts.filter(a => a.status === 'active').length, 'Requiring attention', Bell)}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Alerts</h3>
        <div className="space-y-4">
          {alerts.slice(0, 5).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg ${
                alert.severity === 'critical' ? 'bg-red-50' :
                alert.severity === 'high' ? 'bg-orange-50' :
                alert.severity === 'medium' ? 'bg-yellow-50' :
                'bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className="font-medium">{alert.title}</span>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600">{alert.description}</p>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                <span className="text-gray-500">Source: {alert.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Security Status</h3>
          <div className="space-y-4">
            {[
              { name: 'Firewall', status: 'active', lastUpdated: '2h ago' },
              { name: 'Antivirus', status: 'active', lastUpdated: '1h ago' },
              { name: 'Intrusion Detection', status: 'active', lastUpdated: '30m ago' },
              { name: 'Backup System', status: 'active', lastUpdated: '4h ago' }
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{system.name}</p>
                    <p className="text-sm text-gray-500">Last checked: {system.lastUpdated}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {system.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { action: 'Policy Update', user: 'Admin', time: '10m ago', type: 'policy' },
              { action: 'Access Review', user: 'Security Team', time: '1h ago', type: 'access' },
              { action: 'Incident Report', user: 'John Doe', time: '2h ago', type: 'incident' },
              { action: 'System Scan', user: 'System', time: '4h ago', type: 'system' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'policy' ? <FileCheck className="h-4 w-4 text-blue-600" /> :
                   activity.type === 'access' ? <Key className="h-4 w-4 text-purple-600" /> :
                   activity.type === 'incident' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                   <Settings className="h-4 w-4 text-gray-600" />}
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">By: {activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessControl = () => (
    <div className="space-y-6">
      {/* Access Control Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('Active Users', 156, 'Total users', Users)}
        {renderMetricsCard('Access Requests', 8, 'Pending approval', Key, 3)}
        {renderMetricsCard('Failed Attempts', 12, 'Last 24 hours', AlertTriangle, -5)}
        {renderMetricsCard('Policy Violations', 3, 'This week', Shield, -2)}
      </div>

      {/* Access Control List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Access Control List</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Plus className="h-4 w-4" />
            Add Access Rule
          </button>
        </div>
        <div className="space-y-4">
          {accessControls.map(control => (
            <div key={control.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">{control.resourceName}</h4>
                </div>
                <span className="text-sm text-gray-500">{control.resourceType}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {control.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{control.grantedTo.length} users/roles</span>
                </div>
                <span>Modified: {new Date(control.modifiedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* Monitoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricsCard('System Health', '98%', 'Operational', Activity)}
        {renderMetricsCard('Active Sessions', 234, 'Current users', Users)}
        {renderMetricsCard('Security Events', 1250, 'Today', Bell)}
        {renderMetricsCard('Average Response', '1.2s', 'Response time', Clock)}
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Events</h3>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg ${
                alert.severity === 'critical' ? 'bg-red-50' :
                alert.severity === 'high' ? 'bg-orange-50' :
                alert.severity === 'medium' ? 'bg-yellow-50' :
                'bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'high' ? 'text-orange-600' :
                    alert.severity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className="font-medium">{alert.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
              {alert.affectedSystems && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {alert.affectedSystems.map((system, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(alert.timestamp).toLocaleString()}</span>
                <span>Source: {alert.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
            <p className="text-gray-600">Monitor and manage security settings and incidents</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
              <Plus className="h-5 w-5" />
              New Policy
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'access-control', label: 'Access Control', icon: Key },
            { id: 'monitoring', label: 'Security Monitoring', icon: Eye },
            { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
            { id: 'compliance', label: 'Compliance', icon: Shield }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'access-control' && renderAccessControl()}
      {activeTab === 'monitoring' && renderMonitoring()}
      {activeTab === 'incidents' && <div>Incidents content</div>}
      {activeTab === 'compliance' && <div>Compliance content</div>}
    </div>
  );
}