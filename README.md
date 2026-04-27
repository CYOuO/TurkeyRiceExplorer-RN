# 嘉義火雞肉飯探險家 (Chiayi Turkey Rice Explorer) 🍚
這是一款專為嘉義美食愛好者開發的 React Native 行動應用程式。透過整合在地餐廳資訊、飲食日記、消費記帳以及趣味小遊戲，為使用者提供完整的嘉義火雞肉飯探索體驗。
---
## 🌟 核心功能
### 1. 餐廳探索與詳細資訊
* **多維度探索**：收錄嘉義知名火雞肉飯店家，提供詳盡的營業時間、地點、聯絡電話及價格區間。

* **智慧標籤**：透過標籤系統（如：在地名店、停車方便）快速了解店家特色。

* **全螢幕圖庫**：整合 ImageOverviewScreen，支援多圖切換與全螢幕放大查看店家環境與菜色。

### 2. 個人化紀錄工具
* **飲食日記 (DiaryScreen)**：記錄每一次的用餐心得，支援評分系統、心得文字以及照片上傳，紀錄專屬於你的美味回憶。

* **消費記帳 (ExpenseScreen)**：專為餐飲設計的記帳功能，自動關聯店家名稱，並提供消費統計與熱門店家排行圖表。

* **我的收藏 (FavoritesScreen)**：一鍵收藏心儀店家，打造私藏美食清單。

### 3. 趣味決策與互動
* **隨機選店 (RandomPickerScreen)**：解決「今天吃什麼」的難題，透過趣味動畫隨機抽選目前營業中的店家。

* **記憶翻牌遊戲 (FlipGameScreen)**：以餐廳圖片為題材的 3D 翻轉小遊戲，增加 App 的互動趣味性。

### 4. 系統特色
* **日夜模式切換**：支援全局主題切換，包含流暢的過場動畫 (TransitionOverlay)。

* **資料持久化**：使用 AsyncStorage 確保日記、記帳與收藏資料在離線狀態下依然安全保存。
---
## 🛠 技術棧
| 類別 | 技術/套件 |
| :--- | :--- |

|**開發框架**|React Native (TypeScript)|

|**狀態管理**|React Context API (AppContext)|

|**導覽系統**|React Navigation (Drawer & Stack)|

|**本地儲存**|@react-native-async-storage/async-storage|

|**動畫效果**|Animated API (包含 Native Driver 優化)|

|**UI 組件**|React Native Paper / Vector Icons|
