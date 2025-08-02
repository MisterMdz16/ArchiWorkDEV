import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Plus, Phone, Video, MoreHorizontal, Send,
  Paperclip, Smile, Image, File, Star, Archive, Trash2, Pin,
  Check, CheckCheck, Clock, Circle, User, Calendar, Filter,
  ChevronDown, X, Download, Eye, Heart, Reply, Forward
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
    lastSeen: string;
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  projectId?: string;
  projectTitle?: string;
  messages: Message[];
}

const Messages: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          {
            id: '1',
            name: 'Sarah Johnson',
            avatar: '/api/placeholder/50/50',
            role: 'Architect',
            isOnline: true,
            lastSeen: 'now'
          },
          {
            id: '2',
            name: 'You',
            avatar: '/api/placeholder/50/50',
            role: 'Client',
            isOnline: true,
            lastSeen: 'now'
          }
        ],
        lastMessage: {
          content: 'I\'ve updated the floor plans based on your feedback. Please review when you have a chance.',
          timestamp: '2024-01-20T10:30:00Z',
          senderId: '1'
        },
        unreadCount: 2,
        isPinned: true,
        isArchived: false,
        projectId: 'proj-1',
        projectTitle: 'Modern Villa Design',
        messages: [
          {
            id: 'msg-1',
            content: 'Hi! I wanted to discuss the latest design revisions for your villa project.',
            timestamp: '2024-01-20T09:00:00Z',
            senderId: '1',
            senderName: 'Sarah Johnson',
            senderAvatar: '/api/placeholder/50/50',
            type: 'text',
            status: 'read'
          },
          {
            id: 'msg-2',
            content: 'Great! I\'ve been looking forward to seeing the updates. What changes did you make?',
            timestamp: '2024-01-20T09:15:00Z',
            senderId: '2',
            senderName: 'You',
            senderAvatar: '/api/placeholder/50/50',
            type: 'text',
            status: 'read'
          },
          {
            id: 'msg-3',
            content: 'I\'ve updated the floor plans based on your feedback. Please review when you have a chance.',
            timestamp: '2024-01-20T10:30:00Z',
            senderId: '1',
            senderName: 'Sarah Johnson',
            senderAvatar: '/api/placeholder/50/50',
            type: 'text',
            status: 'delivered',
            attachments: [
              {
                id: 'att-1',
                name: 'villa-floor-plans-v2.pdf',
                type: 'application/pdf',
                size: 2048000,
                url: '/api/placeholder/file'
              }
            ]
          }
        ]
      },
      {
        id: '2',
        participants: [
          {
            id: '3',
            name: 'Michael Chen',
            avatar: '/api/placeholder/50/50',
            role: 'Designer',
            isOnline: false,
            lastSeen: '2 hours ago'
          }
        ],
        lastMessage: {
          content: 'The 3D renderings are ready for your review.',
          timestamp: '2024-01-19T16:45:00Z',
          senderId: '3'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        projectId: 'proj-2',
        projectTitle: 'Office Complex',
        messages: [
          {
            id: 'msg-4',
            content: 'The 3D renderings are ready for your review.',
            timestamp: '2024-01-19T16:45:00Z',
            senderId: '3',
            senderName: 'Michael Chen',
            senderAvatar: '/api/placeholder/50/50',
            type: 'text',
            status: 'read'
          }
        ]
      },
      {
        id: '3',
        participants: [
          {
            id: '4',
            name: 'Emily Rodriguez',
            avatar: '/api/placeholder/50/50',
            role: 'Interior Designer',
            isOnline: true,
            lastSeen: 'now'
          }
        ],
        lastMessage: {
          content: 'Thank you for choosing our services! Looking forward to working with you.',
          timestamp: '2024-01-18T14:20:00Z',
          senderId: '4'
        },
        unreadCount: 1,
        isPinned: false,
        isArchived: false,
        messages: [
          {
            id: 'msg-5',
            content: 'Thank you for choosing our services! Looking forward to working with you.',
            timestamp: '2024-01-18T14:20:00Z',
            senderId: '4',
            senderName: 'Emily Rodriguez',
            senderAvatar: '/api/placeholder/50/50',
            type: 'text',
            status: 'delivered'
          }
        ]
      }
    ];
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0].id);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: user?.uid || '2',
      senderName: 'You',
      senderAvatar: '/api/placeholder/50/50',
      type: 'text',
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: {
            content: newMessage,
            timestamp: newMsg.timestamp,
            senderId: newMsg.senderId
          }
        };
      }
      return conv;
    }));

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || (conv.projectTitle && conv.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && conv.unreadCount > 0) ||
      (filterType === 'pinned' && conv.isPinned) ||
      (filterType === 'archived' && conv.isArchived);
    
    return matchesSearch && matchesFilter && !conv.isArchived;
  });

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Communicate with clients and designers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      showFilters ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <button className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors duration-200">
                    <Plus className="w-4 h-4" />
                    <span>New</span>
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['all', 'unread', 'pinned', 'archived'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setFilterType(filter)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          filterType === filter
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(p => p.id !== user?.uid);
                  const isSelected = selectedConversation === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        isSelected ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0"></div>
                          {otherParticipant?.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {conversation.isPinned && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Pin className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-sm font-medium truncate ${
                              isSelected ? 'text-indigo-900' : 'text-gray-900'
                            }`}>
                              {otherParticipant?.name || 'Unknown'}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {conversation.projectTitle && (
                            <p className="text-xs text-indigo-600 mb-1 truncate">
                              📁 {conversation.projectTitle}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.content}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {otherParticipant?.role}
                            </span>
                            <div className="flex items-center space-x-1">
                              {otherParticipant?.isOnline ? (
                                <div className="flex items-center space-x-1">
                                  <Circle className="w-2 h-2 text-green-500 fill-current" />
                                  <span className="text-xs text-green-600">Online</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  {otherParticipant?.lastSeen}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                          {currentConversation.participants.find(p => p.id !== user?.uid)?.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {currentConversation.participants.find(p => p.id !== user?.uid)?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {currentConversation.participants.find(p => p.id !== user?.uid)?.role}
                          </p>
                          {currentConversation.projectTitle && (
                            <p className="text-xs text-indigo-600">
                              📁 {currentConversation.projectTitle}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentConversation.messages.map((message) => {
                      const isOwnMessage = message.senderId === user?.uid || message.senderId === '2';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            {message.replyTo && (
                              <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-gray-300">
                                <p className="text-xs text-gray-600 font-medium">{message.replyTo.senderName}</p>
                                <p className="text-sm text-gray-700 truncate">{message.replyTo.content}</p>
                              </div>
                            )}
                            
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                                        isOwnMessage ? 'bg-indigo-500' : 'bg-gray-200'
                                      }`}
                                    >
                                      <File className="w-4 h-4" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{attachment.name}</p>
                                        <p className="text-xs opacity-75">
                                          {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                      </div>
                                      <button className="p-1 hover:bg-black/10 rounded">
                                        <Download className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center mt-1 space-x-1 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              {isOwnMessage && (
                                <div className="flex items-center">
                                  {getMessageStatusIcon(message.status)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {!isOwnMessage && (
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex-shrink-0 order-1 mr-2"></div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <Image className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <Smile className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="relative">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* No Conversation Selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;