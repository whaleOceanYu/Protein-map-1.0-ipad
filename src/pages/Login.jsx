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
      padding: '48px 24px',
      maxWidth: '400px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: C.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Logo + 標題 */}
      <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src="/icon.png"
          alt="Protein Map"
          style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '-30px' }}
        />
        <h1 style={{ fontSize: '36px', color: C.primaryDark, margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Protein Map
        </h1>
      </div>

      {/* 白色卡片 */}
      <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '32px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '16px' }}>

        {/* 電郵 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: C.bgTint, borderRadius: '40px', padding: '0 20px' }}>
            <MailOutline style={{ fontSize: '20px', color: C.primary, marginRight: '8px' }} />
            <input
              type="email"
              placeholder="電郵"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: '16px 0', fontSize: '16px', width: '100%', outline: 'none', color: C.textDark }}
            />
          </div>
        </div>

        {/* 密碼 */}
        <div style={{ marginBottom: error ? '16px' : '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: C.bgTint, borderRadius: '40px', padding: '0 20px' }}>
            <LockOutline style={{ fontSize: '20px', color: C.primary, marginRight: '8px' }} />
            <input
              type="password"
              placeholder="密碼"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: '16px 0', fontSize: '16px', width: '100%', outline: 'none', color: C.textDark }}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: '#B85C4A', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 登入按鈕（赤陶——CTA 用強調色） */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <button
            onClick={handleLogin}
            style={{ background: C.accent, color: 'white', borderRadius: '40px', height: '52px', fontSize: '16px', fontWeight: 600, border: 'none', width: '200px', boxShadow: `0 4px 12px ${C.accent}55`, cursor: 'pointer' }}
          >
            登入
          </button>
        </div>

        {/* 訪客瀏覽（苔綠輪廓） */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleGuestLogin}
            style={{ background: 'transparent', color: C.primary, borderRadius: '40px', height: '52px', fontSize: '16px', fontWeight: 600, border: `2px solid ${C.primary}`, width: '200px', cursor: 'pointer' }}
          >
            訪客瀏覽
          </button>
        </div>
      </div>

      {/* 註冊引導 */}
      <div style={{ textAlign: 'center', color: C.textLight, fontSize: '15px' }}>
        <span>新用戶？</span>
        <button
          onClick={() => navigate(ROUTES.SIGNUP)}
          style={{ background: 'none', border: 'none', color: C.primary, textDecoration: 'underline', fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '0 4px' }}
        >
          註冊
        </button>
        <span> 以開啟你的香港營養地圖</span>
      </div>
    </div>
  );
}
