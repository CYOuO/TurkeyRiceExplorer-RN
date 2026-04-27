import 'react-native-gesture-handler'; // 必須置於最頂部
import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

// ─── 引入全域狀態與組件 ──────────────────────────────────────
// 雖然這些是 .js 檔案，但 TypeScript 會自動處理 import
import { AppProvider } from './src/context/AppContext';
import DrawerContent from './src/components/DrawerContent';
import TransitionOverlay from './src/components/TransitionOverlay';

// ─── 1. 定義導航型別 (Navigation Param Lists) ──────────────
/**
 * 這裡定義每個頁面可以接收哪些參數。
 * 即使其他檔案是 .js，在這裡定義好能幫助你在 App.tsx 內進行型別檢查。
 */
export type HomeStackParamList = {
  Home: undefined;
  RestaurantInfo: { restaurantId: string } | undefined; 
  ImageOverview: { restaurantId: string; images: string[] } | undefined;
};

export type DrawerParamList = {
  HomeStack: undefined;
  Favorites: undefined;
  Diary: undefined;
  Random: undefined;
  FlipGame: undefined;
  Expense: undefined;
};

// ─── 2. 引入各個 Screen ────
import HomeScreen           from './src/screens/HomeScreen';
import RestaurantInfoScreen from './src/screens/RestaurantInfoScreen';
import ImageOverviewScreen  from './src/screens/ImageOverviewScreen';
import FavoritesScreen      from './src/screens/FavoritesScreen';
import DiaryScreen          from './src/screens/DiaryScreen';
import RandomPickerScreen   from './src/screens/RandomPickerScreen';
import FlipGameScreen       from './src/screens/FlipGameScreen';
import ExpenseScreen        from './src/screens/ExpenseScreen';

// ─── 3. 建立具備型別檢查的導航器 ───────────────────────────
const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack  = createStackNavigator<HomeStackParamList>();

// ─── 4. 首頁 Stack 導航 (Home → 餐廳詳情 → 圖片總覽) ───────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"           component={HomeScreen} />
      <Stack.Screen name="RestaurantInfo" component={RestaurantInfoScreen} />
      <Stack.Screen name="ImageOverview"  component={ImageOverviewScreen} />
    </Stack.Navigator>
  );
}

// ─── 5. 主程式入口 ─────────────────────────────────────────
export default function App() {
  // ✅ 管理轉場動畫狀態
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerTransition = () => {
    setIsTransitioning(true);
    // 設定 1.8 秒後關閉遮罩（配合動畫上升、停留與下降的時間）
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1800); 
  };

  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Drawer.Navigator
            drawerContent={(props: DrawerContentComponentProps) => <DrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
              drawerType: 'slide',
              overlayColor: 'rgba(0,0,0,0.4)',
              drawerStyle: { width: 280 },
            }}
          >
            <Drawer.Screen name="HomeStack" component={HomeStack} options={{ title: '首頁' }} />
            <Drawer.Screen name="Favorites" component={FavoritesScreen} options={{ title: '我的收藏' }} />
            <Drawer.Screen name="Diary" component={DiaryScreen} options={{ title: '雞肉飯日記' }} />
            <Drawer.Screen name="Random" component={RandomPickerScreen} options={{ title: '隨機選店' }} />
            <Drawer.Screen name="FlipGame" component={FlipGameScreen} options={{ title: '記憶大考驗' }} />
            <Drawer.Screen name="Expense" component={ExpenseScreen} options={{ title: '記帳本' }} />
          </Drawer.Navigator>
        </NavigationContainer>
      </View>
    </AppProvider>
  );
}