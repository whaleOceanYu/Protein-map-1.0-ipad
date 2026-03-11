import { useState } from 'react';
import { ProgressCircle } from 'antd-mobile';
import { UserOutline, RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import { useUser } from '../context/UserContext';
import { getAllRestaurants } from '../services/restaurantService';
import { ROUTES } from '../constants/routes';
import { C } from '../constants/colors';
import AddFoodSheet from '../components/ui/AddFoodSheet';

const GOALS = ['增肌', '減脂', '保持體重'];

const TARGETS = {
  '增肌':    { kcal: 2294, protein: 104 },
  '減脂':    { kcal: 1668, protein: 116 },
  '保持體重': { kcal: 2085, protein:  93 },
};

// 更符合菜品特色的真實餐飲數據
const MOCK_MEALS = [
  {
    id: 1, meal: '早餐', name: '水煮蛋·牛油果吐司',
    restaurant: 'Nourish Café 活力廚房',
    kcal: 340, protein: 18, fat: 16, carbs: 32, checked: true,
  },
  {
    id: 2, meal: '午餐', name: '香煎雞胸·藜麥沙拉',
    restaurant: '綠盈健康料理',
    kcal: 480, protein: 42, fat: 12, carbs: 38, checked: true,
  },
  {
    id: 3, meal: '晚餐', name: '味噌鮭魚定食',
    restaurant: '清水屋日式料理',
    kcal: 520, protein: 34, fat: 18, carbs: 54, checked: false,
  },
];

const cardStyle = {
  borderRadius: '20px',
  padding: '18px 16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  marginBottom: '12px',
};

// 帶左側色條的區塊標題，避免標題文字「裸露」
const SectionHeader = ({ title, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '3px', height: '15px', borderRadius: '2px', background: C.primary, flexShrink: 0 }} />
      <span style={{ fontWeight: '600', fontSize: '15px', color: C.primaryDark }}>{title}</span>
    </div>
    {right && <span style={{ fontSize: '12px', color: C.textLight }}>{right}</span>}
  </div>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, likedIds, goal, setGoal, isGuest } = useUser();
  const likedRestaurants = getAllRestaurants().filter(r => likedIds.has(r.id));

  // 訪客模式：無飲食記錄；登入用戶顯示 mock 數據
  const [meals, setMeals] = useState(isGuest ? [] : MOCK_MEALS);
  const [addFoodOpen, setAddFoodOpen] = useState(false);

  const displayUser = isGuest
    ? { name: '訪客', age: '--', height: '--', weight: '--' }
    : (user ?? { name: '訪客', age: '--', height: '--', weight: '--' });

  const checkedMeals   = meals.filter(m => m.checked);
  const totalKcal      = checkedMeals.reduce((s, m) => s + m.kcal, 0);
  const totalProtein   = checkedMeals.reduce((s, m) => s + m.protein, 0);
  const targetKcal     = TARGETS[goal]?.kcal    ?? 2085;
  const targetProtein  = TARGETS[goal]?.protein ?? 93;
  const remainingKcal  = targetKcal - totalKcal;
  const kcalExceeded   = remainingKcal < 0;

  const toggleMeal = (id) =>
    setMeals(ms => ms.map(m => m.id === id ? { ...m, checked: !m.checked } : m));

  const deleteMeal = (id) =>
    setMeals(ms => ms.filter(m => m.id !== id));

  return (
    /* 外層隱藏原生滾動條，保持 BottomNav 位置穩定 */
    <div style={{ maxWidth: '900px', margin: '0 auto', height: '100dvh', overflow: 'hidden', background: C.bg }}>
      <div className="hide-scrollbar" style={{ height: '100%', overflowY: 'auto', padding: '20px 14px 108px' }}>

        {/* ── 1. 個人信息 ─────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '4px 0' }}>
            <div style={{
              width: 62, height: 62, borderRadius: 31, flexShrink: 0,
              background: C.bgTint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserOutline style={{ fontSize: 28, color: C.primary }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '20px', color: C.textDark, lineHeight: 1.2 }}>
                {displayUser.name}
              </div>
              <div style={{ fontSize: '13px', color: C.textLight, marginTop: '5px' }}>
                {displayUser.age !== '--'
                  ? `${displayUser.age} 歲 · ${displayUser.height} cm · ${displayUser.weight} kg`
                  : '點此設置個人資料'}
              </div>
            </div>
          </div>

          {/* 健康目標選擇器（去掉標籤文字，直接呈現） */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
            {GOALS.map(g => (
              <div
                key={g}
                onClick={() => setGoal(g)}
                style={{
                  flex: 1, textAlign: 'center',
                  padding: '8px 0', borderRadius: '12px',
                  background: goal === g ? C.primary : C.bgTint,
                  color: goal === g ? 'white' : C.textLight,
                  fontSize: '13px', fontWeight: goal === g ? '600' : '400',
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${goal === g ? C.primary : 'transparent'}`,
                }}
              >
                {g}
              </div>
            ))}
          </div>

        </div>

        {/* ── 2. 今日追蹤（雙環圖） ────────────────────── */}
        <div style={cardStyle}>
          <SectionHeader title="今日追蹤" right={new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              {/* scaleX(-1) 使進度條逆時針方向消耗 */}
              <div style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>
                <ProgressCircle
                  percent={kcalExceeded ? 0 : Math.round((remainingKcal / targetKcal) * 100)}
                  style={{ '--size': '104px', '--fill-color': kcalExceeded ? C.accent : C.primary, '--track-color': C.bgTint }}
                >
                  {/* 再次翻轉，讓文字方向恢復正常 */}
                  <div style={{ transform: 'scaleX(-1)' }}>
                    <div style={{ fontSize: kcalExceeded ? '12px' : '15px', fontWeight: '700', color: kcalExceeded ? C.accent : C.primaryDark, lineHeight: 1 }}>
                      {kcalExceeded ? `+${-remainingKcal}` : remainingKcal}
                      <span style={{ fontSize: '9px', fontWeight: '400', marginLeft: '1px' }}>kcal</span>
                    </div>
                    {kcalExceeded && (
                      <div style={{ fontSize: '10px', color: C.accent, marginTop: '2px' }}>超出</div>
                    )}
                  </div>
                </ProgressCircle>
              </div>
              <div style={{ fontSize: '11px', color: C.textLight, marginTop: '8px' }}>目標 {targetKcal} kcal</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ProgressCircle
                percent={Math.min(100, Math.round((totalProtein / targetProtein) * 100))}
                style={{ '--size': '104px', '--fill-color': C.accent, '--track-color': C.bgTint }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: C.primaryDark, lineHeight: 1 }}>{totalProtein}g</div>
                  <div style={{ fontSize: '10px', color: C.textLight, marginTop: '2px' }}>蛋白質</div>
                </div>
              </ProgressCircle>
              <div style={{ fontSize: '11px', color: C.textLight, marginTop: '8px' }}>目標 {targetProtein} g</div>
            </div>
          </div>
        </div>

        {/* ── 3. 收藏餐廳 ──────────────────────────────── */}
        {likedRestaurants.length > 0 && (
          <div style={cardStyle}>
            <SectionHeader title="收藏的餐廳" right={`${likedRestaurants.length} 家`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {likedRestaurants.map(r => (
                <div
                  key={r.id}
                  onClick={() => navigate(ROUTES.MENU_FOR(r.id))}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.primaryTint}, ${C.bgTint})`,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {r.image
                      ? <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '16px', fontWeight: '700', color: C.primary }}>{r.name[0]}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: '12px', color: C.textLight, marginTop: '2px' }}>
                      {r.cuisine} · {r.priceRange}
                    </div>
                  </div>
                  <RightOutline style={{ color: C.primaryLight, fontSize: '15px', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4 & 5. 今日飲食記錄 ──────────────────────── */}
        <div style={cardStyle}>
          <SectionHeader
            title="今日飲食記錄"
            right={`已記錄 ${checkedMeals.length} / ${meals.length}`}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {meals.map(meal => (
              <div
                key={meal.id}
                style={{
                  borderRadius: '14px', padding: '11px 12px',
                  background: meal.checked ? 'rgba(107,144,128,0.08)' : C.bgTint,
                  border: `1.5px solid ${meal.checked ? C.primaryTint : 'transparent'}`,
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}
              >
                {/* 打勾圓圈 */}
                <div onClick={() => toggleMeal(meal.id)} style={{ flexShrink: 0, cursor: 'pointer', paddingTop: '1px' }}>
                  {meal.checked ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill={C.primary} />
                      <path d="M7.5 12l3 3 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke={C.border} strokeWidth="1.8" />
                    </svg>
                  )}
                </div>

                {/* 食物信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: C.textDark }}>{meal.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: meal.checked ? C.primary : C.textLight }}>
                        {meal.kcal} kcal
                      </div>
                      <div onClick={() => deleteMeal(meal.id)} style={{ cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={C.textLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textLight, marginTop: '2px' }}>
                    {meal.meal} · {meal.restaurant}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '7px' }}>
                    {[
                      { label: '蛋白質', val: meal.protein, unit: 'g' },
                      { label: '脂肪',   val: meal.fat,     unit: 'g' },
                      { label: '碳水',   val: meal.carbs,   unit: 'g' },
                    ].map(n => (
                      <div key={n.label} style={{ fontSize: '11px', color: C.textLight }}>
                        <span style={{ fontWeight: '600', color: C.textDark }}>{n.val}{n.unit}</span>
                        {' '}{n.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 添加食物 */}
          <div style={{ marginTop: '12px' }}>
            <div
              onClick={() => setAddFoodOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px', borderRadius: '12px',
                border: `1.5px dashed ${C.border}`,
                cursor: 'pointer', color: C.primary, fontWeight: '600', fontSize: '14px',
                background: 'transparent', transition: 'background 0.15s',
              }}
            >
              + 添加食物
            </div>
          </div>

          {/* 查看本月飲食記錄 */}
          <div style={{ marginTop: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: C.primary, cursor: 'pointer', fontWeight: '500' }}>
              查看本月飲食記錄
            </span>
          </div>
        </div>

        {/* ── 修改個人資料 ─────────────────────────────── */}
        <div
          style={{
            borderRadius: '20px',
            padding: '14px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            marginBottom: '12px',
            textAlign: 'center',
            fontSize: '14px', fontWeight: '600', color: C.primaryDark,
            cursor: 'pointer',
            border: `1.5px solid ${C.border}`,
          }}
        >
          修改個人資料
        </div>

      </div>
      <BottomNav />

      {/* AddFood overlay */}
      {addFoodOpen && (
        <AddFoodSheet
          onAdd={meal => setMeals(prev => [...prev, meal])}
          onClose={() => setAddFoodOpen(false)}
        />
      )}
    </div>
  );
}
