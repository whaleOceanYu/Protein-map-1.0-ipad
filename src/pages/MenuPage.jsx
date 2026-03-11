import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../services/restaurantService';
import { useUser } from '../context/UserContext';
import { ROUTES } from '../constants/routes';
import { C } from '../constants/colors';

// tier 2 = 高度推薦，tier 1 = 較推薦，tier 0 = 不標記
function getDishTier(dish, isGain) {
  const k = dish.protein * 4 + dish.fat * 9 + dish.carbs * 4;
  const proteinPct = dish.protein * 4 / k;
  if (isGain) {
    if (dish.protein >= 35 && proteinPct >= 0.28) return 2;
    if (dish.protein >= 28 && proteinPct >= 0.22) return 1;
  } else {
    if (proteinPct >= 0.26 && dish.fat <= 18 && k < 480) return 2;
    if (proteinPct >= 0.18 && dish.fat < 22 && k < 550) return 1;
  }
  return 0;
}

export default function MenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goal: userGoal } = useUser();
  const initTab = userGoal === '減脂' ? '減脂' : '增肌';
  const [activeTab, setActiveTab] = useState(initTab);

  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: C.textLight, background: C.bg, minHeight: '100dvh' }}>
        <div style={{ fontSize: '14px', marginBottom: '16px' }}>找不到此餐廳</div>
        <div
          onClick={() => navigate(ROUTES.MAP)}
          style={{ display: 'inline-block', color: C.primary, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
        >
          ← 返回地圖
        </div>
      </div>
    );
  }

  const isGain = activeTab === '增肌';
  const kcal = d => d.protein * 4 + d.fat * 9 + d.carbs * 4;

  // 高度推薦 → 較推薦 → 普通；同級內按主要指標排序
  const sortedDishes = [...restaurant.dishes].sort((a, b) => {
    const ta = getDishTier(a, isGain), tb = getDishTier(b, isGain);
    if (tb !== ta) return tb - ta;
    return isGain ? b.protein - a.protein : kcal(a) - kcal(b);
  });

  const isUserPlanTab = (tab) =>
    (userGoal === '增肌' && tab === '增肌') ||
    (userGoal === '減脂' && tab === '減脂');

  const distLabel = restaurant.distance != null
    ? (restaurant.distance < 1000 ? restaurant.distance + 'm' : (restaurant.distance / 1000).toFixed(1) + 'km')
    : null;

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', minHeight: '100dvh', background: C.bg }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(244,241,236,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '10px 16px 0',
      }}>
        {/* Back button left of all info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div
            onClick={() => navigate(ROUTES.MAP)}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: C.bgTint, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={C.primaryDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>

          {/* Info block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + cuisine/price/dist + Maps button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: C.primaryDark, lineHeight: 1.3, flexShrink: 0 }}>
                {restaurant.name}
              </div>
              <div style={{ fontSize: '12px', color: C.textLight, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {restaurant.cuisine} · {restaurant.priceRange}{distLabel && ` · ${distLabel}`}
              </div>
              {restaurant.googleMapsUrl && (
                <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: C.bgTint, border: `1px solid ${C.border}`, textDecoration: 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke={C.primaryDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Phone + address pills */}
            {(restaurant.phone || restaurant.address) && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', overflow: 'hidden' }}>
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: C.bgTint, borderRadius: '20px', padding: '4px 10px',
                    fontSize: '11px', color: C.primaryDark, textDecoration: 'none', flexShrink: 0,
                    border: `1px solid ${C.border}`,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
                    </svg>
                    {restaurant.phone}
                  </a>
                )}
                {restaurant.address && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: C.bgTint, borderRadius: '20px', padding: '4px 10px',
                    fontSize: '11px', color: C.textLight, minWidth: 0, flex: 1,
                    border: `1px solid ${C.border}`,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {restaurant.address}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ height: '10px' }} />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '12px' }}>
          {['增肌', '減脂'].map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: 'center', padding: '8px 0',
                borderRadius: '999px', cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                background: activeTab === tab ? C.primary : C.bgTint,
                color: activeTab === tab ? 'white' : C.textLight,
                transition: 'all 0.15s',
              }}
            >
              {tab === '增肌' ? (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.5 6.5h11M6.5 17.5h11M4 9.5H2m20 0h-2M4 14.5H2m20 0h-2M4 9.5v5M20 9.5v5"/>
                    </svg>
                    增肌推薦
                  </span>
                  {isUserPlanTab('增肌') && <span style={{ position: 'absolute', left: '100%', marginLeft: '3px', fontSize: '10px', opacity: 0.85, whiteSpace: 'nowrap' }}>(你的方案)</span>}
                </span>
              ) : (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.7 8.66C13.55 21.1 12.8 22 12 22s-1.55-.9-2.3-2.34A9 9 0 0 1 12 2z"/>
                      <path d="M12 2c-2 4-2 8 0 14"/>
                    </svg>
                    減脂推薦
                  </span>
                  {isUserPlanTab('減脂') && <span style={{ position: 'absolute', left: '100%', marginLeft: '3px', fontSize: '10px', opacity: 0.85, whiteSpace: 'nowrap' }}>(你的方案)</span>}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dish list */}
      <div style={{ padding: '12px 14px 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedDishes.map(dish => {
          const dishKcal = kcal(dish);
          const tier = getDishTier(dish, isGain);
          return (
            <div
              key={dish.id}
              style={{
                borderRadius: '16px',
                padding: '12px',
                background: tier === 2 ? 'rgba(107,144,128,0.09)' : tier === 1 ? 'rgba(107,144,128,0.04)' : 'rgba(255,255,255,0.9)',
                border: `1.5px solid ${tier > 0 ? C.primaryTint : 'transparent'}`,
                boxShadow: tier > 0 ? '0 2px 10px rgba(107,144,128,0.10)' : '0 1px 6px rgba(0,0,0,0.04)',
                display: 'flex', gap: '11px', alignItems: 'flex-start',
              }}
            >
              {/* Dish image */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.primaryTint}, ${C.bgTint})`,
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {dish.image
                  ? <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '22px', fontWeight: '700', color: C.primary }}>{dish.name[0]}</span>
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: name + price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: C.textDark, lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                    {dish.name}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: C.accent, flexShrink: 0 }}>${dish.price}</span>
                </div>

                {/* Row 2: kcal + tier badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: C.textLight }}>{dishKcal} kcal</span>
                  {tier === 2 && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: C.primary, borderRadius: '10px', padding: '2px 8px', letterSpacing: '0.02em' }}>
                      高度推薦
                    </span>
                  )}
                  {tier === 1 && (
                    <span style={{ fontSize: '10px', fontWeight: '600', color: C.primary, background: C.primaryTint, borderRadius: '10px', padding: '2px 8px' }}>
                      較推薦
                    </span>
                  )}
                </div>

                {/* Row 3: macros */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  {[
                    { label: '蛋白質', val: dish.protein, color: C.primary },
                    { label: '脂肪',   val: dish.fat,     color: C.accent },
                    { label: '碳水',   val: dish.carbs,   color: C.textLight },
                  ].map(n => (
                    <div key={n.label} style={{ fontSize: '11px', color: C.textLight }}>
                      <span style={{ fontWeight: '600', color: n.color }}>{n.val}g</span> {n.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: 'center', color: C.textLight, fontSize: '12px', marginTop: '4px' }}>
          ⚡ 營養數據為 AI 估算，僅供參考
        </div>
      </div>
    </div>
  );
}
