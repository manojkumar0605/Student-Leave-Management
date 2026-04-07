import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Role</label>
            <select 
              className="form-input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="staff">Staff/Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. S01"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}
