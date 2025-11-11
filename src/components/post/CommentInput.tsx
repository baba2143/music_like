import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

interface CommentInputProps {
  placeholder?: string;
  onSubmit?: (text: string) => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder = 'コメントを入力...',
  onSubmit,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) {
      return;
    }

    if (onSubmit) {
      onSubmit(text.trim());
      setText('');
    } else {
      Alert.alert('準備中', 'コメント投稿機能は準備中です');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* テキスト入力 */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#808080"
          value={text}
          onChangeText={setText}
          multiline={true}
          maxLength={500}
        />

        {/* 送信ボタン */}
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <View style={styles.sendIcon}>
            <View style={styles.sendArrow} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A2A',
    opacity: 0.5,
  },
  sendIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
    transform: [{ rotate: '90deg' }],
  },
});
