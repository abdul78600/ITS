import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  BarChart2,
  TrendingUp,
  ArrowRight,
  MoreVertical,
  FileText,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VendorForm } from './VendorForm';

export function VendorManagement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample vendors data
  const vendors = [
    {
      id: 'V001',
      name: 'Tech Solutions Inc',
      category: 'Software',
      status: 'active',
      contact: {
        name: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '+92 300 1234567'
      },
      spending: {
        current: {
          value: 450000,
          currency: 'PKR'
        },
        previous: {
          value: 380000,
          currency: 'PKR'
        },
        trend: 18.4
      },
      performance: {
        rating: 4.5,
        responseTime: 24,
        deliveryScore: 98,
        qualityScore: 95
      },
      contracts: 3,
      lastOrder: '2024-01-15'
    },
    {
      id: 'V002',
      name: 'Hardware Pro',
      category: 'Hardware',
      status: 'active',
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@hardwarepro.com',
        phone: '+92 300 9876543'
      },
      spending: {
        current: {
          value: 750000,
          currency: 'PKR'
        },
        previous: {
          value: 620000,
          currency: 'PKR'
        },
        trend: 21.0
      },
      performance: {
        rating: 4.8,
        responseTime: 12,
        deliveryScore: 100,
        qualityScore: 98
      },
      contracts: 5,
      lastOrder: '2024-01-10'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Manage and monitor vendor relationships</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Add Vendor
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
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
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <h3 className="text-2xl font-bold text-gray-900">48</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">+5 new</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Active Contracts</p>
              <h3 className="text-2xl font-bold text-gray-900">32</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-600">8 renewals</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">due soon</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Spending</p>
              <h3 className="text-2xl font-bold text-gray-900">₨12.5M</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">+18.4%</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <h3 className="text-2xl font-bold text-gray-900">4.6/5</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart2 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">+0.3</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">improvement</span>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Vendors</h2>
            <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">ID: {vendor.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{vendor.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.contact.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Spending</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">₨{vendor.spending.current.value.toLocaleString()}</span>
                          <span className="text-sm text-green-600">+{vendor.spending.trend}%</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Rating</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{vendor.performance.rating}/5</span>
                          <span className="text-sm text-gray-500">{vendor.contracts} contracts</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Response Time</span>
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{vendor.performance.responseTime}h</span>
                          <span className="text-sm text-gray-500">average</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Quality Score</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{vendor.performance.qualityScore}%</span>
                          <span className="text-sm text-gray-500">satisfaction</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Form Modal */}
      {showForm && (
        <VendorForm
          onClose={() => setShowForm(false)}
          onSubmit={(vendorData) => {
            console.log('New vendor:', vendorData);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}