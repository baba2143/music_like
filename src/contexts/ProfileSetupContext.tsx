import React, { createContext, useState, useContext, ReactNode } from 'react';

/**
 * プロフィール作成コンテキスト
 * 3ステップのプロフィール作成データを一時保存
 */

export interface ProfileSetupData {
  // Step 1
  username: string;
  displayName: string;
  bio: string;

  // Step 2
  oshiGroup: string;
  oshiMember: string;

  // Step 3
  favoriteGenres: string[];
  favoriteArtists: string[];
}

interface ProfileSetupContextType {
  profileData: ProfileSetupData;
  updateProfileData: (data: Partial<ProfileSetupData>) => void;
  resetProfileData: () => void;
}

const initialProfileData: ProfileSetupData = {
  username: '',
  displayName: '',
  bio: '',
  oshiGroup: '',
  oshiMember: '',
  favoriteGenres: [],
  favoriteArtists: [],
};

const ProfileSetupContext = createContext<ProfileSetupContextType | undefined>(undefined);

interface ProfileSetupProviderProps {
  children: ReactNode;
}

export const ProfileSetupProvider: React.FC<ProfileSetupProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileSetupData>(initialProfileData);

  const updateProfileData = (data: Partial<ProfileSetupData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const resetProfileData = () => {
    setProfileData(initialProfileData);
  };

  const value: ProfileSetupContextType = {
    profileData,
    updateProfileData,
    resetProfileData,
  };

  return (
    <ProfileSetupContext.Provider value={value}>{children}</ProfileSetupContext.Provider>
  );
};

/**
 * プロフィール作成コンテキストを使用するカスタムフック
 */
export const useProfileSetup = (): ProfileSetupContextType => {
  const context = useContext(ProfileSetupContext);

  if (context === undefined) {
    throw new Error('useProfileSetup must be used within a ProfileSetupProvider');
  }

  return context;
};
