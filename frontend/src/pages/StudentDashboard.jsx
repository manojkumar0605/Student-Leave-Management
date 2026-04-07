import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ presentDays: 0, absentDays: 0 });
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ fromDate: '', toDate: '', reason: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchData(JSON.parse(userData));
    }
  }, []);

  const fetchData = async (u) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const resStats = await fetch(import.meta.env.VITE_API_URL + '/api/leaves/stats', { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // Fetch Leaves
      const resLeaves = await fetch(import.meta.env.VITE_API_URL + '/api/leaves', { headers });
      if (resLeaves.ok) {
        const data = await resLeaves.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const formatDate = (dateString) => {
    // Converts YYYY-MM-DD to DD-MM-YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      // Format to DD-MM-YYYY as requested by requirements
      const formattedFrom = formatDate(formData.fromDate);
      const formattedTo = formatDate(formData.toDate);

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/leaves', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fromDate: formattedFrom, 
          toDate: formattedTo, 
          reason: formData.reason 
        })
      });

      if (res.ok) {
        setMsg('Leave applied successfully!');
        setFormData({ fromDate: '', toDate: '', reason: '' });
        fetchData(user); // refresh list
      } else {
        const data = await res.json();
        setMsg(data.message || 'Error applying leave');
      }
    } catch (err) {
      setMsg('Server error');
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Student Dashboard</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Days Present</span>
          <span className="stat-value present">{stats.presentDays}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Days Absent</span>
          <span className="stat-value absent">{stats.absentDays}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Apply for Leave</h2>
          {msg && <div style={{ marginBottom: '1rem', color: msg.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{msg}</div>}
          <form onSubmit={applyLeave}>
            <div className="form-group">
              <label>From Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.fromDate}
                onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.toDate}
                onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <textarea 
                className="form-input" 
                rows="4"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required 
              ></textarea>
            </div>
            <button type="submit" className="btn">Submit Request</button>
          </form>
        </div>

        <div className="card">
          <h2>Your Leave History</h2>
          {leaves.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No leave requests found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Staff Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l._id}>
                      <td style={{ minWidth: '150px' }}>{l.fromDate} to {l.toDate}</td>
                      <td>{l.reason}</td>
                      <td>
                        <span className={`status ${l.status}`}>{l.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{l.staffComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
