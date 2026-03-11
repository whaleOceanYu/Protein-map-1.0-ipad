// ═══════════════════════════════════════════════════════════════
// src/main.jsx  ──  整個應用的「啟動入口」
//
// 類比 C/Python：這相當於 main() 函數 或 if __name__ == '__main__':
// 它做一件事：把 React 應用「掛載」到 HTML 頁面上唯一的那個 <div id="root">。
//
// 【React 基礎概念】
//
//  ▸ React 是「描述式 UI」框架：你告訴它「界面長什麼樣」，
//    它負責把 DOM（網頁元素樹）更新到對應的狀態。
//    類比：你寫的是「如果 isLoggedIn == true，顯示地圖；否則顯示登錄頁」，
//    而不是手動調用「把這個元素移走，把那個元素加進來」。
//
//  ▸ JSX 語法（像 <App /> <UserProvider>）：
//    這是 JavaScript 裡混合 HTML 標籤的語法糖，Vite/Babel 會把它
//    編譯成普通的 JavaScript 函數調用。你可以把它看作「UI 模板」。
//
//  ▸ 組件（Component）：
//    每個 <XxxPage /> <XxxButton /> 都是一個函數，接收「屬性（props）」
//    作為參數，返回一段 JSX 描述。類比 C：返回 UI 描述的函數指針。
//
// ═══════════════════════════════════════════════════════════════

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { UserProvider } from './context/UserContext'
import './index.css'

// ReactDOM.createRoot(...).render(...)：
//   找到 HTML 裡 id="root" 的 <div>（見 index.html），
//   把整個 React 組件樹「渲染」（繪製）到那裡。
//   這是一次性的「初始化掛載」，之後所有更新由 React 自動管理。
//
// <React.StrictMode>：
//   開發輔助模式，會在開發環境下故意執行兩次組件函數，
//   幫助發現「有副作用的初始化代碼」。生產環境打包後自動關閉。
//   類比：類似 GCC 的 -Wall 警告選項。
//
// <UserProvider> 包裹整個 <App />：
//   使「當前登錄用戶」的狀態（user、isLoggedIn 等）
//   對所有子頁面和組件都可訪問，無需一層層通過 props 傳遞。
//   類比：相當於全局變量，但有訪問控制——只有在 Provider 內部的
//   組件才能讀取它，且修改必須通過固定接口（login/logout 函數）。

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
)