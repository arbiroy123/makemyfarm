import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatbotAPI, billingAPI } from '../../api/client';
import { useAuthStore } from '../../store';
import { detectCountry } from '../../utils/country';

const FREE_MONTHLY_LIMIT = 5;

function monthKey(userId) {
  const now = new Date();
  return `kisanbot_${userId}_${now.getFullYear()}-${now.getMonth()}`;
}

export default function ChatbotScreen() {
  const { user } = useAuthStore();
  const country = user?.country_code || detectCountry();

  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: country === 'IN'
        ? 'नमस्ते! मैं KisanBot हूं — आपका कृषि सहायक। फसल, मिट्टी, कीट, सरकारी योजनाओं — किसी भी विषय पर पूछें!\n\nHello! I am KisanBot, your agricultural advisor. Ask me anything about crops, soil, pests, or government schemes!'
        : "Hello! I'm KisanBot, your agricultural advisor. Ask me anything about crops, soil, pest management, USDA programs, or sustainable farming!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isPro, setIsPro] = useState(true);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    loadUsage();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await chatbotAPI.getSuggestions(country);
      setSuggestions(res.data.suggestions);
    } catch {
      // non-critical
    }
  };

  const loadUsage = async () => {
    try {
      const [billingRes, stored] = await Promise.all([
        billingAPI.getStatus(),
        AsyncStorage.getItem(monthKey(user?.id ?? 'guest')),
      ]);
      setIsPro(billingRes.data.isPro);
      setQuestionsUsed(parseInt(stored ?? '0', 10));
    } catch {
      setIsPro(false);
    }
  };

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    if (!isPro && questionsUsed >= FREE_MONTHLY_LIMIT) {
      Alert.alert(
        '💬 Monthly limit reached',
        `Free accounts get ${FREE_MONTHLY_LIMIT} KisanBot questions per month. Upgrade to Pro for unlimited advice.`,
        [{ text: 'Maybe Later', style: 'cancel' }, { text: 'Upgrade to Pro', style: 'default' }]
      );
      return;
    }

    const userMessage = { id: Date.now().toString(), role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (!isPro) {
      const next = questionsUsed + 1;
      setQuestionsUsed(next);
      AsyncStorage.setItem(monthKey(user?.id ?? 'guest'), String(next)).catch(() => {});
    }

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

        {!isPro && (
          <View style={styles.usageBanner}>
            <Ionicons name="chatbubble-outline" size={13} color="#FF9800" />
            <Text style={styles.usageText}>
              {Math.max(0, FREE_MONTHLY_LIMIT - questionsUsed)} free question{FREE_MONTHLY_LIMIT - questionsUsed !== 1 ? 's' : ''} left this month
            </Text>
            {questionsUsed >= FREE_MONTHLY_LIMIT - 1 && (
              <Text style={styles.usageUpgrade}> · Upgrade for unlimited</Text>
            )}
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={country === 'IN' ? 'अपना सवाल यहाँ लिखें... / Type your question...' : 'Ask KisanBot anything...'}
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
  usageBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff8e1', paddingHorizontal: 14, paddingVertical: 7,
    borderTopWidth: 1, borderTopColor: '#ffe082',
  },
  usageText: { fontSize: 12, color: '#e65100' },
  usageUpgrade: { fontSize: 12, color: '#4CAF50', fontWeight: '700' },

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
