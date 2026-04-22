import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '../theme/colors';

// ─── 型別定義 ──────────────────────────────────────────────
export interface DiaryEntry {
  id: string;
  createdAt: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  note: string;
  photoUri: string | null;
}

interface AppContextValue {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  diary: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => Promise<string>;
  deleteDiaryEntry: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark]         = useState(false);
  const [favorites, setFavorites]   = useState<string[]>([]);
  const [diary, setDiary]           = useState<DiaryEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('isDark');
        if (t !== null) setIsDark(JSON.parse(t));

        const f = await AsyncStorage.getItem('favorites');
        if (f !== null) setFavorites(JSON.parse(f));

        const d = await AsyncStorage.getItem('diary');
        if (d !== null) setDiary(JSON.parse(d));
      } catch (e) {
        console.warn('AppContext load error:', e);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('isDark', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const addDiaryEntry = useCallback(
    async (entry: Omit<DiaryEntry, 'id' | 'createdAt'>): Promise<string> => {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...entry,
      };
      setDiary(prev => {
        const next = [newEntry, ...prev];
        AsyncStorage.setItem('diary', JSON.stringify(next));
        return next;
      });
      return newEntry.id;
    },
    [],
  );

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiary(prev => {
      const next = prev.filter(e => e.id !== id);
      AsyncStorage.setItem('diary', JSON.stringify(next));
      return next;
    });
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <AppContext.Provider value={{
      isDark, colors, toggleTheme,
      favorites, toggleFavorite, isFavorite,
      diary, addDiaryEntry, deleteDiaryEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
