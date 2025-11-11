import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';
import { Artist } from '../../types/models';
import { searchArtists, createArtist } from '../../services/artistService';

interface ArtistSelectorProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  selectedArtists: Artist[]; // 選択済みアーティスト
  onArtistsChange: (artists: Artist[]) => void;
  maxArtists?: number;
  userId: string; // アーティスト作成時に必要
}

export const ArtistSelector: React.FC<ArtistSelectorProps> = ({
  label,
  required = false,
  placeholder = 'アーティスト名を入力',
  selectedArtists,
  onArtistsChange,
  maxArtists = 10,
  userId,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 検索処理（デバウンス付き）
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchArtists(inputValue);

      // 既に選択済みのアーティストを除外
      const selectedIds = new Set(selectedArtists.map((a) => a.id));
      const filteredResults = results.filter((artist) => !selectedIds.has(artist.id));

      setSuggestions(filteredResults);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300); // 300msデバウンス

    return () => clearTimeout(timeoutId);
  }, [inputValue, selectedArtists]);

  // アーティストを選択
  const handleSelectArtist = (artist: Artist) => {
    if (selectedArtists.length >= maxArtists) {
      return;
    }

    onArtistsChange([...selectedArtists, artist]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // 新しいアーティストを作成して追加
  const handleAddNewArtist = async () => {
    if (!inputValue.trim() || selectedArtists.length >= maxArtists) {
      return;
    }

    setIsLoading(true);
    const { data, error } = await createArtist(inputValue.trim(), userId);
    setIsLoading(false);

    if (error || !data) {
      console.error('Failed to create artist:', error);
      return;
    }

    // 既に選択済みかチェック（正規化名で比較）
    const alreadySelected = selectedArtists.some(
      (artist) => artist.normalizedName === data.normalizedName
    );

    if (!alreadySelected) {
      onArtistsChange([...selectedArtists, data]);
    }

    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // アーティストを削除
  const handleRemoveArtist = (artistId: string) => {
    onArtistsChange(selectedArtists.filter((artist) => artist.id !== artistId));
  };

  // 候補アイテムをレンダリング
  const renderSuggestionItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectArtist(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionCount}>{item.usageCount}人が選択中</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ラベル */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      {/* 入力フィールド */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#808080"
          value={inputValue}
          onChangeText={setInputValue}
          autoCorrect={false}
          maxLength={50}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {/* サジェスト一覧 */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* 新しいアーティストを追加ボタン */}
      {inputValue.trim() && !isLoading && (
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewArtist}
          activeOpacity={0.7}
          disabled={selectedArtists.length >= maxArtists}
        >
          <Text style={styles.addNewButtonText}>
            「{inputValue.trim()}」を新規追加
          </Text>
        </TouchableOpacity>
      )}

      {/* 選択済みアーティストタグ */}
      {selectedArtists.length > 0 && (
        <View style={styles.tagsContainer}>
          {selectedArtists.map((artist) => (
            <View key={artist.id} style={styles.tag}>
              <Text style={styles.tagText}>{artist.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveArtist(artist.id)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButton}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* カウント表示 */}
      <Text style={styles.count}>
        {selectedArtists.length} / {maxArtists}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  loadingIndicator: {
    position: 'absolute',
    right: Spacing.base,
    top: 13,
  },
  suggestionsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    maxHeight: 200,
    marginBottom: Spacing.xs,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionName: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    flex: 1,
  },
  suggestionCount: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginLeft: Spacing.sm,
  },
  addNewButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  addNewButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    marginRight: 4,
  },
  removeButton: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
  },
  count: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
});
