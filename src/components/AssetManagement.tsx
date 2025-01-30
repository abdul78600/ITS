import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Monitor, Tag, MapPin, Building2, 
  MoreVertical, AlertCircle, Laptop, Smartphone, Server,
  Printer, Network, Database, HardDrive, Settings,
  Calendar, Clock, DollarSign, Package, Shield,
  CheckCircle, XCircle, AlertTriangle, User, Save,
  X, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AssetForm } from './AssetForm';

interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'retired' | 'reserved';
  condition: 'new' | 'good' | 'fair' | 'poor';
  location: string;
  department: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  cost?: number;
  vendor?: string;
  specifications: Record<string, any>;
  notes?: string;
  assignedTo?: {
    id: string;
    name: string;
    department: string;
    assignedAt: string;
  }[];
  maintenanceHistory?: {
    id: string;
    type: string;
    date: string;
    description: string;
    cost: number;
    performedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function AssetManagement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storedAssets = localStorage.getItem('assets');
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAsset = (assetData: any) => {
    try {
      const newAsset = {
        ...assetData,
        id: `A-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.name,
        status: 'active'
      };

      const updatedAssets = [newAsset, ...assets];
      setAssets(updatedAssets);
      localStorage.setItem('assets', JSON.stringify(updatedAssets));
      setShowForm(false);
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to create asset');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'laptop': return Laptop;
      case 'desktop': return Monitor;
      case 'mobile': return Smartphone;
      case 'server': return Server;
      case 'printer': return Printer;
      case 'network': return Network;
      case 'storage': return HardDrive;
      default: return Package;
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;
    if (selectedDepartment !== 'all' && asset.department !== selectedDepartment) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(search) ||
        asset.serialNumber.toLowerCase().includes(search) ||
        asset.brand.toLowerCase().includes(search) ||
        asset.model.toLowerCase().includes(search)
      );
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600">Manage and track all company assets</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Add Asset
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
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
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="reserved">Reserved</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="laptop">Laptops</option>
              <option value="desktop">Desktops</option>
              <option value="mobile">Mobile Devices</option>
              <option value="server">Servers</option>
              <option value="printer">Printers</option>
              <option value="network">Network Equipment</option>
              <option value="storage">Storage Devices</option>
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
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Form */}
      {showForm && (
        <AssetForm
          onClose={() => setShowForm(false)}
          onSubmit={handleNewAsset}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* Assets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            const CategoryIcon = getCategoryIcon(asset.category);
            return (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-500">{asset.brand} {asset.model}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>{asset.serialNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{asset.department}</span>
                    </div>
                    {asset.assignedTo && asset.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{asset.assignedTo[0].name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'No warranty'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}