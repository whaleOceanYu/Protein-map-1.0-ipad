// src/pages/MapPage.jsx  —— iPad 版（雙欄佈局）

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SearchBar } from 'antd-mobile';
import BottomNav from '../components/layout/BottomNav';
import { getAllRestaurants, searchRestaurants, getRestaurantById } from '../services/restaurantService';
import { useUser } from '../context/UserContext';
import { C } from '../constants/colors';

const RESTAURANT_COORDS = {
  1:  [22.2810243166764, 114.172897835560],
  2:  [22.2815930012462, 114.173665076404],
  3:  [22.2830597247851, 114.172792128012],
  4:  [22.2810540999861, 114.172897835560],
  5:  [22.2803520463179, 114.171771776052],
  6:  [22.2776412996342, 114.175305688008],
  7:  [22.2763254557215, 114.171484443656],
  8:  [22.2761393383449, 114.172725745871],
  9:  [22.2777931632546, 114.179134273324],
  10: [22.2796239511511, 114.178490088971],
  11: [22.2754416797655, 114.171611658365],
  12: [22.2768672468736, 114.171360855277],
  13: [22.2791599723523, 114.176864181646],
  14: [22.2802827520687, 114.176347345668],
  15: [22.2789525789672, 114.176429045505],
  16: [22.2761385877836, 114.173730491342],
};

const getMatchCount = (restaurant, goal) => {
  return restaurant.dishes.filter(d => {
    const k = d.protein * 4 + d.fat * 9 + d.carbs * 4;
    const pct = d.protein * 4 / k;
    const gainOk = d.protein >= 28 && pct >= 0.22;
    const loseOk = pct >= 0.18 && d.fat < 22 && k < 550;
    if (goal === '增肌') return gainOk;
    if (goal === '減脂') return loseOk;
    return gainOk || loseOk;
  }).length;
};

const sortRestaurants = (list, filter, userGoal) => {
  const copy = [...list];
  if (filter === '價格') return copy.sort((a, b) => a.priceRange.length - b.priceRange.length);
  if (filter === '營養') return copy.sort((a, b) => getMatchCount(b, userGoal) - getMatchCount(a, userGoal));
  return copy;
};

const FILTERS = ['營養', '距離', '價格'];

const floatPill = {
  background: 'rgba(255,255,255,0.93)',
  backdropFilter: 'blur(12px)',
  borderRadius: '20px',
  boxShadow: '0 2px 12px rgba(62,104,84,0.13)',
  border: '1.5px solid rgba(107,144,128,0.28)',
};

const createMarkerIcon = (restaurant, isSelected, matchCount, zoomTier, showName) => {
  const fill = isSelected ? C.primaryDark : C.primary;

  if (zoomTier === 0) {
    const size = isSelected ? 13 : 8;
    return L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};box-shadow:0 1px 5px rgba(0,0,0,0.28);border:2px solid rgba(255,255,255,0.9);"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  const nameHtml = showName
    ? `<div style="margin-top:4px;background:rgba(255,255,255,0.93);backdrop-filter:blur(10px);border-radius:12px;padding:3px 9px;font-size:11px;font-weight:600;color:${C.primaryDark};white-space:nowrap;box-shadow:0 2px 10px rgba(62,104,84,0.18);border:1px solid rgba(107,144,128,0.22);pointer-events:auto;">${restaurant.name}</div>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="display:inline-flex;align-items:flex-start;gap:5px;pointer-events:none;">
        <div style="position:relative;width:36px;height:48px;flex-shrink:0;filter:drop-shadow(0 3px 6px rgba(62,104,84,0.3));">
          <svg width="36" height="48" viewBox="0 0 32 42" fill="none">
            <path d="M16 0C7.16 0 0 7.16 0 16C0 25.5 16 42 16 42C16 42 32 25.5 32 16C32 7.16 24.84 0 16 0Z" fill="${fill}"/>
            <circle cx="16" cy="16" r="10.5" fill="white" fill-opacity="0.95"/>
          </svg>
          <div style="position:absolute;top:0;left:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${fill};font-family:'DM Sans',sans-serif;">${matchCount}</div>
        </div>
        ${nameHtml}
      </div>
    `,
    iconSize: [220, 48],
    iconAnchor: [18, 48],
  });
};

function MapController({ setZoom, mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    setZoom(map.getZoom());
    map.setView([22.2800, 114.1740], 15, { animate: false });
  }, [map]); // eslint-disable-line
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  return null;
}

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

