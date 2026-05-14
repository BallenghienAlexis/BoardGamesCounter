import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
}

export function AlertModal({ visible, title, message, buttons, onDismiss }: AlertModalProps) {
  const { colors } = useTheme();

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    alertBox: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      maxWidth: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    messageContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      maxHeight: 200,
    },
    message: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      lineHeight: 20,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDefault: {
      backgroundColor: colors.surfaceLight,
    },
    buttonCancel: {
      backgroundColor: colors.surfaceLight,
    },
    buttonDestructive: {
      backgroundColor: '#EF4444',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    buttonTextDefault: {
      color: colors.text,
    },
    buttonTextCancel: {
      color: colors.text,
    },
    buttonTextDestructive: {
      color: '#FFFFFF',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.alertBox}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView style={styles.messageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>

          <View style={styles.footer}>
            {buttons.map((button, idx) => {
              const buttonStyle = button.style || 'default';
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    buttonStyle === 'default' && styles.buttonDefault,
                    buttonStyle === 'cancel' && styles.buttonCancel,
                    buttonStyle === 'destructive' && styles.buttonDestructive,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      buttonStyle === 'default' && styles.buttonTextDefault,
                      buttonStyle === 'cancel' && styles.buttonTextCancel,
                      buttonStyle === 'destructive' && styles.buttonTextDestructive,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

