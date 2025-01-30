import React, { useState, useEffect, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { 
  Search,
  Filter,
  Plus,
  MessageSquare,
  Clock,
  Tag,
  User,
  Calendar,
  ChevronRight,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  ArrowUpRight,
  BarChart2,
  TrendingUp,
  Users,
  ThumbsUp,
  Clock8,
  CheckCircle,
  AlertTriangle,
  BarChart,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  Inbox,
  FileText,
  Layers,
  Settings,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Share2,
  UserPlus,
  X,
  Lock,
  Send,
  Briefcase
} from 'lucide-react';
import { TicketForm } from './TicketForm';
import { KnowledgeBase } from './KnowledgeBase';
import { useAuth } from '../contexts/AuthContext';

interface ServiceDeskProps {
  view: string;
  onViewChange: (view: string) => void;
}

const sampleUsers = [
  {
    id: 'USR001',
    name: 'John Smith',
    role: 'IT Support',
    email: 'john.smith@example.com'
  },
  {
    id: 'USR002', 
    name: 'Sarah Johnson',
    role: 'Network Admin',
    email: 'sarah.j@example.com'
  }
];

export function ServiceDesk({ view, onViewChange }: ServiceDeskProps) {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [newComment, setNewComment] = useState('');
  const [showReferDialog, setShowReferDialog] = useState(false);
  const [referToUser, setReferToUser] = useState<any | null>(null);
  const [referNote, setReferNote] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const [closureNotes, setClosureNotes] = useState('');

  // Load tickets from localStorage on component mount
  const [tickets, setTickets] = useState<any[]>(() => {
    const savedTickets = localStorage.getItem('tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleNewTicket = (ticketData: any) => {
    const newTicket = {
      id: `T-${1000 + tickets.length + 1}`,
      ...ticketData,
      status: 'open',
      createdAt: new Date().toISOString(),
      referredTo: null,
      referredBy: null
    };

    setTickets(prev => [newTicket, ...prev]);
    onViewChange('tickets');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      comments: [
        ...(selectedTicket.comments || []),
        {
          id: crypto.randomUUID(),
          content: newComment.trim(),
          author: user?.name,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    unstable_batchedUpdates(() => {
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setNewComment('');
    });
  };

  const handleCloseTicket = () => {
    if (!selectedTicket || !closureReason) return;

    const updatedTicket = {
      ...selectedTicket,
      status: 'closed',
      closedAt: new Date().toISOString(),
      closedBy: user?.name,
      closureReason,
      closureNotes,
      comments: [
        ...(selectedTicket.comments || []),
        {
          id: crypto.randomUUID(),
          content: `Ticket closed: ${closureReason}\n${closureNotes}`,
          author: user?.name,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]
    };

    setSelectedTicket(updatedTicket);
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setShowCloseDialog(false);
    setClosureReason('');
    setClosureNotes('');
  };

  const handleReferTicket = () => {
    if (!selectedTicket || !referToUser || !referNote.trim()) return;

    const updatedTicket = {
      ...selectedTicket,
      referredTo: referToUser,
      referredBy: user,
      status: 'referred',
      comments: [
        ...(selectedTicket.comments || []),
        {
          id: crypto.randomUUID(),
          content: `Ticket referred to ${referToUser.name}\nNote: ${referNote}`,
          author: user?.name,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]
    };

    setSelectedTicket(updatedTicket);
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setShowReferDialog(false);
    setReferToUser(null);
    setReferNote('');
  };

  const canEditTicket = (ticket: any) => {
    if (ticket.createdBy === user?.name) return true;
    
    if (ticket.referredTo) {
      return ticket.referredTo.id === user?.id;
    }
    
    if (user?.department === 'IT') return true;
    
    if (user?.role === 'head') return true;
    
    return false;
  };

  const canCloseTicket = (ticket: any) => {
    if (ticket.createdBy === user?.name) return true;
    
    if (user?.department === 'IT' || user?.role === 'head') return true;
    
    return false;
  };

  const canReferTicket = (ticket: any) => {
    return user?.department === 'IT' || user?.role === 'head';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'referred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Head users can see all tickets
      if (user?.role === 'head') return true;
      
      // IT department can see all tickets
      if (user?.department === 'IT') return true;
      
      // Users can see tickets they created
      if (ticket.createdBy === user?.name) return true;
      
      // Users can see tickets referred to them
      if (ticket.referredTo?.id === user?.id) return true;
      
      // Users can see tickets from their department if they are managers
      if (user?.role === 'manager' && ticket.department === user?.department) return true;
      
      // Filter by status if selected
      if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false;
      
      // Filter by priority if selected
      if (selectedPriority !== 'all' && ticket.priority !== selectedPriority) return false;
      
      // Filter by category if selected
      if (selectedCategory !== 'all' && ticket.category !== selectedCategory) return false;
      
      // Filter by department if selected
      if (selectedDepartment !== 'all' && ticket.department !== selectedDepartment) return false;
      
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.category.toLowerCase().includes(search) ||
          ticket.createdBy?.toLowerCase().includes(search) ||
          ticket.department?.toLowerCase().includes(search) ||
          ticket.id.toLowerCase().includes(search)
        );
      }
      
      return false;
    });
  }, [tickets, user, selectedStatus, selectedPriority, selectedCategory, selectedDepartment, searchQuery]);

  // Handle different views
  if (view === 'create-ticket') {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
                <p className="text-gray-600">Submit a new support ticket</p>
              </div>
              <button
                onClick={() => onViewChange('service-desk')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Service Desk
              </button>
            </div>
          </div>
          <TicketForm
            onClose={() => onViewChange('service-desk')}
            onSubmit={handleNewTicket}
          />
        </div>
      </div>
    );
  }

  // Knowledge Base View
  if (view === 'knowledge-base') {
    return <KnowledgeBase />;
  }

  // Default view - Tickets List
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage and track all support tickets</p>
          </div>
          <button 
            onClick={() => onViewChange('create-ticket')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Ticket
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, title, description, category, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="referred">Referred</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="network">Network</option>
              <option value="email">Email</option>
              <option value="access">Access</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="space-y-4">
            {/* Ticket Header - Always visible */}
            <div
              onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{ticket.id}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                    {ticket.referredTo && (
                      <div className="flex items-center gap-1 text-purple-500">
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">
                          Referred to {ticket.referredTo.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTicket?.id === ticket.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Tag className="h-4 w-4" />
                    <span>{ticket.category}</span>
                  </div>
                  {ticket.department && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Briefcase className="h-4 w-4" />
                      <span>{ticket.department}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details - Shown when selected */}
            {selectedTicket?.id === ticket.id && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  {canReferTicket(ticket) && ticket.status !== 'closed' && !ticket.referredTo && (
                    <button
                      onClick={() => setShowReferDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Share2 className="h-4 w-4" />
                      Refer Ticket
                    </button>
                  )}

                  {canCloseTicket(ticket) && ticket.status !== 'closed' && (
                    <button
                      onClick={() => setShowCloseDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Lock className="h-4 w-4" />
                      Close Ticket
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="h-4 w-4 text-gray-700" />
                      <span className="font-medium">{ticket.category}</span>
                    </div>
                  </div>
                  {ticket.createdBy && (
                    <div>
                      <span className="text-sm text-gray-500">Created By</span>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">{ticket.createdBy}</span>
                      </div>
                    </div>
                  )}
                  {ticket.department && (
                    <div>
                      <span className="text-sm text-gray-500">Department</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">{ticket.department}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Created At</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-700" />
                      <span className="font-medium">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  <div className="space-y-4">
                    {ticket.comments?.map((comment: any, index: number) => (
                      <div 
                        key={index} 
                        className={`rounded-lg p-4 ${
                          comment.type === 'system' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {comment.author || 'Anonymous'}
                            </span>
                            {comment.type === 'system' && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                System
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== 'closed' && (
                    <div className="mt-4">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-4 py-3 text-gray-700 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex items-center justify-between p-4 bg-gray-50">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MessageSquare className="h-4 w-4" />
                            <span>Press Enter to submit</span>
                          </div>
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="h-4 w-4" />
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Close Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Close Ticket</h3>
              <button
                onClick={() => {
                  setShowCloseDialog(false);
                  setClosureReason('');
                  setClosureNotes('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Closure *
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="resolved">Issue Resolved</option>
                  <option value="duplicate">Duplicate Ticket</option>
                  <option value="not-reproducible">Cannot Reproduce</option>
                  <option value="no-response">No Response from User</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closure Notes
                </label>
                <textarea
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add any additional notes about the ticket closure..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCloseDialog(false);
                    setClosureReason('');
                    setClosureNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={!closureReason}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refer Dialog */}
      {showReferDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Refer Ticket</h3>
              <button
                onClick={() => {
                  setShowReferDialog(false);
                  setReferToUser(null);
                  setReferNote('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refer To *
                </label>
                <select
                  value={referToUser?.id || ''}
                  onChange={(e) => {
                    const selected = sampleUsers.find(u => u.id === e.target.value);
                    setReferToUser(selected || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select team member</option>
                  {sampleUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              {referToUser && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{referToUser.name}</h4>
                      <p className="text-sm text-gray-500">{referToUser.role}</p>
                      <p className="text-sm text-gray-500">{referToUser.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Note *
                </label>
                <textarea
                  value={referNote}
                  onChange={(e) => setReferNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add a note explaining why you're referring this ticket..."
                  required
                />
              </div>

              <div className=" flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReferDialog(false);
                    setReferToUser(null);
                    setReferNote('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReferTicket}
                  disabled={!referToUser || !referNote.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-4 w-4" />
                  Refer Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}