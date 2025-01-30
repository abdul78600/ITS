import React, { useState, useRef } from 'react';
import { 
  X, MessageSquare, Paperclip, Send, Clock, Tag, 
  User, AlertCircle, CheckCircle2, XCircle,
  ChevronRight, Briefcase, ArrowLeft, Upload,
  Download, Lock, CheckCircle, Image, FileText,
  File, FileCode, Shield, Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TicketDetailsProps {
  ticket: any;
  onClose: () => void;
  onUpdateTicket: (updatedTicket: any) => void;
}

interface AttachmentPreview {
  url: string;
  name: string;
  type: string;
  size: number;
}

export function TicketDetails({ 
  ticket, 
  onClose, 
  onUpdateTicket 
}: TicketDetailsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedTicket = {
      ...ticket,
      comments: [
        ...(ticket.comments || []),
        {
          id: crypto.randomUUID(),
          content: newComment.trim(),
          author: user?.name,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    onUpdateTicket(updatedTicket);
    setNewComment('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    const updatedTicket = {
      ...ticket,
      attachments: [...(ticket.attachments || []), ...newAttachments],
      attachmentCount: (ticket.attachments?.length || 0) + files.length,
    };
    onUpdateTicket(updatedTicket);
  };

  const handleCloseTicket = () => {
    if (!closureReason) return;

    const updatedTicket = {
      ...ticket,
      status: 'closed',
      closedAt: new Date().toISOString(),
      closedBy: user?.name,
      closureReason,
      closureNotes,
      comments: [
        ...(ticket.comments || []),
        {
          id: crypto.randomUUID(),
          content: `Ticket closed: ${closureReason}\n${closureNotes}`,
          author: user?.name,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]
    };

    onUpdateTicket(updatedTicket);
    setShowCloseDialog(false);
  };

  const canCloseTicket = () => {
    // Both IT help desk and Head can close tickets
    return user?.department === 'IT' || user?.role === 'head';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('text') || type.includes('code')) return FileCode;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
              Back to Tickets
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              {canCloseTicket() && ticket.status !== 'closed' && (
                <button
                  onClick={() => setShowCloseDialog(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Lock className="h-4 w-4" />
                  Close Ticket
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Ticket #{ticket.id}</span>
              <ChevronRight className="h-4 w-4" />
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          <div className="flex-1 overflow-y-auto border-r border-gray-200">
            <div className="p-6 space-y-6">
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <Paperclip className="h-5 w-5" />
                    <span className="font-medium">
                      Attachments ({ticket.attachments?.length || 0})
                    </span>
                  </button>
                  {ticket.status !== 'closed' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Upload className="h-4 w-4" />
                      Add Files
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </div>
                {showAttachments && ticket.attachments?.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ticket.attachments.map((attachment: AttachmentPreview, index: number) => {
                      const IconComponent = getAttachmentIcon(attachment.type);
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedAttachment(attachment)}
                          className="group cursor-pointer"
                        >
                          {attachment.type.startsWith('image/') ? (
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-blue-500 transition-colors">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 hover:border-blue-500 transition-colors flex flex-col items-center justify-center p-4">
                              <IconComponent className="h-12 w-12 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600 text-center line-clamp-2">
                                {attachment.name}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, '_blank');
                              }}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                { type: 'created', time: ticket.createdAt },
                ...(ticket.comments || []).map((comment: any) => ({
                  type: 'comment',
                  time: comment.createdAt,
                  author: comment.author,
                  systemComment: comment.type === 'system'
                })),
                ...(ticket.status === 'closed' ? [{
                  type: 'closed',
                  time: ticket.closedAt,
                  author: ticket.closedBy
                }] : [])
              ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'created' ? 'bg-blue-100' :
                      activity.type === 'closed' ? 'bg-red-100' :
                      activity.systemComment ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      {activity.type === 'created' ? (
                        <AlertCircle className="h-4 w-4 text-blue-700" />
                      ) : activity.type === 'closed' ? (
                        <Lock className="h-4 w-4 text-red-700" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'created' 
                          ? 'Ticket Created'
                          : activity.type === 'closed'
                          ? `Ticket Closed by ${activity.author}`
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

      {/* Close Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Close Ticket</h3>
              <button
                onClick={() => setShowCloseDialog(false)}
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
                  onClick={() => setShowCloseDialog(false)}
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

      {/* Attachment Preview */}
      {selectedAttachment && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={() => setSelectedAttachment(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = getAttachmentIcon(selectedAttachment.type);
                  return <IconComponent className="h-5 w-5 text-gray-500" />;
                })()}
                <div>
                  <h3 className="font-medium text-gray-900">{selectedAttachment.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedAttachment.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttachment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                {selectedAttachment.type.startsWith('image/') ? (
                  <img
                    src={selectedAttachment.url}
                    alt={selectedAttachment.name}
                    className="max-w-full max-h-[600px] object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    {(() => {
                      const IconComponent = getAttachmentIcon(selectedAttachment.type);
                      return <IconComponent className="h-16 w-16 text-gray-400 mx-auto mb-4" />;
                    })()}
                    <p className="text-gray-600 mb-2">{selectedAttachment.type}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedAttachment.size)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => window.open(selectedAttachment.url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}