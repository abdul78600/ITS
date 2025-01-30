import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Clock,
  Tag,
  User,
  Calendar,
  ChevronRight,
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  ArrowUpRight,
  BarChart2,
  Settings,
  Shield,
  Download,
  Monitor,
  HardDrive,
  Smartphone,
  Network,
  Key,
  Mail,
  HelpCircle
} from 'lucide-react';
import { ServiceRequestForm } from './ServiceRequestForm';
import { ServiceRequestDetails } from './ServiceRequestDetails';
import { useAuth } from '../contexts/AuthContext';

interface ServiceRequestProps {
  view: string;
}

interface ServiceRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  requester: string;
  department?: string;
  approver?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  attachments?: any[];
  comments?: any[];
  approvalChain?: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
    comments?: string;
  }[];
}

export function ServiceRequest({ view }: ServiceRequestProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load service requests from storage
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    return getStoredServiceRequests();
  });

  // Save service requests to storage whenever they change
  useEffect(() => {
    setStoredServiceRequests(requests);
  }, [requests]);

  const handleNewRequest = (requestData: any) => {
    const newRequest: ServiceRequest = {
      id: `SR-${1000 + requests.length + 1}`,
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvalChain: [
        {
          level: 1,
          approver: user?.department === 'IT' ? 'IT Manager' : `${user?.department} Manager`,
          status: 'pending'
        }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);
    setShowForm(false);
  };

  const getViewTitle = () => {
    switch (view) {
      case 'new-requests':
        return 'New Service Request';
      case 'my-requests':
        return 'My Service Requests';
      case 'approvals':
        return 'Pending Approvals';
      default:
        return 'Service Requests';
    }
  };

  const filteredRequests = requests.filter(request => {
    // Filter based on view
    if (view === 'my-requests' && request.requester !== user?.name) return false;
    if (view === 'approvals' && !request.approvalChain?.some(chain => 
      chain.approver === user?.name && chain.status === 'pending'
    )) return false;

    // Filter based on search and other criteria
    if (selectedStatus !== 'all' && request.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && request.category !== selectedCategory) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        request.title.toLowerCase().includes(search) ||
        request.description.toLowerCase().includes(search) ||
        request.type.toLowerCase().includes(search) ||
        request.requester.toLowerCase().includes(search) ||
        request.department?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'software': return Monitor;
      case 'hardware': return HardDrive;
      case 'network': return Network;
      case 'access': return Key;
      case 'email': return Mail;
      default: return HelpCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
            <p className="text-gray-600">
              {view === 'approvals' 
                ? 'Review and manage service requests requiring your approval'
                : view === 'my-requests'
                ? 'Track and manage your service requests'
                : 'Submit and manage service requests'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {view !== 'approvals' && (
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                New Request
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="network">Network</option>
              <option value="access">Access</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found matching your criteria</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const CategoryIcon = getCategoryIcon(request.category);
              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">#{request.id}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <CategoryIcon className="h-4 w-4" />
                        <span>{request.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <User className="h-4 w-4" />
                        <span>{request.requester}</span>
                      </div>
                      {request.department && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Briefcase className="h-4 w-4" />
                          <span>{request.department}</span>
                        </div>
                      )}
                      {request.dueDate && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(request.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Service Request Form Modal */}
      {showForm && (
        <ServiceRequestForm
          onClose={() => setShowForm(false)}
          onSubmit={handleNewRequest}
        />
      )}

      {/* Service Request Details Modal */}
      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdateRequest={(updatedRequest) => {
            console.log('Updated request:', updatedRequest);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}