import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost } from '@/lib/api-client';

type Message = {
  id: number;
  message: string;
  user_id: number;
  created_at: string;
};

type Conversation = {
  id: number;
  title: string;
  user_ids: number[];
  meta: any;
  last_message?: string;
  unread?: number;
};

export default function MessagesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchConversations = async () => {
    try {
      const res: any = await apiGet(API.CHAT.CONVERSATIONS);
      setConversations(res.data || res || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const res: any = await apiGet(API.CHAT.MESSAGES(convId));
      setMessages(res.data || res || []);
    } catch {
      // silent
    }
  };

  const startConversation = async () => {
    try {
      const res: any = await apiPost(API.CHAT.START, {
        title: 'Chat dengan Admin',
      });
      const convId = res.data?.id || res.id;
      if (convId) {
        setActiveConv(convId);
        fetchMessages(convId);
      }
    } catch {
      // silent
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConv) return;
    try {
      await apiPost(API.CHAT.SEND, {
        inbox_id: activeConv,
        message: inputText.trim(),
      });
      setInputText('');
      fetchMessages(activeConv);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      style={[
        styles.convCard,
        { backgroundColor: colors.backgroundElement },
        activeConv === item.id && {
          borderColor: '#3b82f6',
          borderWidth: 1,
        },
      ]}
      onPress={() => {
        setActiveConv(item.id);
        fetchMessages(item.id);
      }}
    >
      <View style={styles.avatar}>
        <Ionicons
          name="person-circle-outline"
          size={40}
          color={colors.textSecondary}
        />
      </View>
      <View style={styles.convContent}>
        <Text style={[styles.convName, { color: colors.text }]}>
          {item.title || 'Admin'}
        </Text>
        <Text
          style={[styles.lastMsg, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.last_message || 'Belum ada pesan'}
        </Text>
      </View>
      {(item.unread || 0) > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </Pressable>
  );

  if (!activeConv) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  Belum ada percakapan
                </Text>
                <Pressable style={styles.startBtn} onPress={startConversation}>
                  <Text style={styles.startBtnText}>Mulai Chat dengan Admin</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        style={[
          styles.chatHeader,
          { borderBottomColor: colors.backgroundSelected },
        ]}
      >
        <Pressable onPress={() => setActiveConv(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.chatTitle, { color: colors.text }]}>Admin</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => {
          const isMine = item.user_id === userId;
          return (
            <View
              style={[
                styles.msgBubble,
                isMine
                  ? [styles.msgSent, { backgroundColor: '#3b82f6' }]
                  : [
                      styles.msgReceived,
                      { backgroundColor: colors.backgroundElement },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  { color: isMine ? '#fff' : colors.text },
                ]}
              >
                {item.message}
              </Text>
            </View>
          );
        }}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.backgroundSelected,
          },
        ]}
      >
        <TextInput
          style={[
            styles.chatInput,
            { backgroundColor: colors.backgroundElement, color: colors.text },
          ]}
          placeholder="Ketik pesan..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  list: { padding: Spacing.three },
  emptyText: {
    marginTop: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  startBtn: {
    marginTop: Spacing.three,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  avatar: { marginRight: Spacing.two },
  convContent: { flex: 1 },
  convName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  lastMsg: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: Spacing.two },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  msgList: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  msgSent: {
    alignSelf: 'flex-end',
  },
  msgReceived: {
    alignSelf: 'flex-start',
  },
  msgText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderTopWidth: 1,
    gap: Spacing.two,
    paddingBottom: Platform.OS === 'ios' ? 25 : Spacing.two,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    height: 40,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  sendBtn: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
