import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { chatList } from './chatData';

const MessageScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chat = chatList.find(c => c.id === id);
  const [messages, setMessages] = useState(chat ? [
    { id: '1', text: chat.lastMessage, sender: 'user', time: chat.time }
  ] : []);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages(prev => [
      ...prev,
      { id: (prev.length + 1).toString(), text: input, sender: 'me', time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      {/* Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/chats')}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{chat ? chat.name : 'المحادثة'}</Text>
          </View>
        </View>
      </View>
      {/* Conversation Content */}
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.sender === 'me' ? styles.myMessageRow : styles.userMessageRow]}>
              {item.sender === 'user' && chat && (
                <Image source={{ uri: chat.avatar }} style={styles.avatarSmall} />
              )}
              <View style={[styles.messageBubble, item.sender === 'me' ? styles.myBubble : styles.userBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>{item.time}</Text>
              </View>
              {item.sender === 'me' && (
                <FontAwesome5 name="user" size={20} color="#4CAF50" style={{ marginLeft: 8 }} />
              )}
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
        />
        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب رسالة..."
            textAlign="right"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <FontAwesome5 name="paper-plane" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex1: {
    flex: 1,
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  myBubble: {
    backgroundColor: '#e0f7e9',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    textAlign: 'left',
    marginTop: 4,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    marginRight: 0,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginLeft: 8,
    textAlign: 'right',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessageScreen; 