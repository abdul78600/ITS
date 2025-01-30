import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Shield,
  Calendar,
  AlertCircle,
  Clock,
  Tag,
  Building2,
  Users,
  MoreVertical,
  Download,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart2,
  Globe,
  User
} from 'lucide-react';
import { SoftwareForm } from './SoftwareForm';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionInfo {
  type: 'perpetual' | 'subscription';
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  renewalDate?: string;
  autoRenew?: boolean;
  lastPayment?: {
    amount: number;
    date: string;
  };
  nextPayment?: {
    amount: number;
    date: string;
  };
}

interface SoftwareAssignment {
  userId: string;
  userName: string;
  department: string;
  assignedAt: string;
  assignedBy: string;
}

interface Software {
  id: string;
  name: string;
  vendor: string;
  version: string;
  type: string;
  platform: string;
  licenseKey: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'maintenance';
  assignments: SoftwareAssignment[];
  department: string;
  cost: number;
  seats: number;
  supportContact?: string;
  supportEmail?: string;
  supportUrl?: string;
  tags: string[];
  installationPath?: string;
  systemRequirements?: string;
  notes?: string;
  maintenanceSchedule?: string;
  subscription: SubscriptionInfo;
  renewalStatus?: 'active' | 'pending' | 'overdue' | 'cancelled';
  renewalAmount?: number;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  autoRenewal: boolean;
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export function SoftwareManagement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState<Software[]>([]);
  const [overdueRenewals, setOverdueRenewals] = useState<Software[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    maintenance: 0,
    totalCost: 0,
    totalSeats: 0,
    upcomingRenewals: 0,
    overdueRenewals: 0,
    subscriptionCost: 0
  });

  useEffect(() => {
    loadSoftware();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [software]);

  useEffect(() => {
    // Check for upcoming and overdue renewals
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const upcoming = software.filter(sw => {
      if (!sw.nextRenewalDate) return false;
      const renewalDate = new Date(sw.nextRenewalDate);
      return renewalDate > now && renewalDate <= thirtyDaysFromNow;
    });

    const overdue = software.filter(sw => {
      if (!sw.nextRenewalDate) return false;
      const renewalDate = new Date(sw.nextRenewalDate);
      return renewalDate < now;
    });

    setUpcomingRenewals(upcoming);
    setOverdueRenewals(overdue);
  }, [software]);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, load from localStorage
      const storedSoftware = localStorage.getItem('software');
      const data = storedSoftware ? JSON.parse(storedSoftware) : [];
      setSoftware(data);
    } catch (err) {
      setError('Failed to load software inventory');
      console.error('Error loading software:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = software.reduce((acc, sw) => ({
      ...acc,
      total: acc.total + 1,
      active: acc.active + (sw.status === 'active' ? 1 : 0),
      expired: acc.expired + (sw.status === 'expired' ? 1 : 0),
      maintenance: acc.maintenance + (sw.status === 'maintenance' ? 1 : 0),
      totalCost: acc.totalCost + (sw.cost || 0),
      totalSeats: acc.totalSeats + (sw.seats || 0),
      upcomingRenewals: acc.upcomingRenewals + (sw.nextRenewalDate && new Date(sw.nextRenewalDate) > new Date() ? 1 : 0),
      overdueRenewals: acc.overdueRenewals + (sw.nextRenewalDate && new Date(sw.nextRenewalDate) < new Date() ? 1 : 0),
      subscriptionCost: acc.subscriptionCost + (sw.subscription?.type === 'subscription' ? (sw.subscription.nextPayment?.amount || 0) : 0)
    }), {
      total: 0,
      active: 0,
      expired: 0,
      maintenance: 0,
      totalCost: 0,
      totalSeats: 0,
      upcomingRenewals: 0,
      overdueRenewals: 0,
      subscriptionCost: 0
    });

    setStats(newStats);
  };

  const handleNewSoftware = (softwareData: any) => {
    const newSoftware = {
      ...softwareData,
      id: `sw-${Date.now()}`,
      status: 'active',
      assignments: []
    };

    const updatedSoftware = [newSoftware, ...software];
    setSoftware(updatedSoftware);
    localStorage.setItem('software', JSON.stringify(updatedSoftware));
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSubscriptionInfo = (sw: Software) => {
    if (sw.subscription?.type !== 'subscription') return null;

    const nextPayment = sw.subscription.nextPayment;
    const isOverdue = nextPayment && new Date(nextPayment.date) < new Date();

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Subscription Info</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Billing Cycle:</span>
            <span className="font-medium capitalize">{sw.subscription.billingCycle}</span>
          </div>
          {nextPayment && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Next Payment:</span>
              <div className="text-right">
                <span className="font-medium">${nextPayment.amount}</span>
                <span className={`block text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                  {new Date(nextPayment.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Auto-Renewal:</span>
            <span className={`font-medium ${sw.autoRenewal ? 'text-green-600' : 'text-red-600'}`}>
              {sw.autoRenewal ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const filteredSoftware = software.filter(sw => {
    if (selectedStatus !== 'all' && sw.status !== selectedStatus) return false;
    if (selectedType !== 'all' && sw.type !== selectedType) return false;
    if (selectedDepartment !== 'all' && sw.department !== selectedDepartment) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        sw.name.toLowerCase().includes(search) ||
        sw.vendor.toLowerCase().includes(search) ||
        sw.version.toLowerCase().includes(search) ||
        sw.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Software</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-600">{stats.active} Active</span>
            <span className="text-gray-300">|</span>
            <span className="text-red-600">{stats.expired} Expired</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Seats</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalSeats}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Across all licenses</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <h3 className="text-2xl font-bold text-gray-900">
                ${stats.totalCost.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <BarChart2 className="h-4 w-4" />
            <span>Annual licenses</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.maintenance}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Require attention</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Software Management</h1>
            <p className="text-gray-600">Manage software licenses and installations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Software
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search software by name, vendor, version, or tags..."
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
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="desktop">Desktop Application</option>
              <option value="web">Web Application</option>
              <option value="mobile">Mobile Application</option>
              <option value="system">System Software</option>
              <option value="cloud">Cloud Service</option>
              <option value="development">Development Tool</option>
              <option value="security">Security Software</option>
              <option value="utility">Utility</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Software Form */}
      {showForm && (
        <div className="mb-6">
          <SoftwareForm
            onClose={() => setShowForm(false)}
            onSubmit={handleNewSoftware}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Renewal Alerts */}
      {(upcomingRenewals.length > 0 || overdueRenewals.length > 0) && (
        <div className="space-y-4">
          {overdueRenewals.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-medium">Overdue Renewals</h3>
              </div>
              <div className="space-y-2">
                {overdueRenewals.map(sw => (
                  <div key={sw.id} className="flex items-center justify-between text-sm">
                    <span className="text-red-700">{sw.name}</span>
                    <span className="text-red-600">
                      Due: {new Date(sw.nextRenewalDate!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingRenewals.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-medium">Upcoming Renewals</h3>
              </div>
              <div className="space-y-2">
                {upcomingRenewals.map(sw => (
                  <div key={sw.id} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700">{sw.name}</span>
                    <span className="text-yellow-600">
                      Due: {new Date(sw.nextRenewalDate!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* Software Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSoftware.map((sw) => (
            <div
              key={sw.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sw.name}</h3>
                      <p className="text-sm text-gray-500">{sw.vendor}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>Version {sw.version}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span>{sw.platform || 'All Platforms'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{sw.assignments?.length || 0} of {sw.seats} seats assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{sw.department}</span>
                  </div>

                  {/* Assignments Preview */}
                  {sw.assignments && sw.assignments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Assigned to:</p>
                      <div className="space-y-1">
                        {sw.assignments.slice(0, 3).map((assignment, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{assignment.userName}</span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {assignment.department}
                            </span>
                          </div>
                        ))}
                        {sw.assignments.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{sw.assignments.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {sw.tags && sw.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sw.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subscription Info */}
                {renderSubscriptionInfo(sw)}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(sw.status)}`}>
                      {sw.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {sw.expiryDate ? new Date(sw.expiryDate).toLocaleDateString() : 'No expiry'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}