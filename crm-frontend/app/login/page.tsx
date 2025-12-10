'use client';

import React, { useState, CSSProperties } from 'react';
import api from '@/lib/api';
import { loginClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); // Retained state for password toggle

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    try {
      const res = await api.post('/api/auth/login', { emailOrPhone, password });

      const { token, expiresIn } = res.data as any;
      loginClient(token, expiresIn);

      router.push('/dashboard');
    } catch (error: any) {
      setErr(error?.response?.data?.error || 'Login failed');
    }
  };

  // -------------------------------------------------------------
  // 🎨 STYLES MATCHING THE PAYONEER/UPSKILL THEME 🎨
  // -------------------------------------------------------------

  const globalContainerStyle: CSSProperties = {
    // Full screen setup
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
  };

  const leftPanelStyle: CSSProperties = {
    flex: '1',
    // Dark background from the image
    backgroundColor: '#1E1E1E',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: 'white',
    // Media query-like behavior for small screens (adjust as needed)
    '@media (maxWidth: 768px)': {
        display: 'none',
    },
  };

  const leftContentStyle: CSSProperties = {
    // Center the content in the dark panel
    textAlign: 'left',
    maxWidth: '450px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  };

  const rightPanelStyle: CSSProperties = {
    flex: '1',
    // White background for the sign-in form
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  };

  const formCardStyle: CSSProperties = {
    maxWidth: 400,
    width: '100%',
    padding: '0 20px',
    textAlign: 'left',
  };

  const logoStyle: CSSProperties = {
    // Upskill Orange/Payoneer Orange
    color: '#FF5C00', 
    marginBottom: '20px',
    fontSize: '1.5em',
    fontWeight: '700',
  };

  const headerStyle: CSSProperties = {
    color: '#000000',
    marginBottom: '40px',
    fontSize: '2.5em',
    fontWeight: '600',
    textAlign: 'left',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    // Dark background for inputs, matching the Upskill image
    backgroundColor: '#363636', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontSize: '1em',
    outline: 'none',
    transition: 'background-color 0.2s',
  };

  const passwordContainerStyle: CSSProperties = {
      position: 'relative',
  }
  
  const passwordToggleStyle: CSSProperties = {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#A0A0A0',
  }

  const forgotLinkStyle: CSSProperties = {
    color: '#FF4700', // Match the button/brand color
    fontSize: '0.9em',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '30px',
    textAlign: 'right',
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    padding: '14px 20px',
    // Gradient from the Payoneer/Upskill image
    background: 'linear-gradient(to right, #FF7B40, #FF4700)', 
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 15px rgba(255, 71, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  };
  
  const errorStyle: CSSProperties = {
    color: '#dc3545', 
    marginTop: '15px',
    fontWeight: '500',
    padding: '10px',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
    textAlign: 'center',
  };

  // -------------------------------------------------------------

  return (
    <div style={globalContainerStyle}>
      {/* --- Left Panel (Design/Marketing) --- */}
      <div style={leftPanelStyle}>
          <div style={leftContentStyle as any}>
              <p style={{ fontSize: '0.9em', opacity: 0.8, fontWeight: 500 }}>
                  From contacts to deadlines — we keep it all on track.
              </p>
              <h1 style={{ fontSize: '4.5em', fontWeight: '800', lineHeight: 1.1, margin: 0 }}>
                  Manage <br /> your contact and tasks
              </h1>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                  {/* Placeholder for the phone image */}
              </div>
          </div>
      </div>

      {/* --- Right Panel (Login Form) --- */}
      <div style={rightPanelStyle}>
        <div style={formCardStyle}>
          {/* Logo and Sign Up button area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
              <span style={logoStyle}>Upskill</span>
              {/* === CHANGE APPLIED HERE: href='/register' === */}
              <a href="/register" style={{ textDecoration: 'none', color: '#000000', fontSize: '0.9em', fontWeight: '500' }}>
                  Register
              </a>
          </div>

          <h2 style={headerStyle}>Sign In</h2>
          
          <form onSubmit={submit}>
            {/* Email or Username Input */}
            <div style={{...passwordContainerStyle, marginBottom: '25px'}}>
              <input 
                style={inputStyle}
                placeholder="Email or Username"
                value={emailOrPhone} 
                onChange={(e) => setEmailOrPhone(e.target.value)} 
                required 
              />
            </div>

            {/* Password Input */}
            <div style={passwordContainerStyle}>
              <input 
                style={inputStyle}
                placeholder="Password"
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span 
                  style={passwordToggleStyle} 
                  onClick={() => setShowPassword(!showPassword)}
              >
                  {/* Lock icon placeholder */}
                  {showPassword ? '👁️' : '🔒'} 
              </span>
            </div>
            
            <a href="/forgot-password" style={forgotLinkStyle}>
                Forgot password?
            </a>

            {err && <div style={errorStyle}>{err}</div>}

            <button type="submit" style={buttonStyle}>
              Sign In 
              <span style={{ fontSize: '1.5em', lineHeight: 0 }}>&rarr;</span> 
            </button>
            
            {/* Footer Text Placeholder */}
            <div style={{ marginTop: '100px', fontSize: '0.75em', color: '#A0A0A0', display: 'flex', justifyContent: 'space-between' }}>
                <span>&copy; 2006-2025 Upskill CRM Inc.</span>
                <span>Contact Us | English ▾</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}