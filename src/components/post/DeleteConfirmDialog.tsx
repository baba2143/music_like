import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface DeleteConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  deleting = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* タイトル */}
          <View style={styles.header}>
            <Text style={styles.title}>投稿を削除</Text>
          </View>

          {/* メッセージ */}
          <View style={styles.content}>
            <Text style={styles.message}>
              この投稿を削除してもよろしいですか？
            </Text>
            <Text style={styles.subMessage}>
              この操作は取り消すことができません。
            </Text>
          </View>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={deleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton, deleting && styles.deleteButtonDisabled]}
              onPress={onConfirm}
              disabled={deleting}
              activeOpacity={0.7}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.deleteButtonText}>削除する</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },
  header: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  content: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subMessage: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#2A2A2A',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    fontWeight: Typography.fontWeight.medium,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
