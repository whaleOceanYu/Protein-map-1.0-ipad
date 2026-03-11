// src/services/restaurantService.js
//
// 餐廳數據的服務層（Data Access Object）。
//
// 【核心設計原則】：
//   所有頁面都通過這裡的函數訪問餐廳數據，而不直接 import data.js。
//   當接入真實後端時，只需修改這個文件的函數實現（把 return mockData
//   改為 await fetch('/api/...')），頁面代碼無需任何改動。
//
// 類比 Python：這相當於一個 RestaurantRepository 類，
//   封裝了所有對「餐廳數據庫」的查詢操作。

import { restaurants as mockData } from '../data/restaurants';

// 獲取所有餐廳（用於 MapPage 列表）
export function getAllRestaurants() {
  return mockData;
}

// 根據 id 獲取單家餐廳（用於 MenuPage）
// 找不到時返回 null，讓調用方決定如何處理
export function getRestaurantById(id) {
  return mockData.find(r => r.id === parseInt(id)) ?? null;
}

// 搜索餐廳（按名稱或菜系，用於 MapPage 搜索欄）
// query 為空字符串時返回全部
export function searchRestaurants(query) {
  if (!query || query.trim() === '') return mockData;
  const q = query.trim().toLowerCase();
  return mockData.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.cuisine.toLowerCase().includes(q)
  );
}

// 按菜系篩選（用於日後的篩選功能）
export function filterByCuisine(cuisine) {
  return mockData.filter(r => r.cuisine === cuisine);
}
