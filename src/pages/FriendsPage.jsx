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
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.primary }} />
      <span style={{ fontWeight: '600', fontSize: '15px', color: C.primaryDark }}>{title}</span>
    </div>
    {sub && <span style={{ fontSize: '12px', color: C.textLight }}>{sub}</span>}
  </div>
);

const cardStyle = {
  borderRadius: '20px', padding: '18px 16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)', marginBottom: '12px',
};

export default function FriendsPage() {
  const { isGuest } = useUser();

  return (
    <div className="hide-scrollbar" style={{ maxWidth: '450px', margin: '0 auto', padding: '24px 14px 108px', background: C.bg, height: '100dvh', overflowY: 'auto' }}>

      {/* 好友列表 */}
      <div style={cardStyle}>
        <SectionHeader title="好友動態" />

        {!isGuest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {MOCK_FRIENDS.map((friend, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '21px', background: friend.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '600', color: C.primaryDark,
                  }}>
                    {friend.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: C.textDark }}>{friend.name}</div>
                    <div style={{ fontSize: '11px', color: C.textLight, marginTop: '2px' }}>{friend.goal}</div>
                  </div>
                </div>
                <RightOutline style={{ color: C.primaryLight, fontSize: '15px' }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: isGuest ? '4px' : '18px', display: 'flex', gap: '10px' }}>
          <div style={{
            flex: 1, padding: '12px', textAlign: 'center',
            background: C.primary, color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', borderRadius: '100px',
          }}>
            與朋友一起找餐廳
          </div>
          <div style={{
            width: '44px', height: '44px', borderRadius: '22px', flexShrink: 0,
            background: C.bgTint, border: `1.5px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: C.primary, fontWeight: '600', cursor: 'pointer',
          }}>
            +
          </div>
        </div>
      </div>

      {/* 本週排行 */}
      <div style={cardStyle}>
        <SectionHeader title="本週健康目標打卡排行" sub="本週" />

        {!isGuest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {RANKING.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 10px', borderRadius: '12px',
                background: i === 0 ? 'rgba(107,144,128,0.08)' : 'transparent',
                border: `1px solid ${i === 0 ? C.primaryTint : 'transparent'}`,
              }}>
                <div style={{
                  width: '24px', textAlign: 'center',
                  fontWeight: '700', fontSize: '14px',
                  color: i === 0 ? C.accent : C.textLight,
                }}>
                  {i + 1}
                </div>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '17px', background: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '600', color: C.primaryDark, flexShrink: 0,
                }}>
                  {f.name[0]}
                </div>
                <div style={{ flex: 1, fontSize: '14px', color: C.textDark, fontWeight: f.name === '我' ? '600' : '400' }}>
                  {f.name}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: C.primary }}>
                  {f.count} 次
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
