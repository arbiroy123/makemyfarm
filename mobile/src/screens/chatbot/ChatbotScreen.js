import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatbotAPI } from '../../api/client';

const COUNTRY = 'IN'; // Change to 'US' for US-focused defaults

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: COUNTRY === 'IN'
        ? 'नमस्ते! मैं KisanBot हूं — आपका कृषि सहायक। फसल, मिट्टी, कीट, सरकारी योजनाओं — किसी भी विषय पर पूछें!\n\nHello! I am KisanBot, your agricultural advisor. Ask me anything about crops, soil, pests, or government schemes!'
        : 'Hello! I\'m KisanBot, your agricultural advisor. Ask me anything about crops, soil, pest management, USDA programs, or sustainable farming!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await chatbotAPI.getSuggestions(COUNTRY);
      setSuggestions(res.data.suggestions);
    } catch {
      // non-critical
    }
  };

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const history = updatedMessages.slice(-11, -1).map(m => ({ role: m.role, content: m.content }));
      const res = await chatbotAPI.chat(messageText, history);
      const botMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I could not connect right now. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="leaf" size={16} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.botAvatar}>
              <Ionicons name="leaf" size={16} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.typingText}>KisanBot is thinking...</Text>
            </View>
          </View>
        )}

        {suggestions.length > 0 && messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsRow}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          >
            {suggestions.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.suggestionChip}
                onPress={() => sendMessage(s.text)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={COUNTRY === 'IN' ? 'अपना सवाल यहाँ लिखें... / Type your question...' : 'Ask KisanBot anything...'}
            placeholderTextColor="#aaa"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  messagesList: { padding: 12, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2,
  },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 4 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  typingText: { color: '#888', fontSize: 13 },
  suggestionsRow: { maxHeight: 50, marginBottom: 4 },
  suggestionChip: {
    backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#a5d6a7',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionText: { color: '#2e7d32', fontSize: 13, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    maxHeight: 100, color: '#333',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#a5d6a7' },
});
