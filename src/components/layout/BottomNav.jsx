// ═══════════════════════════════════════════════════════════════
// src/components/layout/BottomNav.jsx  ──  底部導航欄組件
//
// 【DRY 原則（Don't Repeat Yourself）】
//   MapPage 和 FriendsPage 都需要底部導航，把它封裝成組件，
//   每個頁面直接 <BottomNav /> 一行代碼，確保樣式和行為完全一致。
//
// 【TabBar（antd-mobile 組件）】
//   activeKey = 當前路由路徑（location.pathname）
//   onChange  = 用戶點擊標籤時調用 navigate(key) 跳轉路由
//   注意：antd-mobile 的 TabBar 只負責 UI，路由跳轉靠 react-router 的 navigate
//
// 【SVG 圖標設計】
//   每個 tab 的 icon 是一個函數 (active) => <svg .../>
//   active 為 true 時用 C.primary（主色填充），false 時用 C.textLight（灰色描邊）
//   這樣不需要兩套圖片，一個函數搞定激活/非激活兩種狀態
// ═══════════════════════════════════════════════════════════════

import { TabBar } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { C } from '../../constants/colors';

// TABS：三個標籤頁的配置數組（類比 C 的結構體數組）
// key 與路由路徑相同，用於 activeKey 匹配和 navigate 跳轉
// icon 是函數（不是組件）：接受 active 布爾值，返回不同顏色的 SVG JSX
const TABS = [
  {
    key: ROUTES.MAP,
    title: '地圖',
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill={active ? C.primary : 'none'}
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8"
        />
        <circle cx="12" cy="9" r="2.5" fill={active ? 'white' : C.textLight} />
      </svg>
    ),
  },
  {
    key: ROUTES.FRIENDS,
    title: '好友',
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <circle cx="9" cy="8" r="3.2"
          fill={active ? C.primary : 'none'}
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8"
        />
        <path d="M2 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path d="M16 6c1.66 0 3 1.34 3 3s-1.34 3-3 3"
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path d="M19 20c0-2.5 1.5-4.5 3-5.5"
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: ROUTES.PROFILE,
    title: '個人檔案',
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <circle
          cx="12" cy="8" r="4"
          fill={active ? C.primary : 'none'}
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8"
        />
        <path
          d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
          stroke={active ? C.primary : C.textLight}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

// BottomNav 自帶定位與樣式，兩個頁面直接使用，確保視覺完全一致
export default function BottomNav() {
  // useNavigate：返回 navigate 函數，調用 navigate('/map') 即可跳轉頁面（無刷新）
  const navigate = useNavigate();
  // useLocation：返回當前路由位置對象，location.pathname 即當前 URL 路徑
  // 用於判斷哪個標籤是「激活」狀態（active = 路徑匹配）
  const location = useLocation();

  return (
    // 外層 div：position:fixed 固定在視口底部，不隨頁面滾動移動
    // maxWidth + margin:auto：配合頁面最大寬度 450px 居中
    // zIndex:2000：高於頁面其他元素（地圖 zIndex 約 400），始終顯示在最上層
    // backdropFilter:blur：毛玻璃效果，模糊背景（需要瀏覽器支持）
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      maxWidth: '100%',
      margin: '0 auto',
      zIndex: 2000,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(14px)',
      borderTop: `1px solid ${C.border}`,
      borderRadius: '20px 20px 0 0',
      boxShadow: '0 -2px 16px rgba(74,88,130,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* TabBar：antd-mobile 的選項卡容器
            activeKey：當前激活的 key（= location.pathname，即 URL 路徑）
            onChange：點擊標籤時回調，調用 navigate(key) 跳轉
            '--adm-color-primary'：CSS 自定義屬性，覆蓋 antd-mobile 主題色 */}
      <TabBar
        activeKey={location.pathname}
        onChange={key => navigate(key)}
        style={{
          '--adm-color-primary': C.primary,
          '--adm-tab-bar-height': '80px',
          backgroundColor: 'transparent',
        }}
      >
        {/* TABS.map：遍歷標籤配置數組，每個生成一個 TabBar.Item
              active：pathname 和 tab.key 相同時為 true
              tab.icon(active)：調用圖標函數，根據激活狀態返回不同顏色的 SVG
              title：自定義渲染，激活時文字加粗+主色，非激活時灰色細體 */}
        {TABS.map(tab => {
          const active = location.pathname === tab.key;
          return (
            <TabBar.Item
              key={tab.key}
              icon={<div style={{ paddingTop: '6px' }}>{tab.icon(active)}</div>}
              title={
                <span style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: active ? '600' : '400',
                  color: active ? C.primary : C.textLight,
                  marginTop: '7px',
                  paddingBottom: '4px',
                }}>
                  {tab.title}
                </span>
              }
            />
          );
        })}
      </TabBar>
    </div>
  );
}
