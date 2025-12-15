// src/components/Chat.jsx - UPDATED
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { 
  MessageCircle, Send, Search, Users, X, 
  ChevronLeft, Check, CheckCheck, Phone, 
  Video, Info, Paperclip, Smile, MoreVertical,
  Clock, TrendingUp // ADDED THIS IMPORT
} from 'lucide-react';
import axios from 'axios';

const Chat = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);

  // Get auth config function
  const getAuthConfig = () => {
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      fetchConversations();
      updateOnlineStatus(true);

      // Set up interval to check for new messages
      const interval = setInterval(fetchConversations, 10000); // Every 10 seconds
      
      return () => {
        clearInterval(interval);
        updateOnlineStatus(false);
      };
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateOnlineStatus = async (isOnline) => {
    if (!token) return;
    
    try {
      const config = getAuthConfig();
      await axios.put(`${API_URL}/chat/status`, { isOnline }, config);
    } catch (error) {
      console.error('Error updating online status:', error.response?.data || error.message);
    }
  };

  // In Chat.jsx, update fetchConversations function:
const fetchConversations = async () => {
  if (!token) return;
  
  try {
    const config = getAuthConfig();
    
    // Change this from /conversations to /users
    const response = await axios.get(`${API_URL}/chat/users`, config);
    const data = response.data.data || [];
    
    console.log('🔍 Users data:', data);
    
    // Transform users into conversation format
    const transformedData = data.map(user => ({
      userId: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      lastMessage: '', // No messages yet
      lastTimestamp: user.createdAt, // Use creation date as fallback
      unreadCount: 0 // No unread messages yet
    }));
    
    setConversations(transformedData);
    
    // For now, unread count will be 0 since no messages
    setUnreadCount(0);
    
    if (loading) setLoading(false);
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    setLoading(false);
  }
};

  const fetchMessages = async (userId) => {
    if (!token) return;
    
    try {
      const config = getAuthConfig();
      const response = await axios.get(`${API_URL}/chat/messages/${userId}`, config);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !token) return;

    const messageData = {
      receiverId: selectedUser.userId || selectedUser._id,
      content: newMessage
    };

    try {
      const config = getAuthConfig();
      const response = await axios.post(`${API_URL}/chat/send`, messageData, config);
      const newMsg = response.data.data;
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      alert(t('messageSendFailed') || 'Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins}${t('minutesAgo') || 'm ago'}`;
    if (diffHours < 24) return `${diffHours}${t('hoursAgo') || 'h ago'}`;
    if (diffDays < 7) return `${diffDays}${t('daysAgo') || 'd ago'}`;
    return date.toLocaleDateString();
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user.userId || user._id);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.location?.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-primary-green mb-2">Authentication Required</h3>
          <p className="text-natural-brown mb-4">Please log in to access the chat feature.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-primary-green to-green-400 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-natural-brown">{t('loadingChats') || 'Loading chats...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-green mb-4">
          {t('farmerCommunityChat') || 'Farmer Community Chat'}
        </h1>
        <p className="text-xl text-natural-brown">
          {t('connectWithFarmers') || 'Connect with farmers, share tips, and discuss farming practices'}
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-full text-white">
              <MessageCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-green">
                {conversations.length} {t('conversations') || 'Conversations'}
              </h3>
              <p className="text-natural-brown">
                {unreadCount > 0 
                  ? `${unreadCount} ${t('unreadMessages') || 'unread messages'}`
                  : t('allCaughtUp') || 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-green">
                {conversations.filter(c => c.isOnline).length}
              </div>
              <div className="text-sm text-natural-brown">{t('onlineNow') || 'Online Now'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-green">
                {conversations.length}
              </div>
              <div className="text-sm text-natural-brown">{t('totalFarmers') || 'Total Farmers'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className={`${isMobileView && selectedUser ? 'hidden' : 'flex'} flex-col w-full md:w-1/3 border-r`}>
            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('searchFarmers') || 'Search farmers...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">
                    {searchTerm ? t('noResultsFound') || 'No results found' : t('noConversationsYet') || 'No conversations yet'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? t('tryDifferentSearch') || 'Try a different search term' : t('startNewConversation') || 'Start a new conversation with farmers!'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.userId || conv._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedUser?.userId === conv.userId ? 'bg-green-50' : ''
                    }`}
                    onClick={() => handleSelectUser(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {conv.name.charAt(0).toUpperCase()}
                        </div>
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 truncate">{conv.name}</h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(conv.lastTimestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage || t('startConversation') || 'Start conversation'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.location?.district && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {conv.location.district}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${isMobileView && !selectedUser ? 'hidden' : 'flex'} flex-col flex-1`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobileView && (
                      <button 
                        onClick={() => setSelectedUser(null)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                      {selectedUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedUser.isOnline 
                          ? t('online') || 'Online'
                          : `${t('lastSeen') || 'Last seen'} ${formatTime(selectedUser.lastSeen)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser.location?.district && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hidden md:inline">
                        {selectedUser.location.district}
                      </span>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Phone size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Video size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Info size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 h-full flex flex-col items-center justify-center">
                      <MessageCircle size={64} className="mx-auto mb-6 opacity-30" />
                      <h4 className="text-xl font-semibold mb-2">
                        {t('noMessagesYet') || 'No messages yet'}
                      </h4>
                      <p className="mb-6">
                        {t('startConversationWith') || 'Start a conversation with'} {selectedUser.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>{t('messagesAppearHere') || 'Messages will appear here'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {t('conversationStarted') || 'Conversation started'}
                        </span>
                      </div>
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-[70%]">
                            <div className={`rounded-2xl px-4 py-2 ${msg.sender?._id === user?._id 
                              ? 'bg-primary-green text-white rounded-br-none' 
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs opacity-75">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {msg.sender?._id === user?._id && (
                                  <span className="text-xs">
                                    {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Paperclip size={20} className="text-gray-600" />
                    </button>
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('typeMessageHere') || `Message ${selectedUser.name}...`}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
                        rows="2"
                      />
                      <button className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-full">
                        <Smile size={20} className="text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-full flex-shrink-0 ${
                        newMessage.trim()
                          ? 'bg-primary-green text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {t('pressEnterToSend') || 'Press Enter to send, Shift+Enter for new line'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {newMessage.length}/500
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle size={48} className="text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-primary-green mb-3">
                  {t('welcomeToCommunityChat') || 'Welcome to Community Chat'}
                </h3>
                <p className="text-natural-brown mb-8 max-w-md">
                  {t('chatDescription') || 'Select a farmer from the list to start chatting. Share farming tips, discuss market prices, and connect with your farming community.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Users size={20} className="text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('connect') || 'Connect'}</h4>
                    <p className="text-sm text-gray-600">{t('connectDescription') || 'With farmers nearby'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <MessageCircle size={20} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('share') || 'Share'}</h4>
                    <p className="text-sm text-gray-600">{t('shareDescription') || 'Tips and experiences'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <TrendingUp size={20} className="text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('discuss') || 'Discuss'}</h4>
                    <p className="text-sm text-gray-600">{t('discussDescription') || 'Market prices & trends'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-green mb-4">
          {t('chatTips') || 'Chatting Tips for Farmers'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('beRespectful') || 'Be Respectful'}</h4>
              <p className="text-sm text-gray-600">{t('beRespectfulDesc') || 'Always maintain respectful conversations with fellow farmers'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('shareKnowledge') || 'Share Knowledge'}</h4>
              <p className="text-sm text-gray-600">{t('shareKnowledgeDesc') || 'Share your farming experiences and learn from others'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('verifyInfo') || 'Verify Information'}</h4>
              <p className="text-sm text-gray-600">{t('verifyInfoDesc') || 'Always verify market prices and farming advice'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;