// ── iPad 版詳情面板（在側邊欄內顯示）──────────────────────────
function RestaurantDetail({ restaurant, onBack, userGoal, dishSearch }) {
  const initTab = userGoal === '減脂' ? '減脂' : '增肌';
  const [activeTab, setActiveTab] = useState(initTab);
  const isGain = activeTab === '增肌';
  const kcal = d => d.protein * 4 + d.fat * 9 + d.carbs * 4;

  const sortedDishes = [...restaurant.dishes].sort((a, b) => {
    const ta = getDishTier(a, isGain), tb = getDishTier(b, isGain);
    if (tb !== ta) return tb - ta;
    return isGain ? b.protein - a.protein : kcal(a) - kcal(b);
  });

  const displayDishes = dishSearch
    ? sortedDishes.filter(d => d.name.includes(dishSearch))
    : sortedDishes;

  const distLabel = restaurant.distance != null
    ? (restaurant.distance < 1000 ? restaurant.distance + 'm' : (restaurant.distance / 1000).toFixed(1) + 'km')
    : null;

  const isUserPlanTab = (tab) =>
    (userGoal === '增肌' && tab === '增肌') ||
    (userGoal === '減脂' && tab === '減脂');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={onBack}
            style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '18px', color: C.primaryDark, lineHeight: 1.3, flexShrink: 0 }}>
                {restaurant.name}
              </div>
              {restaurant.googleMapsUrl && (
                <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    flexShrink: 0, width: '30px', height: '30px', borderRadius: '50%',
                    background: C.bgTint, border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.primaryDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </a>
              )}
            </div>
            <div style={{ fontSize: '13px', color: C.textLight, marginTop: '3px' }}>
              {restaurant.cuisine} · {restaurant.priceRange}{distLabel && ` · ${distLabel}`}
            </div>
            {(restaurant.phone || restaurant.address) && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    background: C.bgTint, borderRadius: '20px', padding: '4px 10px',
                    fontSize: '12px', color: C.primaryDark, textDecoration: 'none', flexShrink: 0,
                    border: `1px solid ${C.border}`,
                  }}>
                    📞 {restaurant.phone}
                  </a>
                )}
                {restaurant.address && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    background: C.bgTint, borderRadius: '20px', padding: '4px 10px',
                    fontSize: '12px', color: C.textLight, minWidth: 0, flex: 1,
                    border: `1px solid ${C.border}`,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    📍 {restaurant.address}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '10px', padding: '10px 14px 8px', flexShrink: 0, background: 'rgba(255,255,255,0.85)' }}>
        {['增肌', '減脂'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              fontSize: '14px',
              background: activeTab === tab ? C.primary : C.bgTint,
              color: activeTab === tab ? 'white' : C.textLight,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              {tab === '增肌' ? '💪' : '🌿'}
              {tab}推薦
              {isUserPlanTab(tab) && <span style={{ fontSize: '11px', opacity: 0.8 }}>(你的方案)</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Dish list */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayDishes.map(dish => {
            const dishKcal = kcal(dish);
            const tier = getDishTier(dish, isGain);
            return (
              <div
                key={dish.id}
                style={{
                  borderRadius: '16px', padding: '12px 14px',
                  background: tier === 2 ? 'rgba(107,144,128,0.10)' : tier === 1 ? 'rgba(107,144,128,0.04)' : 'rgba(255,255,255,0.9)',
                  border: `1.5px solid ${tier > 0 ? C.primaryTint : 'transparent'}`,
                  backdropFilter: 'blur(8px)',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0,
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: C.textDark, lineHeight: 1.3, flex: 1, minWidth: 0 }}>
                      {dish.name}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: C.accent, flexShrink: 0 }}>${dish.price}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '13px', color: C.textLight }}>{dishKcal} kcal</span>
                    {tier === 2 && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: C.primary, borderRadius: '8px', padding: '2px 8px' }}>
                        高度推薦
                      </span>
                    )}
                    {tier === 1 && (
                      <span style={{ fontSize: '10px', fontWeight: '600', color: C.primary, background: C.primaryTint, borderRadius: '8px', padding: '2px 8px' }}>
                        較推薦
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                    {[['蛋白', dish.protein, C.primary], ['脂肪', dish.fat, C.accent], ['碳水', dish.carbs, C.textLight]].map(([l, v, c]) => (
                      <span key={l} style={{ fontSize: '12px', color: C.textLight }}>
                        <span style={{ fontWeight: '600', color: c }}>{v}g</span> {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {displayDishes.length === 0 && dishSearch && (
          <div style={{ textAlign: 'center', color: C.textLight, fontSize: '14px', padding: '32px 0' }}>
            找不到「{dishSearch}」相關菜品
          </div>
        )}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <div style={{ color: C.textLight, fontSize: '12px' }}>⚡ 營養數據為 AI 估算，僅供參考</div>
        </div>
      </div>
    </div>
  );
}

// ── 側邊欄餐廳列表 ────────────────────────────────────────────
function RestaurantSidebar({
  restaurants, selectedId, searchQuery, activeFilter, displayId, detailRestaurant,
  detailSearchQuery, onSearchChange, onFilterChange, onSelectCard, onViewDetail, onBackFromDetail,
  userGoal, likedIds, toggleLike,
}) {
  const panelRef = useRef(null);

  if (displayId && detailRestaurant) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 詳情搜索欄 */}
        <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>
          <div style={{ ...floatPill, overflow: 'hidden' }}>
            <SearchBar
              key="dish-search"
              placeholder='搜尋菜品名稱⋯'
              showCancelButton={() => false}
              value={detailSearchQuery}
              onChange={v => onSearchChange(v, true)}
              onClear={() => onSearchChange('', true)}
              style={{ '--background': 'transparent', '--border-radius': '0', '--height': '52px', '--font-size': '16px' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <RestaurantDetail
            restaurant={detailRestaurant}
            onBack={onBackFromDetail}
            userGoal={userGoal}
            dishSearch={detailSearchQuery}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索欄 */}
      <div style={{ padding: '12px 14px 8px', flexShrink: 0 }}>
        <div style={{ ...floatPill, overflow: 'hidden' }}>
          <SearchBar
            key="rest-search"
            placeholder='搜尋餐廳或菜系⋯'
            showCancelButton={() => false}
            value={searchQuery}
            onChange={v => onSearchChange(v, false)}
            onClear={() => onSearchChange('', false)}
            style={{ '--background': 'transparent', '--border-radius': '0', '--height': '52px', '--font-size': '16px' }}
          />
        </div>
      </div>

      {/* 篩選器 + 標題 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px 10px', flexShrink: 0 }}>
        <span style={{
          fontSize: '13px', color: C.textLight, fontWeight: '500',
          background: 'rgba(235,231,224,0.92)', borderRadius: '16px', padding: '5px 11px',
          backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          附近餐廳{searchQuery ? ` · ${restaurants.length} 家` : ''}
        </span>
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          {FILTERS.map(label => (
            <div
              key={label}
              onClick={() => onFilterChange(label)}
              style={{
                ...floatPill,
                padding: '5px 12px', fontSize: '13px', fontWeight: '600',
                color: activeFilter === label ? 'white' : C.primaryDark,
                background: activeFilter === label ? C.primary : 'rgba(255,255,255,0.93)',
                cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* 餐廳列表 */}
      <div
        ref={panelRef}
        className="hide-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {restaurants.length === 0 && (
          <div style={{ ...floatPill, padding: '18px', textAlign: 'center', color: C.textLight, fontSize: '15px' }}>
            找不到相關餐廳
          </div>
        )}
        {restaurants.map(r => {
          const matchCount = getMatchCount(r, userGoal);
          const isSelected = selectedId === r.id;
          const isLiked = likedIds.has(r.id);
          return (
            <div
              id={`r-card-${r.id}`}
              key={r.id}
              onClick={() => onSelectCard(r.id)}
              style={{
                background: isSelected ? 'rgba(200,218,210,0.97)' : 'rgba(255,254,252,0.95)',
                backdropFilter: 'blur(14px)',
                borderRadius: '18px',
                padding: '14px 16px',
                border: `1.5px solid ${isSelected ? C.primary : 'rgba(255,255,255,0.75)'}`,
                boxShadow: isSelected ? `0 6px 20px rgba(62,104,84,0.18)` : 'none',
                cursor: 'pointer', flexShrink: 0,
                transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '14px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.primaryTint}, ${C.bgTint})`,
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.image
                    ? <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '26px', fontWeight: '700', color: C.primary }}>{r.name[0]}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '17px', color: C.primaryDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '8px' }}>
                      {r.name}
                    </div>
                    <div onClick={e => { e.stopPropagation(); toggleLike(r.id); }} style={{ flexShrink: 0, cursor: 'pointer', lineHeight: 1, padding: '4px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? C.accent : 'none'}
                        stroke={isLiked ? C.accent : C.textLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: C.textLight, marginTop: '4px' }}>
                    {r.cuisine} · {r.priceRange}
                    {r.distance != null && ` · ${r.distance < 1000 ? r.distance + 'm' : (r.distance / 1000).toFixed(1) + 'km'}`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: isSelected ? 'rgba(62,104,84,0.12)' : C.bgTint,
                      borderRadius: '10px', padding: '4px 10px',
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: C.primary }}>{matchCount}</span>
                      <span style={{ fontSize: '12px', color: C.textLight }}>道符合健康目標</span>
                    </div>
                    <div
                      onClick={e => onViewDetail(e, r.id)}
                      style={{
                        fontSize: '13px', fontWeight: '600', color: C.primaryDark,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        background: isSelected ? 'rgba(62,104,84,0.14)' : C.bgTint,
                        border: `1px solid ${isSelected ? C.primaryTint : C.border}`,
                        borderRadius: '12px', padding: '6px 14px',
                        transition: 'background 0.15s',
                      }}
                    >
                      查看詳情
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { likedIds, toggleLike, goal: userGoal } = useUser();

  const [searchQuery,       setSearchQuery]       = useState('');
  const [detailSearchQuery, setDetailSearchQuery]  = useState('');
  const [selectedId,        setSelectedId]        = useState(null);
  const [activeFilter,      setActiveFilter]      = useState('距離');
  const [mapZoom,           setMapZoom]           = useState(15);
  const [displayId,         setDisplayId]         = useState(null);

  const mapRef      = useRef(null);
  const detailTimer = useRef(null);

  const location = useLocation();
  useEffect(() => {
    if (location.pathname === ROUTES.MAP) {
      requestAnimationFrame(() => mapRef.current?.invalidateSize());
    }
  }, [location.pathname]);

  const zoomTier = mapZoom < 15 ? 0 : mapZoom < 16 ? 1 : 2;

  const restaurants = useMemo(() =>
    sortRestaurants(
      searchQuery ? searchRestaurants(searchQuery) : getAllRestaurants(),
      activeFilter,
      userGoal
    ),
    [searchQuery, activeFilter, userGoal]
  );

  const allByMatch = useMemo(() =>
    [...getAllRestaurants()].sort((a, b) => getMatchCount(b, userGoal) - getMatchCount(a, userGoal)),
    [userGoal]
  );

  const showNameIds = useMemo(() => {
    const limit = zoomTier === 2 ? allByMatch.length : zoomTier === 1 ? 3 : 0;
    return new Set(allByMatch.slice(0, limit).map(r => r.id));
  }, [zoomTier, allByMatch]);

  const markerIcons = useMemo(() => {
    const icons = {};
    restaurants.forEach(r => {
      icons[r.id] = createMarkerIcon(r, selectedId === r.id, getMatchCount(r, userGoal), zoomTier, showNameIds.has(r.id));
    });
    return icons;
  }, [restaurants, selectedId, userGoal, zoomTier, showNameIds]);

  const flyToRestaurant = (id) => {
    const coords = RESTAURANT_COORDS[id];
    if (coords && mapRef.current) {
      const map = mapRef.current;
      const targetZoom = Math.max(map.getZoom(), 16);
      map.flyTo(coords, targetZoom, { duration: 0.8 });
    }
  };

  const handleMarkerClick = (id) => {
    setSelectedId(id);
    flyToRestaurant(id);
  };

  const handleViewDetail = (e, id) => {
    e.stopPropagation();
    clearTimeout(detailTimer.current);
    setSelectedId(id);
    setDisplayId(id);
    flyToRestaurant(id);
  };

  const handleBackFromDetail = () => {
    setDetailSearchQuery('');
    detailTimer.current = setTimeout(() => setDisplayId(null), 300);
  };

  const handleSelectCard = (id) => {
    setSelectedId(id);
    flyToRestaurant(id);
  };

  const handleSearchChange = (val, isDetail) => {
    if (isDetail) setDetailSearchQuery(val);
    else setSearchQuery(val);
  };

  const detailRestaurant = displayId ? getRestaurantById(displayId) : null;

  return (
    <div style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 主區域：地圖 + 側邊欄 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 地圖區域 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={[22.2833, 114.1731]} zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            <MapController setZoom={setMapZoom} mapRef={mapRef} />
            {restaurants.map(r => {
              const coords = RESTAURANT_COORDS[r.id];
              if (!coords) return null;
              return (
                <Marker
                  key={r.id}
                  position={coords}
                  icon={markerIcons[r.id]}
                  zIndexOffset={selectedId === r.id ? 1000 : 0}
                  eventHandlers={{ click: () => handleMarkerClick(r.id) }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* 右側側邊欄 */}
        <div style={{
          width: '420px',
          flexShrink: 0,
          height: '100%',
          background: C.bg,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
        }}>
          <RestaurantSidebar
            restaurants={restaurants}
            selectedId={selectedId}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            displayId={displayId}
            detailRestaurant={detailRestaurant}
            detailSearchQuery={detailSearchQuery}
            onSearchChange={handleSearchChange}
            onFilterChange={setActiveFilter}
            onSelectCard={handleSelectCard}
            onViewDetail={handleViewDetail}
            onBackFromDetail={handleBackFromDetail}
            userGoal={userGoal}
            likedIds={likedIds}
            toggleLike={toggleLike}
          />
        </div>
      </div>

      {/* 底部導航（全寬，正常流） */}
      <BottomNav />
    </div>
  );
}
