// ═══════════════════════════════════════════════════════════════
// src/pages/Signup.jsx  ──  新用戶注冊頁面
//
// 讓新用戶填寫個人資料（姓名、電郵、密碼、健身目標、身體數據、飲食需求），
// 完成後自動登錄並跳轉到地圖頁。
//
// 【組件複用】
//   SectionLabel、FieldLabel、PillInput 是本文件內部的小組件，
//   避免重複的 style 代碼——類比 C 裡封裝重複的 printf 格式。
//
// 【表單狀態】
//   所有字段存在一個 form 對象 state 裡：
//   const [form, setForm] = useState({name:'', email:'', ...})
//   修改字段用 set('name', value) → setForm(prev => ({...prev, name: value}))
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockSignup } from '../services/userService';
import { ROUTES } from '../constants/routes';
import { C } from '../constants/colors';

// 健身目標選項（固定三個）
const HEALTH_GOALS = ['增肌', '減脂', '保持體重'];

// 飲食需求選項（可多選）
const DIETARY_OPTIONS = [
  { label: '素食',     value: '素食'     },
  { label: '純素',     value: '純素'     },
  { label: '無麩質',   value: '無麩質'   },
  { label: '無乳糖',   value: '無乳糖'   },
  { label: '低鈉',     value: '低鈉'     },
  { label: '低糖',     value: '低糖'     },
  { label: '高纖維',   value: '高纖維'   },
  { label: '堅果過敏', value: '堅果過敏' },
];

// 區塊標題（帶左側豎線裝飾）——函數組件最簡形式：props → JSX
const SectionLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '18px', marginTop: '28px' }}>
    <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: C.primary, flexShrink: 0 }} />
    <span style={{ fontSize: '13px', fontWeight: '700', color: C.primaryDark, letterSpacing: '0.04em' }}>
      {children}
    </span>
  </div>
);

// 字段標題（輸入框上方的小標籤）
const FieldLabel = ({ children }) => (
  <div style={{ fontSize: '12px', fontWeight: '600', color: C.textLight, letterSpacing: '0.03em', marginBottom: '7px', marginTop: '14px' }}>
    {children}
  </div>
);

