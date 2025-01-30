import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Clock,
  Shield,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ApprovalDetailsProps {
  request: any;
  onClose: () => void;
  onUpdateRequest: (updatedRequest: any) => void;
}

export function ApprovalDetails({
  request,
  onClose,
  onUpdateRequest
}: ApprovalDetailsProps) {
  const { user } = useAuth();
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const currentApprovalStep = request.approvalHierarchy[request.currentApprovalLevel - 1];
  
  const canApprove = () => {
    if (!currentApprovalStep) return false;
    
    // Special handling for CEO
    if (currentApprovalStep.role === 'ceo' && user?.role === 'head' && user?.department === 'Management') {
      return true;
    }

    // Special handling for Director Operations
    if (currentApprovalStep.role === 'director' && user?.role === 'head' && user?.department === 'Operations') {
      return true;
    }

    // IT Department special handling
    if (currentApprovalStep.department === 'IT' && user?.department === 'IT') {
      return true;
    }

    return (
      user?.role === currentApprovalStep.role &&
      user?.department === currentApprovalStep.department
    );
  };

  const handleApprove = () => {
    const updatedRequest = {
      ...request,
      approvalHistory: [
        ...(request.approvalHistory || []),
        {
          level: request.currentApprovalLevel,
          action: 'approved',
          by: user?.name,
          department: user?.department,
          note: approvalNote,
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Special handling for IT Department level
    if (request.currentApprovalLevel === 4) {
      // Add inventory check result to the approval note
      updatedRequest.approvalHistory[updatedRequest.approvalHistory.length - 1].inventoryCheck = {
        result: 'checked',
        note: approvalNote
      };
    }

    // If this was the last approval level
    if (request.currentApprovalLevel === request.approvalHierarchy.length) {
      updatedRequest.status = 'approved';
    } else {
      updatedRequest.currentApprovalLevel += 1;
    }

    onUpdateRequest(updatedRequest);
  };

  const handleReject = () => {
    if (!rejectionReason) return;

    const updatedRequest = {
      ...request,
      status: 'rejected',
      approvalHistory: [
        ...(request.approvalHistory || []),
        {
          level: request.currentApprovalLevel,
          action: 'rejected',
          by: user?.name,
          department: user?.department,
          reason: rejectionReason,
          timestamp: new Date().toISOString()
        }
      ]
    };

    onUpdateRequest(updatedRequest);
    setShowRejectDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Approval Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600">Review and manage approval workflow</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Request Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Request ID</span>
                <p className="font-medium">{request.id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p className="font-medium capitalize">{request.status}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Requested By</span>
                <p className="font-medium">{request.createdBy}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Department</span>
                <p className="font-medium">{request.department}</p>
              </div>
            </div>
          </div>

          {/* Approval Steps */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Approval Workflow</h3>
            <div className="space-y-4">
              {request.approvalHierarchy.map((step: any, index: number) => {
                const isCurrentStep = index + 1 === request.currentApprovalLevel;
                const isPending = index + 1 >= request.currentApprovalLevel;
                const approval = request.approvalHistory?.find((h: any) => h.level === index + 1);

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                      isCurrentStep ? 'bg-blue-50 border border-blue-100' :
                      isPending ? 'bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      approval?.action === 'approved' ? 'bg-green-100' :
                      approval?.action === 'rejected' ? 'bg-red-100' :
                      isCurrentStep ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {approval?.action === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : approval?.action === 'rejected' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            Level {index + 1}: {step.title}
                          </span>
                          {isCurrentStep && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        {approval && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            approval.action === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {approval.action}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building2 className="h-4 w-4" />
                        <span>{step.department}</span>
                      </div>

                      {approval && (
                        <div className="bg-white rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{approval.by}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{new Date(approval.timestamp).toLocaleString()}</span>
                          </div>
                          {approval.note && (
                            <p className="text-sm text-gray-600">{approval.note}</p>
                          )}
                          {approval.reason && (
                            <div className="bg-red-50 text-red-800 p-2 rounded">
                              <p className="text-sm">{approval.reason}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special handling for IT Department level */}
                      {step.level === 4 && isCurrentStep && canApprove() && (
                        <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800 mb-2">
                            Please verify:
                            <br />1. Check if item exists in inventory
                            <br />2. If not, proceed with vendor selection
                          </p>
                          <textarea
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Add inventory check results and notes"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            required
                          />
                        </div>
                      )}

                      {isCurrentStep && canApprove() && (
                        <div className="mt-4 space-y-4">
                          <textarea
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Add approval notes (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleApprove}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectDialog(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
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
                  disabled={!rejectionReason.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
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