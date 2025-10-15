import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser, toggleChatSidebar } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  MessageCircleCode, Send, Search, Menu, X, ChevronLeft,
  Smile, Image, Mic, Heart, Sticker
} from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import {
  setMessages,
  addMessage,
  updateMessageLikes
} from '@/redux/chatSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import EmojiPicker from 'emoji-picker-react';
import StickerPicker from './StickerPicker';

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const { user, suggestedUsers, selectedUser, chatSidebarOpen } = useSelector(store => store.auth);
  const { onlineUsers, messages } = useSelector(store => store.chat);
  const { isDark } = useTheme();
  const dispatch = useDispatch();

  // Détection des tailles d'écran
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  const sendMessageHandler = async (receiverId, type = 'text', content = null, file = null) => {
    let messageToSend = textMessage;
    let formData = new FormData();

    if (type === 'like') {
      messageToSend = '❤️';
    } else if (content) {
      messageToSend = content;
    }

    formData.append('textMessage', messageToSend);
    formData.append('messageType', type);

    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await axios.post(`https://youguybackend.vercel.app:8001/api/v1/message/send/${receiverId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(addMessage(res.data.newMessage));
        if (type === 'text') setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const likeMessageHandler = async (messageId) => {
    try {
      const res = await axios.post(`https://youguybackend.vercel.app:8001/api/v1/message/like/${messageId}`, {}, {
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(updateMessageLikes({ messageId, likes: res.data.likes }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
        sendMessageHandler(selectedUser._id, 'voice', 'Voice message', audioFile);
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendMessageHandler(selectedUser._id, 'image', 'Image', file);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setTextMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleStickerSelect = (sticker) => {
    sendMessageHandler(selectedUser._id, 'sticker', sticker.url);
    setShowStickerPicker(false);
  };

  const sendLike = () => {
    sendMessageHandler(selectedUser._id, 'like');
  };

  // Filter users based on search query
  const filteredUsers = suggestedUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
      if (isRecording) {
        stopRecording();
      }
    }
  }, []);

  // Fermer la sidebar automatiquement sur mobile quand on sélectionne un user
  useEffect(() => {
    if (isMobile && selectedUser) {
      dispatch(toggleChatSidebar(false));
    }
  }, [selectedUser, isMobile, dispatch]);

  const handleKeyPress = (e, receiverId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler(receiverId);
    }
  };

  const toggleSidebar = () => {
    dispatch(toggleChatSidebar(!chatSidebarOpen));
  };

  const handleBackToContacts = () => {
    dispatch(setSelectedUser(null));
    if (isMobile) {
      dispatch(toggleChatSidebar(true));
    }
  };

  // Classes conditionnelles pour le thème
  const themeClass = isDark ? 'dark' : 'light';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-black';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-300';
  const inputBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const hoverClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const selectedClass = isDark ? 'bg-gray-700' : 'bg-blue-50';
  const placeholderClass = isDark ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const secondaryTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const iconClass = isDark ? 'text-gray-600' : 'text-gray-300';

  return (
    <div className={`flex flex-col md:flex-row h-screen ${bgClass} ${textClass}`}>
      {/* Overlay pour mobile quand la sidebar est ouverte */}
      {isMobile && chatSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => dispatch(toggleChatSidebar(false))}
        />
      )}

      {/* Section Contacts/Conversations */}
      <section className={`
        w-full md:w-1/3 lg:w-1/4 border-r ${borderClass} ${bgClass}
        fixed md:relative top-0 left-0 z-50 h-full md:h-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobile ? (chatSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
      `}>
        <div className={`p-4 border-b ${borderClass} flex items-center justify-between`}>
          <h1 className='font-bold text-xl'>{user?.username}</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => dispatch(toggleChatSidebar(false))}>
              <X size={20} />
            </Button>
          )}
        </div>

        <div className={`p-4 border-b ${borderClass}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${inputBgClass} ${borderClass} ${textClass} ${placeholderClass}`}
            />
          </div>
        </div>

        <div className='overflow-y-auto h-[calc(100vh-130px)]'>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((suggestedUser) => {
              const isOnline = onlineUsers.includes(suggestedUser?._id);
              const unreadCount = 0; // À implémenter selon votre logique métier

              return (
                <div
                  key={suggestedUser._id}
                  onClick={() => dispatch(setSelectedUser(suggestedUser))}
                  className={`flex gap-3 items-center p-4 cursor-pointer transition-colors ${selectedUser?._id === suggestedUser._id
                      ? selectedClass
                      : hoverClass
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className='w-12 h-12'>
                      <AvatarImage src={suggestedUser?.profilePicture} />
                      <AvatarFallback className={isDark ? 'bg-gray-700' : 'bg-gray-200'}>
                        {suggestedUser?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${isDark ? 'border-gray-900' : 'border-white'} ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                  </div>
                  <div className='flex flex-col flex-1 min-w-0'>
                    <div className="flex justify-between items-center">
                      <span className='font-medium truncate'>{suggestedUser?.username}</span>
                      {unreadCount > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white`}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isOnline ? 'text-green-500' : secondaryTextClass}`}>
                      {isOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className={`p-4 text-center ${secondaryTextClass}`}>
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </section>

      {/* Section de chat principale */}
      {selectedUser ? (
        <section className={`flex-1 flex flex-col h-full ${bgClass} w-full relative`}>
          {/* En-tête de conversation avec bouton retour sur mobile */}
          <div className={`flex items-center px-4 py-3 border-b ${borderClass} ${bgClass} sticky top-0 z-10`}>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleBackToContacts}
              >
                <ChevronLeft size={20} />
              </Button>
            )}
            <Avatar className="mr-3">
              <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
              <AvatarFallback className={isDark ? 'bg-gray-700' : 'bg-gray-200'}>
                {selectedUser?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1'>
              <span className="font-medium">{selectedUser?.username}</span>
              <span className={`text-xs ${onlineUsers.includes(selectedUser._id) ? 'text-green-500' : secondaryTextClass
                }`}>
                {onlineUsers.includes(selectedUser._id) ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu size={20} />
              </Button>
            )}
          </div>

          <Messages selectedUser={selectedUser} onLikeMessage={likeMessageHandler} />

          {/* Enregistrement vocal en cours */}
          {isRecording && (
            <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'} bg-opacity-90 z-20`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="text-white" size={24} />
                </div>
                <p className="text-lg font-medium">Enregistrement en cours...</p>
                <p className="text-sm">{recordingTime}s</p>
                <Button
                  onClick={stopRecording}
                  className="mt-4 bg-red-500 hover:bg-red-600"
                >
                  Arrêter
                </Button>
              </div>
            </div>
          )}

          {/* Pickers d'emojis et stickers */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
          )}

          {showStickerPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <StickerPicker onSelectSticker={handleStickerSelect} />
            </div>
          )}

          <div className={`flex items-center p-4 border-t ${borderClass} ${bgClass} sticky bottom-0`}>
            <div className="flex items-center mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="mr-1"
              >
                <Smile size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="mr-1"
              >
                <Image size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className="mr-1"
              >
                <Sticker size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className="mr-1"
              >
                <Mic size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={sendLike}
              >
                <Heart size={18} className="text-red-500" />
              </Button>
            </div>

            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, selectedUser._id)}
              type="text"
              className={`flex-1 mr-2 focus-visible:ring-transparent ${inputBgClass} ${borderClass} ${textClass} ${placeholderClass}`}
              placeholder="Écrivez un message..."
            />

            <Button
              onClick={() => sendMessageHandler(selectedUser._id)}
              disabled={!textMessage.trim()}
              className="px-3 py-2"
              size="icon"
            >
              <Send size={18} />
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </section>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center p-4 ${bgClass} w-full`}>
          {/* Bouton pour ouvrir la sidebar sur mobile quand aucun user sélectionné */}
          {isMobile && (
            <Button
              className="absolute top-4 left-4 md:hidden"
              variant="outline"
              size="icon"
              onClick={() => dispatch(toggleChatSidebar(true))}
            >
              <Menu size={20} />
            </Button>
          )}

          <MessageCircleCode className={`w-24 h-24 my-4 ${iconClass}`} />
          <h1 className='font-medium text-lg mb-2 text-center'>Vos messages</h1>
          <span className={`text-center ${secondaryTextClass} max-w-md`}>
            Envoyez un message pour commencer une conversation.
          </span>

          {isMobile && filteredUsers.length > 0 && (
            <Button
              className="mt-6"
              onClick={() => dispatch(toggleChatSidebar(true))}
            >
              Voir mes conversations
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatPage