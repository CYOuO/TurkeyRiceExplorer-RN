程式碼使用前記得先到終端機安裝所需套件

# 需要安裝

npm install react-native-fs


重開機後日記圖片消失的問題

原因： react-native-image-picker 預設回傳的圖片 URI 是放在系統的「暫存資料夾 (Cache)」。當 App 重開或系統清理空間時，這些圖片就會被刪除。 解法： 使用 react-native-fs 將選取的圖片複製到 App 的「文件資料夾 (Document Directory)」這個永久儲存區，再將新的路徑存入你的日記 Context 中。原因： react-native-image-picker 預設回傳的圖片 URI 是放在系統的「暫存資料夾 (Cache)」。當 App 重開或系統清理空間時，這些圖片就會被刪除。 解法： 使用 react-native-fs 將選取的圖片複製到 App 的「文件資料夾 (Document Directory)」這個永久儲存區，再將新的路徑存入你的日記 Context 中。



📝 專案更新報告：嘉義火雞肉飯探索指南
本次更新重點在於**功能面（CRUD、資料持久化、遊戲化）與使用者體驗（UX/UI、效能優化）**的全面升級。

1. 日記系統 (Diary System) 深度優化
重新編輯功能：修正原本日記一旦儲存即無法更改的問題。現在支援針對現有日記進行內容、評分與照片的更新。

圖片持久化儲存 (Persistent Storage)：解決重開機後日記照片消失的問題。透過引入 react-native-fs，將選取的圖片從暫存區複製到 App 的永久文件夾 (DocumentDirectoryPath)。

編輯介面連動：改造 AddDiaryModal 使其具備雙重模式，能自動偵測是「新增」還是「編輯」狀態並正確預填資料。

2. 趣味化功能：記憶大考驗 (Flip Game)
3D 翻牌效果：使用 Animated API 實作具備 3D 旋轉感的卡片翻轉效果。

遊戲邏輯：包含隨機洗牌演算法、5 秒預覽記憶時間、即時計時器以及最高紀錄（最佳耗時）追蹤。

動態通知佇列 (Toast Queue)：開發了非阻塞式的頂部通知系統，當玩家快速連續答對時，訊息會以列隊方式依序滑入顯示，不影響遊戲節奏。

結算導航：遊戲結束後會列出所有參與遊戲的店家，點擊即可跳轉至「探索店家」查看詳情。

3. 全新記帳系統 (Expense Tracker)
預算管理：新增記帳頁面，讓使用者記錄吃雞肉飯的花費金額、餐點內容與日期。

自動統計：介面上方提供「累積總花費」統計卡片，自動計算所有紀錄的總和。

全域狀態整合：將記帳資料納入 AppContext 統一管理，並確保與 AsyncStorage 同步，實現跨頁面資料共享。

4. 進階篩選與 UI 視覺升級 (Search & Filter)
多重標籤過濾：支援多選標籤（例如：同時勾選「#宵夜首選」+「#人氣名店」），篩選器採用 AND 邏輯確保結果精確。

高分優先排序：一鍵切換星級排序，讓評分最高的店家排在列表最上方。

動態顏色系統 (Color Coding)：

標籤自動配色：開發顏色產生器，根據標籤名稱自動分配專屬色系。

狀態切換樣式：未點選時顯示彩色文字與邊框；點選後變為實心背景與白色文字（Outlined to Contained 切換），大幅提升操作直覺性。

5. 系統穩定性與導航修正
滾動優化：在「隨機選店」頁面引入 ScrollView，解決小螢幕裝置下內容遮擋按鈕的問題。

導航參數相容：修正 RestaurantInfoScreen 的接收邏輯，使其能同時處理來自收藏頁、遊戲頁、隨機頁的不同參數結構 (restaurantId 與 preselect)。

效能優化：使用 useMemo 處理大量店家的過濾與排序邏輯，減少不必要的重新渲染。

🛠️ 技術組件異動
新增套件：react-native-fs (檔案操作)、react-native-image-picker (圖片選擇)。

主要更動檔案：

AppContext.tsx：擴充資料型別與全域方法。

App.tsx：註冊新路由與型別定義。

RestaurantInfoScreen.tsx：重構篩選、排序與標籤樣式邏輯。

FlipGameScreen.tsx & ExpenseScreen.tsx：全新功能頁面。
