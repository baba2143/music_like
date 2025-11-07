// カラーパレット
export const Colors = {
  // プライマリカラー
  primary: '#FF4081', // ピンク
  primaryDark: '#C60055',
  primaryLight: '#FF79B0',

  // セカンダリカラー
  secondary: '#3F51B5', // インディゴ
  secondaryDark: '#002984',
  secondaryLight: '#757DE8',

  // アクセントカラー
  accent: '#FFC107', // アンバー
  accentDark: '#C79100',
  accentLight: '#FFF350',

  // システムカラー
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // グレースケール
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // 透過
  transparent: 'transparent',
};

// ライトテーマ
export const LightTheme = {
  colors: {
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    background: Colors.white,
    surface: Colors.white,
    card: Colors.white,
    text: Colors.gray900,
    textSecondary: Colors.gray600,
    textTertiary: Colors.gray500,
    border: Colors.gray300,
    divider: Colors.gray200,
    placeholder: Colors.gray400,
    disabled: Colors.gray300,
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
    info: Colors.info,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: false,
};

// ダークテーマ
export const DarkTheme = {
  colors: {
    primary: Colors.primaryLight,
    secondary: Colors.secondaryLight,
    accent: Colors.accentLight,
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: Colors.white,
    textSecondary: Colors.gray400,
    textTertiary: Colors.gray500,
    border: Colors.gray700,
    divider: Colors.gray800,
    placeholder: Colors.gray600,
    disabled: Colors.gray700,
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
    info: Colors.info,
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  dark: true,
};

// タイポグラフィ
export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// スペーシング
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

// ボーダーRadius
export const BorderRadius = {
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// シャドウ
export const Shadow = {
  small: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// アイコンサイズ
export const IconSize = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 28,
  lg: 32,
  xl: 40,
  xxl: 48,
};

// コンテナサイズ
export const Container = {
  maxWidth: 800, // タブレット・大画面での最大幅
  padding: Spacing.base,
};

// アニメーション
export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// デフォルトテーマ
export const DefaultTheme = LightTheme;

// テーマ型定義
export type Theme = typeof LightTheme;
export type ThemeColors = typeof LightTheme.colors;
