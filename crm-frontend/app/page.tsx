// app/page.tsx
"use client";

import Link from "next/link";
import React, { CSSProperties } from 'react';

export default function Home() {
  
  // -------------------------------------------------------------
  // 🎨 STYLES COMBINING PAYONEER LAYOUT & CRM THEME 🎨
  // -------------------------------------------------------------

  const globalContainerStyle: CSSProperties = {
    // Two-column layout structure
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  };

  const leftPanelStyle: CSSProperties = {
    flex: '1',
    // Dark background from the Payoneer image
    backgroundColor: '#1E1E1E',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: 'white',
    textAlign: 'center',
    position: 'relative', // For the 'N' logo
  };

  const rightPanelStyle: CSSProperties = {
    flex: '1',
    // White background for the main content area (like the Payoneer form side)
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#333',
  };

  // --- Content Styles (Applied to the Right Panel) ---

  const headerStyle: CSSProperties = {
    fontSize: '2.5em',
    fontWeight: '700',
    color: '#000', // Black text for contrast on white background
    marginBottom: '10px',
    textAlign: 'center',
  };

  const paragraphStyle: CSSProperties = {
    fontSize: '1.1em',
    color: '#666', 
    marginBottom: '40px',
    textAlign: 'center',
  };

  const buttonContainerStyle: CSSProperties = {
    marginTop: 30,
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  };

  // Login Button: Keep the CRM blue
  const loginButtonStyle: CSSProperties = {
    padding: "10px 20px",
    background: "#0070f3", // Primary Blue from CRM design
    color: "white",
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'background 0.2s',
    boxShadow: '0 4px 10px rgba(0, 112, 243, 0.3)',
  };

  // Register Button: Keep the CRM white/light gray border
  const registerButtonStyle: CSSProperties = {
    padding: "10px 20px",
    background: "#ffffff", // White background
    color: "#333", // Dark text
    border: '1px solid #ccc', // Subtle border
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'background 0.2s',
  };

  const footerLogoStyle: CSSProperties = {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#0070f3', // Blue logo color for brand consistency
  };

  // --- Left Panel Content Styles (Payoneer-inspired text) ---
  const marketingHeaderStyle: CSSProperties = {
      fontSize: '4em',
      fontWeight: '800',
      lineHeight: 1.1, 
      margin: 0,
      textAlign: 'center',
  };
  
  const marketingTaglineStyle: CSSProperties = {
      fontSize: '1.2em',
      opacity: 0.8, 
      fontWeight: 500,
      marginBottom: '20px',
  };
  
  // -------------------------------------------------------------

  return (
    <div style={globalContainerStyle}>
      
      {/* --- Left Panel (Themed Marketing Side) --- */}
      <div style={leftPanelStyle}>
          {/* Custom Marketing Message in Payoneer style */}
          <p style={marketingTaglineStyle}>
              Your centralized hub for efficiency.
          </p>
          <h1 style={marketingHeaderStyle}>
              Elevate <br /> Your contacts
          </h1>
          
          {/* The 'N' Logo from your CRM image, placed on the dark panel */}
          <div style={footerLogoStyle}>
              N
          </div>
      </div>

      {/* --- Right Panel (CRM Welcome Content) --- */}
      <div style={rightPanelStyle}>
        <main style={{ maxWidth: 450, width: '100%' }}>
          <h1 style={headerStyle}>Welcome to the CRM System</h1>
          <p style={paragraphStyle}>Manage your Contacts, Tasks, and Email Logs efficiently.</p>

          <div style={buttonContainerStyle}>
            <Link
              href="/login"
              style={loginButtonStyle}
            >
              Login
            </Link>

            <Link
              href="/register"
              style={registerButtonStyle}
            >
              Register
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}