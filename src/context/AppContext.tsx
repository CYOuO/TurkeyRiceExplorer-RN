// 全局狀態管理，包含主題、收藏、日記和記帳功能
import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '../theme/colors';
import TransitionOverlay from '../components/TransitionOverlay';

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

export interface ExpenseEntry {
  id: string;
  createdAt: number;     // 記帳日期
  restaurantId: string;  // 關聯的店家 ID
  restaurantName: string;// 店名
  amount: number;        // 花費金額
  items: string;         // 點了什麼餐點
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
  updateDiaryEntry: (id: string, updatedData: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>) => Promise<void>;
  expenses: ExpenseEntry[];
  addExpense: (entry: Omit<ExpenseEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => void;
  triggerTransition: () => void;
  updateExpense: (id: string, updatedData: Partial<Omit<ExpenseEntry, 'id' | 'createdAt'>>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark]         = useState(false);
  const [favorites, setFavorites]   = useState<string[]>([]);
  const [diary, setDiary]           = useState<DiaryEntry[]>([]);
  const [expenses, setExpenses]     = useState<ExpenseEntry[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('isDark');
        if (t !== null) setIsDark(JSON.parse(t));

        const f = await AsyncStorage.getItem('favorites');// 讀取收藏店家 ID 列表
        if (f !== null) setFavorites(JSON.parse(f));// 這個列表只存 ID，實際店家資料從 restaurantData.js 來，這樣更新 App 時就不會有資料結構變動的問題

        const d = await AsyncStorage.getItem('diary');
        if (d !== null) setDiary(JSON.parse(d));
		
		const ex = await AsyncStorage.getItem('expenses');
        if (ex !== null) setExpenses(JSON.parse(ex));
      } catch (e) {
        console.warn('AppContext load error:', e);
      }
    })();
  }, []);
  
  const triggerTransition = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 1800);
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

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);// 

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
  
  const updateDiaryEntry = useCallback(
    async (id: string, updatedData: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>): Promise<void> => {
      setDiary(prev => {
        // 使用 map 找到對應的 id 並更新內容，其餘保持不變
        const next = prev.map(entry => 
          entry.id === id ? { ...entry, ...updatedData } : entry
        );
        AsyncStorage.setItem('diary', JSON.stringify(next));
        return next;
      });
    }, []);
	
  const addExpense = useCallback(async (data: Omit<ExpenseEntry, 'id' | 'createdAt'> & { createdAt?: number }) => {
  const newEntry: ExpenseEntry = {
    ...data,
    id: Date.now().toString(),
    createdAt: data.createdAt || Date.now(), // 如果有傳日期就用傳的，沒有才用現在
  };
      setExpenses(prev => {
        const next = [newEntry, ...prev]; // 新的放最前面
        AsyncStorage.setItem('expenses', JSON.stringify(next));
        return next;
      });
    }, []);
	
  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      AsyncStorage.setItem('expenses', JSON.stringify(next));
      return next;
    });
  }, []);
  const updateExpense = useCallback(async (id: string, updatedData: Partial<ExpenseEntry>) => {
  setExpenses(prev => {
    const next = prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedData } : entry
    );
    AsyncStorage.setItem('expenses', JSON.stringify(next));
    return next;
  });
}, []);
  const colors = isDark ? darkColors : lightColors;

  return (
    <AppContext.Provider value={{
      isDark, colors, toggleTheme,
      favorites, toggleFavorite, isFavorite,
      diary, addDiaryEntry, deleteDiaryEntry,
	  updateDiaryEntry, expenses, addExpense,
	  deleteExpense, updateExpense, triggerTransition,
    }}>
      {children}
	  <TransitionOverlay visible={isTransitioning} />
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
