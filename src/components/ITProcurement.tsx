import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileText,
  DollarSign,
  Clock,
  Tag,
  User,
  Building2,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DemandRaiseForm } from './DemandRaiseForm';
import { ApprovalDetails } from './ApprovalDetails';

export function ITProcurement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showApprovalDetails, setShowApprovalDetails] = useState(false);

  // Load requests from localStorage on component mount
  useEffect(() => {
    const storedRequests = localStorage.getItem('procurementRequests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    }
  }, []);

  const handleNewRequest = (requestData: any) => {
    // Add the request to the list
    const newRequests = [requestData, ...requests];
    setRequests(newRequests);
    localStorage.setItem('procurementRequests', JSON.stringify(newRequests));
    setShowForm(false);
  };

  const handleUpdateRequest = (updatedRequest: any) => {
    const newRequests = requests.map(req => 
      req.id === updatedRequest.id ? updatedRequest : req
    );
    setRequests(newRequests);
    localStorage.setItem('procurementRequests', JSON.stringify(newRequests));
    setShowApprovalDetails(false);
    setSelectedRequest(null);
  };

  const handleViewApprovals = (request: any) => {
    setSelectedRequest(request);
    setShowApprovalDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (selectedStatus !== 'all' && request.status !== selectedStatus) return false;
    if (selectedType !== 'all' && request.type !== selectedType) return false;
    if (selectedDepartment !== 'all' && request.department !== selectedDepartment) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        request.title.toLowerCase().includes(search) ||
        request.description.toLowerCase().includes(search) ||
        request.id.toLowerCase().includes(search)
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
            <h1 className="text-2xl font-bold text-gray-900">IT Procurement</h1>
            <p className="text-gray-600">Manage procurement requests and approvals</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Raise Demand
          </button>
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
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="services">Services</option>
              <option value="supplies">Supplies</option>
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{request.id}</span>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Tag className="h-4 w-4" />
                  <span>{request.type}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>{request.department}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <User className="h-4 w-4" />
                  <span>{request.createdBy}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
                {request.requiredBy && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Required by: {new Date(request.requiredBy).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-900">
                      ₨{parseFloat(request.budget).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewApprovals(request)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    View Approvals
                  </button>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demand Raise Form */}
      {showForm && (
        <DemandRaiseForm
          onClose={() => setShowForm(false)}
          onSubmit={handleNewRequest}
        />
      )}

      {/* Approval Details */}
      {showApprovalDetails && selectedRequest && (
        <ApprovalDetails
          request={selectedRequest}
          onClose={() => {
            setShowApprovalDetails(false);
            setSelectedRequest(null);
          }}
          onUpdateRequest={handleUpdateRequest}
        />
      )}
    </div>
  );
}