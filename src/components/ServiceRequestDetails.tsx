import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, Clock, Tag, 
  User, AlertCircle, CheckCircle2, XCircle,
  ChevronRight, Briefcase, ArrowLeft,
  Lock, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ServiceRequestDetailsProps {
  request: any;
  onClose: () => void;
  onUpdateRequest: (updatedRequest: any) => void;
}

export function ServiceRequestDetails({ 
  request, 
  onClose, 
  onUpdateRequest 
}: ServiceRequestDetailsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedRequest = {
      ...request,
      comments: [
        ...(request.comments || []),
        {
          id: crypto.randomUUID(),
          content: newComment,
          author: user?.name,
          createdAt: new Date().toISOString()
        }
      ]
    };

    onUpdateRequest(updatedRequest);
    setNewComment('');
  };

  const handleApprove = () => {
    const updatedRequest = {
      ...request,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user?.name,
      approvalChain: request.approvalChain.map((chain: any) => 
        chain.approver === user?.name 
          ? { ...chain, status: 'approved', date: new Date().toISOString() }
          : chain
      ),
      comments: [
        ...(request.comments || []),
        {
          id: crypto.randomUUID(),
          content: 'Request approved',
          author: user?.name,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]
    };

    onUpdateRequest(updatedRequest);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    const updatedRequest = {
      ...request,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: user?.name,
      approvalChain: request.approvalChain.map((chain: any) => 
        chain.approver === user?.name 
          ? { ...chain, status: 'rejected', date: new Date().toISOString() }
          : chain
      ),
      comments: [
        ...(request.comments || []),
        {
          id: crypto.randomUUID(),
          content: `Request rejected: ${rejectReason}`,
          author: user?.name,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]
    };

    onUpdateRequest(updatedRequest);
    setShowRejectDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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

  const canApprove = request.approvalChain?.some((chain: any) => 
    chain.approver === user?.name && chain.status === 'pending'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Requests
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
              {canApprove && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectDialog(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Request #{request.id}</span>
              <ChevronRight className="h-4 w-4" />
              <span>{new Date(request.createdAt).toLocaleString()}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{request.title}</h2>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          <div className="flex-1 overflow-y-auto border-r border-gray-200">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-4 w-4 text-gray-700" />
                    <span className="font-medium">{request.type}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Requester</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-700" />
                    <span className="font-medium">{request.requester}</span>
                  </div>
                </div>
                {request.department && (
                  <div>
                    <span className="text-sm text-gray-500">Department</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-gray-700" />
                      <span className="font-medium">{request.department}</span>
                    </div>
                  </div>
                )}
                {request.dueDate && (
                  <div>
                    <span className="text-sm text-gray-500">Due Date</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-700" />
                      <span className="font-medium">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Chain */}
              {request.approvalChain && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Approval Chain</h3>
                  <div className="space-y-4">
                    {request.approvalChain.map((approval: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            approval.status === 'approved' ? 'bg-green-100' :
                            approval.status === 'rejected' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            <Shield className={`h-5 w-5 ${
                              approval.status === 'approved' ? 'text-green-700' :
                              approval.status === 'rejected' ? 'text-red-700' :
                              'text-yellow-700'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Level {approval.level}: {approval.approver}
                            </p>
                            {approval.date && (
                              <p className="text-sm text-gray-500">
                                {new Date(approval.date).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                          approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {approval.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <div className="space-y-4">
                  {request.comments?.map((comment: any, index: number) => (
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

                {request.status !== 'rejected' && request.status !== 'completed' && (
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
                )}
              </div>
            </div>
          </div>

          <div className="w-80 p-6 bg-gray-50 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {[
                { type: 'created', time: request.createdAt },
                ...(request.comments || []).map((comment: any) => ({
                  type: 'comment',
                  time: comment.createdAt,
                  author: comment.author,
                  systemComment: comment.type === 'system'
                })),
                ...(request.status === 'approved' ? [{
                  type: 'approved',
                  time: request.approvedAt,
                  author: request.approvedBy
                }] : []),
                ...(request.status === 'rejected' ? [{
                  type: 'rejected',
                  time: request.rejectedAt,
                  author: request.rejectedBy
                }] : [])
              ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'created' ? 'bg-blue-100' :
                      activity.type === 'approved' ? 'bg-green-100' :
                      activity.type === 'rejected' ? 'bg-red-100' :
                      activity.systemComment ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'created' ? (
                        <AlertCircle className="h-4 w-4 text-blue-700" />
                      ) : activity.type === 'approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                      ) : activity.type === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-700" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'created' 
                          ? 'Request Created'
                          : activity.type === 'approved'
                          ? `Request Approved by ${activity.author}`
                          : activity.type === 'rejected'
                          ? `Request Rejected by ${activity.author}`
                          : `Comment by ${activity.author}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
              <button
                onClick={() => setShowRejectDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please provide a reason for rejecting this request..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}