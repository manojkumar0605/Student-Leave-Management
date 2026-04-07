import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalStudents: 0, totalLeaves: 0, pendingLeaves: 0 });
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const resStats = await fetch('http://localhost:5000/api/leaves/stats', { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // Fetch All Leaves
      const resLeaves = await fetch('http://localhost:5000/api/leaves', { headers });
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

  const updateLeaveStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      let staffComment = '';
      let absentDaysToAdd = 0;

      if (status === 'rejected') {
         staffComment = prompt('Enter a reason for rejection (optional):') || '';
      }
      if (status === 'approved') {
         const daysInput = prompt('Enter number of days they will be absent for this leave:');
         absentDaysToAdd = parseInt(daysInput) || 1;
      }

      const res = await fetch(`http://localhost:5000/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, staffComment, absentDaysToAdd })
      });

      if (res.ok) {
        fetchData(); // refresh list
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Staff Overview</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Total Students</span>
          <span className="stat-value">{stats.totalStudents}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Total Leave Requests</span>
          <span className="stat-value present">{stats.totalLeaves}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Pending Approvals</span>
          <span className="stat-value absent">{stats.pendingLeaves}</span>
        </div>
      </div>

      <div className="card">
        <h2>Student Leave Requests</h2>
        {leaves.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No leave requests found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Dates (Form-To)</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div><strong>{l.student?.name}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {l.student?.userId}</div>
                    </td>
                    <td>{l.fromDate} to {l.toDate}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`status ${l.status}`}>{l.status}</span>
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="action-buttons">
                          <button className="btn-small btn-approve" onClick={() => updateLeaveStatus(l._id, 'approved')}>Approve</button>
                          <button className="btn-small btn-reject" onClick={() => updateLeaveStatus(l._id, 'rejected')}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {l.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
