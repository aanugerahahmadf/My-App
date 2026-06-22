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
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { API } from '@/lib/endpoints';
import { apiGet, apiPost, getSanctumToken } from '@/lib/api-client';

const USER_BUBBLE_COLOR = '#eab308';
const USER_BUBBLE_TEXT_COLOR = '#1c1917';

type Message = {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  is_me: boolean;
  read_by: number[];
  attachments: any[];
  meta?: any;
  created_at: string;
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const startConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      let token = await getSanctumToken();
      let attempts = 0;
      while (!token && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        token = await getSanctumToken();
        attempts++;
      }

      if (!token) {
        setError('Connection is initializing. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      const res: any = await apiPost(API.CHAT.START, {
        title: 'Support Chat',
      });
      const convId = res.data?.id || res.id;
      if (convId) {
        setActiveConv(convId);
        await fetchMessages(convId);
      } else {
        setError('Failed to establish connection ID with support.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to start conversation. Please check your backend server.');
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
    if (id && id !== 'new') {
      const convId = parseInt(id, 10);
      if (!isNaN(convId)) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setActiveConv(convId);
        setLoading(false);
        fetchMessages(convId);
        /* eslint-enable react-hooks/set-state-in-effect */
        return;
      }
    }
    startConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (activeConv === null) return;
    const interval = setInterval(() => {
      fetchMessages(activeConv);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const renderMetaCard = (meta: any) => {
    const isCancellation = meta.is_cancellation;
    const isOrderCard = meta.is_order || meta.is_payment_update;
    const cardBg = isCancellation ? '#7f1d1d' : '#1e293b';
    const labelColor = isCancellation ? '#fca5a5' : '#facc15';

    return (
      <View style={[styles.metaCard, { backgroundColor: cardBg }]}>
        <View style={styles.metaRow}>
          {meta.image ? (
            <Image source={{ uri: meta.image }} style={styles.metaImage} />
          ) : (
            <View style={styles.metaImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#a1a1aa" />
            </View>
          )}
          <View style={styles.metaDetails}>
            {isCancellation && (
              <Text style={[styles.metaBadgeLabel, { color: labelColor }]}>
                ORDER CANCELLED
              </Text>
            )}
            {isOrderCard && !isCancellation && (
              <Text style={[styles.metaBadgeLabel, { color: labelColor }]}>
                Order #{meta.order_number || '-'}
              </Text>
            )}
            <Text style={styles.metaName} numberOfLines={1}>
              {meta.name}
            </Text>
            <Text style={styles.metaPrice}>
              Rp {Number(meta.price || 0).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <View style={styles.metaActionRow}>
          <Pressable
            style={styles.metaActionButton}
            onPress={() => {
              if (isOrderCard) {
                router.push('/(home)/order');
              } else if (meta.type === 'package') {
                router.push('/(home)/packages');
              } else {
                router.push('/(home)/products');
              }
            }}
          >
            <Text style={styles.metaActionText}>View Details</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !activeConv) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.chatHeader,
            { borderBottomColor: colors.backgroundSelected },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.chatHeaderAvatar}>
            <View style={[styles.chatHeaderAvatarCircle, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="person" size={18} color={colors.textSecondary} />
            </View>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
              Admin
            </Text>
          </View>
        </View>
        <View style={[styles.center, { padding: Spacing.four, gap: Spacing.three }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Error</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
            {error || 'Unable to establish secure chat session.'}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: '#3b82f6', opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={startConversation}
          >
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.chatHeaderAvatar}>
            <View style={[styles.chatHeaderAvatarCircle, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="person" size={18} color={colors.textSecondary} />
            </View>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
              Admin
            </Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) => {
            const isMine = item.is_me;

            let showDateDivider = false;
            const currentDate = new Date(item.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            if (index === 0) {
              showDateDivider = true;
            } else {
              const prevMessage = messages[index - 1];
              const prevDate = new Date(prevMessage.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              if (currentDate !== prevDate) {
                showDateDivider = true;
              }
            }

            const isRead = item.read_by && item.read_by.some((id: number) => id !== item.sender_id);

            return (
              <View style={{ marginBottom: Spacing.three }}>
                {showDateDivider && (
                  <View style={styles.dateDivider}>
                    <View style={[styles.dateDividerBadge, { backgroundColor: colors.backgroundSelected }]}>
                      <Text style={[styles.dateDividerText, { color: colors.textSecondary }]}>{currentDate}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.msgRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                  {!isMine && (
                    <View style={styles.receivedAvatarCol}>
                      {item.sender_name ? (
                        <View style={[styles.receivedAvatarInitials, { backgroundColor: colors.backgroundSelected }]}>
                          <Text style={[styles.receivedAvatarText, { color: colors.text }]}>
                            {item.sender_name.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      ) : (
                        <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />
                      )}
                    </View>
                  )}

                  <View style={[styles.msgContentCol, isMine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                    {!isMine && (
                      <Text style={[styles.senderNameText, { color: colors.textSecondary }]}>
                        {item.sender_name}
                      </Text>
                    )}

                    {item.meta && renderMetaCard(item.meta)}

                    <View
                          style={[
                            styles.msgBubble,
                            isMine
                              ? [styles.msgSent, { backgroundColor: USER_BUBBLE_COLOR }]
                              : [
                                  styles.msgReceived,
                                  { backgroundColor: colors.backgroundElement },
                                ],
                          ]}
                        >
                          <Text
                            style={[
                              styles.msgText,
                              { color: isMine ? USER_BUBBLE_TEXT_COLOR : colors.text },
                            ]}
                          >
                            {item.message}
                          </Text>
                        </View>

                        <View style={[styles.msgStatusRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                          <Text style={[styles.msgTimeText, { color: colors.textSecondary }]}>
                            {(() => {
                              const d = new Date(item.created_at);
                              const now = new Date();
                              const isToday =
                                d.getDate() === now.getDate() &&
                                d.getMonth() === now.getMonth() &&
                                d.getFullYear() === now.getFullYear();
                              return isToday
                                ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                                : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            })()}
                          </Text>
                          {isMine && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                              {isRead ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Text style={[styles.checkIcon, { color: '#60a5fa' }]}>✓✓</Text>
                                  <Text style={[styles.readStatusText, { color: '#60a5fa' }]}>Read</Text>
                                </View>
                              ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Text style={[styles.checkIcon, { color: colors.textSecondary }]}>✓</Text>
                                  <Text style={[styles.readStatusText, { color: colors.textSecondary }]}>Sent</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                  </View>
                </View>
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
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <Pressable onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="paper-plane" size={18} color={USER_BUBBLE_TEXT_COLOR} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const checkIconSize = { fontSize: 10, fontWeight: '900' as const, letterSpacing: -2 };

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: Spacing.two },
  chatHeaderAvatar: { marginRight: Spacing.two },
  chatHeaderAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderInfo: { flex: 1 },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  msgList: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
    width: '100%',
  },
  receivedAvatarCol: {
    marginRight: Spacing.two,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  receivedAvatarInitials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receivedAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  msgContentCol: {
    flexDirection: 'column',
    maxWidth: '80%',
  },
  senderNameText: {
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  msgBubble: {
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  msgSent: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  msgReceived: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  msgText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  msgStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  msgTimeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  readStatusText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  checkIcon: { ...checkIconSize, fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter' },
  dateDivider: {
    alignItems: 'center',
    marginVertical: Spacing.three,
    width: '100%',
  },
  dateDividerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
  metaCard: {
    borderRadius: 12,
    padding: Spacing.two,
    width: 250,
    marginBottom: Spacing.one,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  metaImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  metaImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  metaBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  metaPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f1f5f9',
    marginTop: 2,
  },
  metaActionRow: {
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: Spacing.two,
    alignItems: 'center',
  },
  metaActionButton: {
    width: '100%',
    alignItems: 'center',
  },
  metaActionText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.two,
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
    backgroundColor: USER_BUBBLE_COLOR,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.one,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: Spacing.one,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
  },
});
