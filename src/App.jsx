// ═══════════════════════════════════════════════════════════════
// src/App.jsx  ──  路由總調度（整個應用的「目錄」）
//
// 定義「URL 路徑 → 顯示哪個頁面」的映射，以及哪些頁面需要登錄才能訪問。
//
// 【前端路由 vs 後端路由】
//   傳統網站：每次跳轉向服務器請求新 HTML 頁面。
//   本 SPA（單頁應用）：只有一個 index.html；「跳轉」只是 JS 修改地址欄
//   + 切換顯示哪個組件，react-router-dom 實現這種「假跳轉」。
//
// 【頁面結構】
//   /           → 自動跳轉到 /login
//   /login      → 登錄頁（無需認證）
//   /signup     → 註冊頁（無需認證）
//   /map        → 地圖頁（需要登錄）
//   /menu/:id   → 餐廳菜單頁（:id 是動態參數，如 /menu/6 = 甘牌燒鵝）
//   /friends    → 好友頁（需要登錄）
//   /profile    → 個人檔案頁（需要登錄）
// ═══════════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import { useUser } from './context/UserContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MapPage from './pages/MapPage';
import MenuPage from './pages/MenuPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';

// ── 路由守衛組件 ─────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isLoggedIn } = useUser();
  return isLoggedIn ? children : <Navigate to={ROUTES.LOGIN} replace />;
}

// ── 底部三標籤頁持久渲染佈局 ────────────────────────────────────
// 三個頁面同時掛載（mounted），根據當前路徑用 display:none 隱藏非活躍頁。
// 這樣在標籤之間切換時，React 不會卸載（unmount）組件，地圖狀態、
// 滾動位置、搜索內容等均原樣保留。
function TabLayout() {
  const location = useLocation();
  const p = location.pathname;
  return (
    <>
      <div style={{ display: p === ROUTES.MAP     ? 'block' : 'none' }}><MapPage /></div>
      <div style={{ display: p === ROUTES.FRIENDS ? 'block' : 'none' }}><FriendsPage /></div>
      <div style={{ display: p === ROUTES.PROFILE ? 'block' : 'none' }}><ProfilePage /></div>
    </>
  );
}

// ── 主組件：路由表 ───────────────────────────────────────────────
function App() {
  return (
    // <BrowserRouter>：啟動前端路由，監聽瀏覽器地址欄變化
    <BrowserRouter>
      {/* <Routes>：路由表容器，從上往下匹配當前 URL，找到第一個匹配的 Route 渲染 */}
      <Routes>
        {/* 根路徑自動重定向到登錄頁 */}
        <Route path={ROUTES.HOME}    element={<Navigate to={ROUTES.LOGIN} />} />
        {/* 公開頁面（無需登錄） */}
        <Route path={ROUTES.LOGIN}   element={<Login />} />
        <Route path={ROUTES.SIGNUP}  element={<Signup />} />
        {/* ROUTES.MENU = '/menu/:id'，:id 是動態參數，MenuPage 用 useParams() 讀取 */}
        <Route path={ROUTES.MENU}    element={<RequireAuth><MenuPage /></RequireAuth>} />
        {/* 底部三標籤頁統一掛載，切換時保持各頁面狀態不丟失 */}
        <Route path="*"              element={<RequireAuth><TabLayout /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
