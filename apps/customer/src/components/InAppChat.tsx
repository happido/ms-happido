import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSelf: boolean;
}

interface InAppChatProps {
  socket: Socket | null;
  rideId: string;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export const InAppChat: React.FC<InAppChatProps> = ({ socket, rideId, currentUserId, otherUserName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (socket) {
      socket.emit('joinChatRoom', rideId);

      socket.on('receiveChatMessage', (msg) => {
        setMessages((prev) => [
          ...prev, 
          { id: Math.random().toString(), senderId: msg.senderId, text: msg.text, timestamp: new Date(msg.timestamp), isSelf: false }
        ]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveChatMessage');
      }
    };
  }, [socket, rideId]);

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;
    
    const newMsg = {
      rideId,
      senderId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit('sendChatMessage', newMsg);
    
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(), senderId: currentUserId, text: newMsg.text, timestamp: new Date(newMsg.timestamp), isSelf: true }
    ]);
    
    setInputText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.chatBox, { transform: [{ translateY: slideAnim }] }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with {otherUserName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>Say hi to {otherUserName}!</Text>
          ) : (
            messages.map((msg) => (
              <View key={msg.id} style={[styles.messageBubble, msg.isSelf ? styles.selfBubble : styles.otherBubble]}>
                <Text style={[styles.messageText, msg.isSelf ? styles.selfText : styles.otherText]}>{msg.text}</Text>
                <Text style={[styles.timeText, msg.isSelf ? styles.selfTime : styles.otherTime]}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999,
  },
  chatBox: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    backgroundColor: '#0F172A',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontStyle: 'italic',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  selfBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  selfText: {
    color: '#FFF',
  },
  otherText: {
    color: '#334155',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  selfTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    color: '#94A3B8',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#EA580C',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
