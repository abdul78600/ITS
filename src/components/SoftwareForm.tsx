import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertCircle, X, Search, User, Package, Building2, Calendar, Key, Globe, DollarSign, Users, Mail, Phone, Link, MessageSquare, CreditCard, FileText, Settings, Clock, CheckCircle, Monitor, Cloud, Shield, Smartphone, Wrench, Receipt, CreditCard as Card, Check as BankCheck, Building, FileCheck, Tag, FileCode, HelpCircle, HeadphonesIcon, HardDrive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Sample employees data
const employees = [
  { id: 'emp1', name: 'John Smith', department: 'IT', email: 'john.smith@example.com' },
  { id: 'emp2', name: 'Sarah Johnson', department: 'Marketing', email: 'sarah.j@example.com' },
  { id: 'emp3', name: 'Michael Brown', department: 'Finance', email: 'michael.b@example.com' },
  { id: 'emp4', name: 'Emily Davis', department: 'HR', email: 'emily.d@example.com' },
  { id: 'emp5', name: 'David Wilson', department: 'Operations', email: 'david.w@example.com' }
];

interface SoftwareFormProps {
  onClose: () => void;
  onSubmit: (software: any) => void;
}

export function SoftwareForm({ onClose, onSubmit }: SoftwareFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    version: '',
    type: '',
    licenseKey: '',
    purchaseDate: '',
    expiryDate: '',
    department: user?.department || '',
    cost: '',
    seats: '',
    notes: '',
    platform: [] as string[],
    installationType: 'standalone',
    systemRequirements: {
      os: '',
      processor: '',
      ram: '',
      storage: ''
    },
    support: {
      level: '',
      hours: '',
      contact: '',
      email: '',
      phone: ''
    },
    contract: {
      number: '',
      accountManager: ''
    },
    assignedTo: [] as typeof employees,
    billing: {
      type: 'perpetual',
      billingCycle: 'monthly',
      amount: '',
      currency: 'USD',
      autoRenewal: false,
      paymentMethod: '',
      poNumber: ''
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    const filtered = employees.filter(emp => 
      !formData.assignedTo.some(assigned => assigned.id === emp.id) && // Exclude already assigned
      (emp.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase()) ||
       emp.department.toLowerCase().includes(assigneeSearchQuery.toLowerCase()) ||
       emp.email.toLowerCase().includes(assigneeSearchQuery.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [assigneeSearchQuery, formData.assignedTo]);

  const addAssignee = (employee: typeof employees[0]) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: [...prev.assignedTo, employee]
    }));
    setAssigneeSearchQuery('');
    setShowAssigneeSearch(false);
  };

  const removeAssignee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(emp => emp.id !== employeeId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.name || !formData.vendor || !formData.version || !formData.type) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.billing.type === 'subscription' && !formData.billing.billingCycle) {
        throw new Error('Please select a billing cycle for subscription');
      }

      onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create software');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Software</h2>
              <p className="text-gray-600">Add new software license information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Package className="h-4 w-4" />
                <span>Software Name *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Platform Support */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Support
              </label>
              <div className="space-y-2">
                {['Windows', 'Mac', 'Linux', 'Web'].map(platform => (
                  <label key={platform} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.platform.includes(platform)}
                      onChange={(e) => {
                        const platforms = e.target.checked
                          ? [...formData.platform, platform]
                          : formData.platform.filter(p => p !== platform);
                        setFormData(prev => ({ ...prev, platform: platforms }));
                      }}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Installation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation Type
              </label>
              <select
                value={formData.installationType}
                onChange={(e) => setFormData(prev => ({ ...prev, installationType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="standalone">Standalone</option>
                <option value="client-server">Client-Server</option>
                <option value="web-based">Web-Based</option>
                <option value="cloud">Cloud Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">System Requirements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating System
              </label>
              <input
                type="text"
                value={formData.systemRequirements.os}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  systemRequirements: { ...prev.systemRequirements, os: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Windows 10 or later"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processor
              </label>
              <input
                type="text"
                value={formData.systemRequirements.processor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  systemRequirements: { ...prev.systemRequirements, processor: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Intel Core i5 or equivalent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RAM
              </label>
              <input
                type="text"
                value={formData.systemRequirements.ram}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  systemRequirements: { ...prev.systemRequirements, ram: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8GB minimum"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage
              </label>
              <input
                type="text"
                value={formData.systemRequirements.storage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  systemRequirements: { ...prev.systemRequirements, storage: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10GB free space"
              />
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HeadphonesIcon className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Support Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Level
              </label>
              <select
                value={formData.support.level}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  support: { ...prev.support, level: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Level</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Hours
              </label>
              <input
                type="text"
                value={formData.support.hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  support: { ...prev.support, hours: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 24/7 or 9AM-5PM EST"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Contact
              </label>
              <input
                type="text"
                value={formData.support.contact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  support: { ...prev.support, contact: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={formData.support.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  support: { ...prev.support, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Contract Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Number
              </label>
              <input
                type="text"
                value={formData.contract.number}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contract: { ...prev.contract, number: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contract reference number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Manager
              </label>
              <input
                type="text"
                value={formData.contract.accountManager}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contract: { ...prev.contract, accountManager: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Account manager name"
              />
            </div>
          </div>
        </div>

        {/* Assignment Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">License Assignment</h3>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={assigneeSearchQuery}
                onChange={(e) => {
                  setAssigneeSearchQuery(e.target.value);
                  setShowAssigneeSearch(true);
                }}
                onFocus={() => setShowAssigneeSearch(true)}
                placeholder="Search employees to assign license..."
                className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              {/* Dropdown for search results */}
              {showAssigneeSearch && (
                <div
                  ref={searchDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(employee => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => addAssignee(employee)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <div className="p-1 bg-gray-100 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.department} • {employee.email}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No employees found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Assignees */}
            {formData.assignedTo.length > 0 && (
              <div className="space-y-2">
                {formData.assignedTo.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.department} • {employee.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAssignee(employee.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200"
          >
            <Save className="h-5 w-5" />
            <span>Save Software</span>
          </button>
        </div>
      </form>
    </div>
  );
}