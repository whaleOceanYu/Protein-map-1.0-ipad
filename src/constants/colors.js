// src/constants/colors.js
//
// 全站色彩常量——方案 H：暖鼠尾草綠（Warm Sage Green × Morandi）
//
// 【設計原則】：
//   - 告別藍紫撞色，統一於暖綠色系——自然、健康、食欲
//   - Morandi 調性保留：所有顏色混入灰度，柔和不攻擊
//   - accent 使用暖琥珀色（terracotta），與綠色互補但不衝突
//
// 【使用方式】：
//   import { C } from '../constants/colors';
//   style={{ color: C.primary }}

export const C = {
  // ── 主色：暖鼠尾草綠 ──────────────────────────
  primary:      '#6B9080',   // 鼠尾草（導航、圖標、進度條）
  primaryLight: '#8BADA2',   // 淺鼠尾草（次要元素）
  primaryDark:  '#3E6854',   // 深鼠尾草（標題、強調文字）
  primaryTint:  '#C4DADA',   // 極淺鼠尾草（心形、淡背景）

  // ── 強調色：暖琥珀 ────────────────────────────
  accent:       '#B07D5A',   // 暖琥珀（CTA 按鈕、重要標籤）
  accentLight:  '#C89D7D',   // 淺琥珀（脂肪欄）
  accentTint:   '#F0E4D6',   // 極淺琥珀（碳水欄、高亮背景）

  // ── 背景與邊框 ────────────────────────────────
  bg:           '#F4F1EC',   // 頁面背景（暖白）
  bgTint:       '#EBE7E0',   // 輸入框/標籤背景
  border:       '#D8D3C8',   // 分隔線/邊框

  // ── 文字 ──────────────────────────────────────
  textDark:     '#2C3530',   // 深色文字（標題、重要信息）
  textLight:    '#7D8E88',   // 淺色文字（副標、說明）
};