// 圓角膠囊輸入框——受控組件（value 綁定外部 state，onChange 回調更新 state）
// 類比：GTK Entry 控件，帶 changed 信號回調
const PillInput = ({ type = 'text', placeholder, value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)} // 解包 DOM 事件，只傳純值給父組件
    style={{
      width: '100%', boxSizing: 'border-box', // box-sizing: padding 不超出 width
      background: C.bgTint, border: 'none', outline: 'none',
      borderRadius: '14px', padding: '13px 16px',
      fontSize: '15px', color: C.textDark,
      fontFamily: 'inherit',
    }}
  />
);

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useUser();

  // 所有輸入字段統一放在一個對象 state 裡（類比 Python dict）
  const [form, setForm] = useState({
    name: '', email: '', password: '', goal: '增肌',
    targetWeight: '', age: '', height: '', weight: '',
    dietary: [], // 可多選的飲食需求數組
  });
  const [error, setError] = useState('');

  // 修改 form 中指定字段的通用函數
  // [field] 是計算屬性鍵——field 是變量名，方括號讓它成為鍵名
  // 類比 Python：new_form = {**form, field: value}
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // 切換飲食需求標籤的選中狀態（多選）
  // 已選中：filter 移除；未選中：展開追加
  const toggleDietary = (val) => {
    setForm(prev => ({
      ...prev,
      dietary: prev.dietary.includes(val)
        ? prev.dietary.filter(v => v !== val)  // 移除
        : [...prev.dietary, val],               // 追加
    }));
  };

  // 點擊「完成設置」按鈕：調用服務層校驗，成功則登錄並跳轉
  const handleSignup = () => {
    const result = mockSignup(form);
    if (result.success) { login(result.user); navigate(ROUTES.MAP); }
    else setError(result.error);
  };

  return (
    <div className="hide-scrollbar" style={{
      maxWidth: '450px', margin: '0 auto', height: '100dvh', overflowY: 'auto',
      background: `linear-gradient(160deg, ${C.bg} 0%, ${C.bgTint} 100%)`,
      padding: '40px 20px 56px',
    }}>

      {/* 標題 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: C.primaryDark, lineHeight: 1.15 }}>
          建立你的檔案
        </div>
        <div style={{ fontSize: '14px', color: C.textLight, marginTop: '8px', lineHeight: 1.6 }}>
          幫助我們為你推薦最適合的餐廳
        </div>
      </div>

      {/* 卡片 */}
      <div style={{
        background: 'rgba(255,255,255,0.92)', borderRadius: '28px',
        padding: '24px 20px 28px', backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>

        {/* ── 帳戶信息 ── */}
        <SectionLabel>帳戶信息</SectionLabel>

        <FieldLabel>姓名</FieldLabel>
        <PillInput placeholder="請輸入姓名" value={form.name} onChange={v => set('name', v)} />

        <FieldLabel>電郵</FieldLabel>
        <PillInput type="email" placeholder="請輸入電郵" value={form.email} onChange={v => set('email', v)} />

        <FieldLabel>密碼</FieldLabel>
        <PillInput type="password" placeholder="至少 6 位字符" value={form.password} onChange={v => set('password', v)} />

        {/* ── 健身目標 ── */}
        <SectionLabel>健身目標</SectionLabel>

        <div style={{ display: 'flex', gap: '10px' }}>
          {HEALTH_GOALS.map(g => (
            <div
              key={g}
              onClick={() => set('goal', g)}
              style={{
                flex: 1, textAlign: 'center', padding: '12px 6px',
                borderRadius: '14px', cursor: 'pointer',
                background: form.goal === g ? C.primary : C.bgTint,
                color: form.goal === g ? 'white' : C.textLight,
                fontSize: '14px', fontWeight: form.goal === g ? '600' : '400',
                transition: 'all 0.15s',
              }}
            >
              {g}
            </div>
          ))}
        </div>

        <FieldLabel>目標體重 (kg)（可選）</FieldLabel>
        <PillInput type="number" placeholder="例如 70" value={form.targetWeight} onChange={v => set('targetWeight', v)} />

        {/* ── 身體數據 ── */}
        <SectionLabel>身體數據</SectionLabel>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>年齡</FieldLabel>
            <PillInput type="number" placeholder="25" value={form.age} onChange={v => set('age', v)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>身高 (cm)</FieldLabel>
            <PillInput type="number" placeholder="168" value={form.height} onChange={v => set('height', v)} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>體重 (kg)</FieldLabel>
            <PillInput type="number" placeholder="65" value={form.weight} onChange={v => set('weight', v)} />
          </div>
        </div>

        {/* ── 飲食需求 ── */}
        <SectionLabel>特定飲食需求</SectionLabel>
        <div style={{ fontSize: '12px', color: C.textLight, marginTop: '-10px', marginBottom: '14px' }}>
          可多選，我們會優先推薦符合你需求的餐廳
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DIETARY_OPTIONS.map(opt => {
            const active = form.dietary.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleDietary(opt.value)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: active ? '600' : '400',
                  background: active ? C.primary : C.bgTint,
                  color: active ? 'white' : C.textLight,
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div style={{ color: '#B85C4A', fontSize: '13px', textAlign: 'center',
            marginTop: '18px', padding: '10px 14px', background: '#FDF0EE', borderRadius: '12px' }}>
            {error}
          </div>
        )}

        {/* 提交按鈕 */}
        <div
          onClick={handleSignup}
          style={{
            marginTop: '28px', width: '100%', padding: '15px',
            background: C.primary, color: 'white', borderRadius: '16px',
            textAlign: 'center', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', letterSpacing: '0.02em',
            boxShadow: `0 4px 18px rgba(107,144,128,0.35)`,
          }}
        >
          完成設置，開始使用
        </div>

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: C.textLight }}>已有帳戶？</span>
          <span
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{ fontSize: '13px', color: C.primary, fontWeight: '600', cursor: 'pointer', marginLeft: '4px' }}
          >
            登入
          </span>
        </div>
      </div>
    </div>
  );
}
