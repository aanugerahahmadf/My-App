import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHelpData } from '@/services/api';

interface FAQ {
  question: string;
  answer: string;
}

interface ContactOption {
  type: 'whatsapp' | 'email' | 'phone';
  label: string;
  value: string;
  icon: string;
}

export default function HelpCenterScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchHelpData();
  }, []);

  const fetchHelpData = async () => {
    try {
      const res = await getHelpData();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error fetching help data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (option: ContactOption) => {
    let url = '';
    switch (option.type) {
      case 'whatsapp':
        url = `whatsapp://send?phone=${option.value}`;
        break;
      case 'email':
        url = `mailto:${option.value}`;
        break;
      case 'phone':
        url = `tel:${option.value}`;
        break;
    }
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const faqs = data?.faqs || [];
  const contactOptions = data?.contact_options || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{data?.title || 'Help Center'}</Text>
        <Text style={styles.subtitle}>
          {data?.subtitle || 'Find answers to common questions or reach out to our team.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.length > 0 ? (
          faqs.map((faq: FAQ, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              activeOpacity={0.7}
            >
              <div style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </div>
              {expandedIndex === index && (
                <Text style={styles.answer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No FAQs available at the moment.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactGrid}>
          {contactOptions.length > 0 ? (
            contactOptions.map((option: ContactOption, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={() => handleContact(option)}
              >
                <Ionicons name={(option.icon as any) || 'mail-outline'} size={24} color="#0a7ea4" />
                <Text style={styles.contactLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('mailto:support@weddingapp.com')}
            >
              <Ionicons name="mail-outline" size={24} color="#0a7ea4" />
              <Text style={styles.contactLabel}>Email Support</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  answer: {
    marginTop: 12,
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '47%',
    flex: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  contactLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
