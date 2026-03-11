import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailOutline, LockOutline } from 'antd-mobile-icons';
import { useUser } from '../context/UserContext';
import { mockLogin } from '../services/userService';
import { ROUTES } from '../constants/routes';
import { C } from '../constants/colors';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useUser();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleLogin = () => {
    const result = mockLogin(email, password);
    if (result.success) {
      login(result.user);
      navigate(ROUTES.MAP);
    } else {
      setError(result.error);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate(ROUTES.MAP);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      display: 'flex',
      overflow: 'hidden',
    }}>
      {/* ── 左側品牌面板 ── */}
      <div style={{
        flex: '0 0 48%',
        background: `linear-gradient(160deg, ${C.primaryDark} 0%, ${C.primary} 60%, ${C.primaryLight} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景裝飾圓 */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <img
          src="/icon.png"
          alt="Protein Map"
          style={{ width: '180px', height: '180px', objectFit: 'contain', marginBottom: '-20px', position: 'relative', zIndex: 1 }}
        />
        <h1 style={{
          fontSize: '52px', color: 'white', margin: 0,
          fontWeight: 700, letterSpacing: '-1px', position: 'relative', zIndex: 1,
        }}>
          Protein Map
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.72)', fontSize: '17px',
          marginTop: '18px', textAlign: 'center', lineHeight: 1.7,
          position: 'relative', zIndex: 1, maxWidth: '280px',
        }}>
          你的香港健康飲食地圖
        </p>
      </div>

      {/* ── 右側登入面板 ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 56px',
        background: C.bg,
      }}>

        {/* 白色卡片 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '40px 36px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
          width: '100%',
          maxWidth: '440px',
          marginBottom: '20px',
        }}>

          {/* 電郵 */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: C.bgTint, borderRadius: '40px', padding: '0 22px' }}>
              <MailOutline style={{ fontSize: '22px', color: C.primary, marginRight: '10px' }} />
              <input
                type="email"
                placeholder="電郵"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '18px 0', fontSize: '17px', width: '100%', outline: 'none', color: C.textDark }}
              />
            </div>
          </div>

          {/* 密碼 */}
          <div style={{ marginBottom: error ? '18px' : '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: C.bgTint, borderRadius: '40px', padding: '0 22px' }}>
              <LockOutline style={{ fontSize: '22px', color: C.primary, marginRight: '10px' }} />
              <input
                type="password"
                placeholder="密碼"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '18px 0', fontSize: '17px', width: '100%', outline: 'none', color: C.textDark }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#B85C4A', fontSize: '15px', textAlign: 'center', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {/* 登入按鈕 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <button
              onClick={handleLogin}
              style={{ background: C.accent, color: 'white', borderRadius: '40px', height: '58px', fontSize: '17px', fontWeight: 600, border: 'none', width: '220px', boxShadow: `0 4px 16px ${C.accent}55`, cursor: 'pointer' }}
            >
              登入
            </button>
          </div>

          {/* 訪客瀏覽 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleGuestLogin}
              style={{ background: 'transparent', color: C.primary, borderRadius: '40px', height: '58px', fontSize: '17px', fontWeight: 600, border: `2px solid ${C.primary}`, width: '220px', cursor: 'pointer' }}
            >
              訪客瀏覽
            </button>
          </div>
        </div>

        {/* 註冊引導 */}
        <div style={{ textAlign: 'center', color: C.textLight, fontSize: '16px' }}>
          <span>新用戶？</span>
          <button
            onClick={() => navigate(ROUTES.SIGNUP)}
            style={{ background: 'none', border: 'none', color: C.primary, textDecoration: 'underline', fontSize: '16px', fontWeight: 500, cursor: 'pointer', padding: '0 4px' }}
          >
            註冊
          </button>
        </div>
      </div>
    </div>
  );
}
