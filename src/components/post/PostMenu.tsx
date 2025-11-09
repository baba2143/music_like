import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface PostMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>編集</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            onPress={() => {
              onClose();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={[styles.menuText, styles.deleteText]}>削除</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>✖️</Text>
            <Text style={styles.menuText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  deleteItem: {
    // 削除アイテムの追加スタイル（必要に応じて）
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
  },
  deleteText: {
    color: '#FF4444', // 赤色で警告
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },
});
