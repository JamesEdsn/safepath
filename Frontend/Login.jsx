import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
      
      {/* Kotak Form Login */}
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '350px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
        
        <h2 style={{ color: '#1E3A8A', textAlign: 'center', margin: '0 0 10px 0', fontSize: '28px', fontWeight: 700 }}>
          SafePath Login
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '30px', color: '#666' }}>
          Monitoring Alat Tongkat IoT
        </p>
        
        <form onSubmit={handleLogin}>
          {/* Input Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Email</label>
            <input 
              type="email" 
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', marginTop: '8px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              required 
              placeholder="Masukkan email..."
              onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
          </div>

          {/* Input Password */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Password</label>
            <input 
              type="password" 
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', marginTop: '8px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none' }} 
              required 
              placeholder="Masukkan password..."
              onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
          </div>

          {/* Tombol Masuk */}
          <button 
            type="submit" 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' 
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#C82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#DC3545'}
          >
            Masuk Sekarang
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;