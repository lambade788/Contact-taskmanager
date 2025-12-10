// app/register/page.tsx
'use client';

import React, { useState, CSSProperties } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      };

      const res = await api.post('/api/auth/register', payload);
      // backend returns { ok: true, userId: ... } or similar
      setMsg('Registration successful. Redirecting to login...');
      setTimeout(() => router.push('/login'), 900);
    } catch (error: any) {
      console.error('Register error', error);
      setErr(error?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 🎨 STYLES MATCHING THE UPSKILL DESIGN (White Background, Dark Inputs, Orange Button) 🎨
  // -------------------------------------------------------------

  const globalContainerStyle: CSSProperties = {
    // Full white screen background
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffff', // White background
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
  };

  const formWrapperStyle: CSSProperties = {
    // Container for the header, form, and logo links
    maxWidth: 400,
    width: '100%',
    paddingTop: '60px',
  };
  
  const topHeaderStyle: CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      marginBottom: '60px',
  }
  
  const logoStyle: CSSProperties = {
      color: '#FF5C00', // Vibrant orange
      fontSize: '1.5em',
      fontWeight: 'bold',
  }
  
  const signInLinkStyle: CSSProperties = {
      textDecoration: 'none',
      color: '#000000',
      fontWeight: '600',
      fontSize: '1em',
  }

  const headerStyle: CSSProperties = {
    fontSize: '3em',
    fontWeight: 'normal',
    color: '#000',
    marginBottom: '50px',
    textAlign: 'left',
  };

  const inputContainerStyle: CSSProperties = {
    marginBottom: '20px',
  };

  // We are not using labels visible above the input, as the placeholder design is preferred.
  // const labelStyle: CSSProperties = {...}; 

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '16px 20px', // Larger padding for better visibility
    // Dark background for inputs, matching the Upskill image
    backgroundColor: '#363636', 
    color: 'white', // White text in dark input fields
    border: 'none', 
    borderRadius: '6px', 
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '1em',
    transition: 'background-color 0.2s',
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    padding: '14px 20px',
    marginTop: '30px',
    // Orange/Red Gradient from the Upskill/Payoneer design
    background: 'linear-gradient(to right, #FF7B40, #FF4700)', 
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 15px rgba(255, 71, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  };

  const disabledButtonStyle: CSSProperties = {
      ...buttonStyle,
      opacity: 0.6,
      cursor: 'not-allowed',
      boxShadow: 'none',
  }

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

  const msgStyle: CSSProperties = {
    color: '#28a745', 
    marginTop: '15px',
    fontWeight: '500',
    padding: '10px',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    backgroundColor: '#d4edda',
    textAlign: 'center',
  };
  
  // -------------------------------------------------------------

  return (
    <div style={globalContainerStyle}>
        
        <div style={topHeaderStyle}>
            {/* Logo placeholder */}
            <span style={logoStyle}>Upskill</span>
            {/* Sign In link replaces the "Sign Up" text from the image */}
            <Link href="/login" style={signInLinkStyle}>Sign In</Link>
        </div>

        <div style={formWrapperStyle}>
          
          {/* Change to 'Sign Up' to match the page purpose and the Upskill design style */}
          <h2 style={headerStyle}>Sign Up</h2>

          <form onSubmit={submit}>
            {/* First Name */}
            <div style={inputContainerStyle}>
              <input 
                style={inputStyle} 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required
                placeholder="First Name" // Use placeholder for visual design
              />
            </div>

            {/* Last Name */}
            <div style={inputContainerStyle}>
              <input 
                style={inputStyle} 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
                placeholder="Last Name"
              />
            </div>

            {/* Email */}
            <div style={inputContainerStyle}>
              <input 
                style={inputStyle} 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Email Address"
              />
            </div>

            {/* Phone */}
            <div style={inputContainerStyle}>
              <input 
                style={inputStyle} 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                pattern="^\d{10}$" 
                placeholder="Phone (10 digits)"
              />
            </div>

            {/* Password */}
            <div style={inputContainerStyle}>
              <input 
                style={inputStyle} 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
                placeholder="Password (Min 6 characters)"
              />
            </div>

            {err && <div style={errorStyle}>{err}</div>}
            {msg && <div style={msgStyle}>{msg}</div>}

            <div style={{ marginTop: 12 }}>
              <button 
                type="submit" 
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                {loading ? 'Creating...' : 'Register'}
                <span style={{ fontSize: '1.5em', lineHeight: 0 }}>&rarr;</span> 
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}