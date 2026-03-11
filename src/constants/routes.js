// src/constants/routes.js
//
// 集中管理所有路由路徑。
//
// 類比 C 語言：這相當於把所有路徑字符串定義為 #define 常量，
// 避免在各個文件中散落「魔法字符串」（magic strings）。
//
// 使用方式：
//   import { ROUTES } from '../constants/routes';
//   navigate(ROUTES.MAP);             // 跳轉到地圖頁
//   navigate(ROUTES.MENU_FOR(id));    // 跳轉到特定餐廳菜單

export const ROUTES = {
  HOME:    '/',
  LOGIN:   '/login',
  SIGNUP:  '/signup',
  MAP:     '/map',
  MENU:    '/menu/:id',   // 用於 <Route path=...> 的定義，:id 是動態參數
  FRIENDS: '/friends',
  PROFILE: '/profile',

  // 生成帶有具體 id 的菜單路徑，用於 navigate() 和 <Link to=...>
  // 例如：ROUTES.MENU_FOR(3) 返回 '/menu/3'
  MENU_FOR: (id) => `/menu/${id}`,
};
