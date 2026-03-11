// src/components/ui/NutritionBar.jsx
//
// 營養比例可視化條，顯示一道菜的蛋白質/脂肪/碳水比例。
// 屬於「UI 組件」，純展示，不含任何業務邏輯。
//
// 【Props 說明】：
//   protein - 蛋白質克數（number）
//   fat     - 脂肪克數（number）
//   carbs   - 碳水化合物克數（number）
//
// 【計算邏輯】：
//   各營養素佔總量的百分比，用 CSS flex 比例渲染為色條。
//   配色（方案 A）：蛋白質=赤陶，脂肪=淺赤陶，碳水=極淺赤陶

import { C } from '../../constants/colors';

export default function NutritionBar({ protein, fat, carbs }) {
  const total = protein + fat + carbs;
  if (total === 0) return null;

  const proteinPct = (protein / total * 100).toFixed(0);
  const fatPct     = (fat     / total * 100).toFixed(0);
  const carbsPct   = (carbs   / total * 100).toFixed(0);

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '2px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ flex: proteinPct, background: C.accent     }} />
        <div style={{ flex: fatPct,     background: C.accentLight }} />
        <div style={{ flex: carbsPct,   background: C.accentTint  }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textLight, marginTop: '4px' }}>
        <span>蛋白 {protein}g</span>
        <span>脂肪 {fat}g</span>
        <span>碳水 {carbs}g</span>
      </div>
    </div>
  );
}
