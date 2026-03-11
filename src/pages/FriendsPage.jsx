// ═══════════════════════════════════════════════════════════════
// src/pages/FriendsPage.jsx  ──  好友頁面（目前為靜態展示 UI）
//
// 【功能】①好友動態 ②本週打卡排行  ——全部靜態 Mock 數據
// 【訪客模式】isGuest=true 時隱藏列表和排行榜，只保留操作按鈕
// 【注意】尚無社交後端，按鈕點擊目前沒有綁定任何操作。
// ═══════════════════════════════════════════════════════════════

import { RightOutline } from 'antd-mobile-icons';
import BottomNav from '../components/layout/BottomNav';
import { useUser } from '../context/UserContext';
import { C } from '../constants/colors';

const MOCK_FRIENDS = [
  { name: 'Cathy',  goal: '增肌',    color: C.primaryTint },
  { name: 'Ryan',   goal: '減脂',    color: C.accentTint  },
  { name: 'Bohdan', goal: '保持體重', color: C.bgTint      },
];

const RANKING = [
  { name: 'Ryan',   color: C.accentTint,  count: 7 },
  { name: 'Cathy',  color: C.primaryTint, count: 6 },
  { name: '我',     color: C.primaryTint, count: 5 },
  { name: 'Bohdan', color: C.bgTint,      count: 3 },
];

const SectionHeader = ({ title, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: C.primary }} />
      <span style={{ fontWeight: '600', fontSize: '18px', color: C.primaryDark }}>{title}</span>
    </div>
    {sub && <span style={{ fontSize: '13px', color: C.textLight }}>{sub}</span>}
  </div>
);

const cardStyle = {
  borderRadius: '24px', padding: '24px 22px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
};

export default function FriendsPage() {
  const { isGuest } = useUser();

  return (
    <div className="hide-scrollbar" style={{ width: '100%', height: '100dvh', overflowY: 'auto', background: C.bg, padding: '28px 28px 108px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── 左欄：好友動態 ── */}
        <div style={{ flex: 1, minWidth: 0, ...cardStyle }}>
          <SectionHeader title="好友動態" />

          {!isGuest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              {MOCK_FRIENDS.map((friend, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '26px', background: friend.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: '600', color: C.primaryDark,
                    }}>
                      {friend.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: C.textDark }}>{friend.name}</div>
                      <div style={{ fontSize: '13px', color: C.textLight, marginTop: '3px' }}>{friend.goal}</div>
                    </div>
                  </div>
                  <RightOutline style={{ color: C.primaryLight, fontSize: '18px' }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: isGuest ? '4px' : '0', display: 'flex', gap: '12px' }}>
            <div style={{
              flex: 1, padding: '14px', textAlign: 'center',
              background: C.primary, color: 'white', fontSize: '16px', fontWeight: '600',
              cursor: 'pointer', borderRadius: '100px',
            }}>
              與朋友一起找餐廳
            </div>
            <div style={{
              width: '52px', height: '52px', borderRadius: '26px', flexShrink: 0,
              background: C.bgTint, border: `1.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', color: C.primary, fontWeight: '600', cursor: 'pointer',
            }}>
              +
            </div>
          </div>
        </div>

        {/* ── 右欄：本週排行 ── */}
        <div style={{ flex: 1, minWidth: 0, ...cardStyle }}>
          <SectionHeader title="本週健康目標打卡排行" sub="本週" />

          {!isGuest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {RANKING.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 14px', borderRadius: '16px',
                  background: i === 0 ? 'rgba(107,144,128,0.08)' : 'transparent',
                  border: `1px solid ${i === 0 ? C.primaryTint : 'transparent'}`,
                }}>
                  <div style={{
                    width: '32px', textAlign: 'center',
                    fontWeight: '700', fontSize: '18px',
                    color: i === 0 ? C.accent : C.textLight,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '22px', background: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '600', color: C.primaryDark, flexShrink: 0,
                  }}>
                    {f.name[0]}
                  </div>
                  <div style={{ flex: 1, fontSize: '16px', color: C.textDark, fontWeight: f.name === '我' ? '600' : '400' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: C.primary }}>
                    {f.count} 次
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
