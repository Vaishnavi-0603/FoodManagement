import React, { useState, useEffect } from 'react';
import { 
  Users, HandHeart, Award, AlertCircle, FileCheck, Check, X, ShieldAlert 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import apiClient from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalDonations: 0, activeNgos: 0, pendingNgos: 0,
    activeVolunteers: 0, totalComplaints: 0, pendingComplaints: 0,
    availableDonations: 0, acceptedDonations: 0, pickedUpDonations: 0,
    deliveredDonations: 0, expiredDonations: 0
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, ngos, users, donations, complaints
  const [pendingNgosList, setPendingNgosList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [resolveFeedback, setResolveFeedback] = useState({});
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      const res = await apiClient.get('/analytics/admin-stats');
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const loadNgoQueue = async () => {
    try {
      const res = await apiClient.get('/ngos/status?status=PENDING');
      setPendingNgosList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsersList = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsersList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDonationsList = async () => {
    try {
      const res = await apiClient.get('/donations');
      setDonationsList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadComplaintsList = async () => {
    try {
      const res = await apiClient.get('/complaints');
      setComplaintsList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = () => {
    setLoading(true);
    Promise.all([
      loadStats(),
      loadNgoQueue(),
      loadUsersList(),
      loadDonationsList(),
      loadComplaintsList()
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleApproveNgo = async (id) => {
    try {
      await apiClient.put(`/ngos/${id}/approve`);
      loadNgoQueue();
      loadStats();
    } catch (e) {
      alert('Verification approval failed');
    }
  };

  const handleRejectNgo = async (id) => {
    try {
      await apiClient.put(`/ngos/${id}/reject`);
      loadNgoQueue();
      loadStats();
    } catch (e) {
      alert('Rejection update failed');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await apiClient.put(`/users/${id}/toggle-active`);
      loadUsersList();
      loadStats();
    } catch (e) {
      alert('Toggling user state failed');
    }
  };

  const handleResolveComplaint = async (id) => {
    const feedback = resolveFeedback[id];
    if (!feedback || !feedback.trim()) {
      alert('Please enter feedback notes first');
      return;
    }

    try {
      await apiClient.put(`/complaints/${id}/resolve`, { adminFeedback: feedback });
      setResolveFeedback(prev => ({ ...prev, [id]: '' }));
      loadComplaintsList();
      loadStats();
    } catch (e) {
      alert('Resolution submission failed');
    }
  };

  // Chart Mappings
  const barData = [
    { name: 'Available', count: stats.availableDonations },
    { name: 'Accepted', count: stats.acceptedDonations },
    { name: 'Picked Up', count: stats.pickedUpDonations },
    { name: 'Delivered', count: stats.deliveredDonations },
    { name: 'Expired', count: stats.expiredDonations },
  ];

  const pieData = [
    { name: 'Active NGOs', value: stats.activeNgos },
    { name: 'Volunteers', value: stats.activeVolunteers },
    { name: 'Total Donors', value: stats.totalUsers - stats.activeNgos - stats.activeVolunteers - 1 }
  ];
  const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

  return (
    <div className="bg-dark min-vh-100 text-white font-outfit d-flex flex-column">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar role="ROLE_ADMIN" />
        <div className="p-4 w-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-0">Platform Overview</h2>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Monitor platforms statistics and handle verification audits</span>
            </div>
            <button className="btn btn-outline-success btn-sm px-3 py-2" onClick={refreshAll} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="glass-card d-flex align-items-center gap-3">
                <div className="bg-success-subtle text-success p-3 rounded-3"><Users size={22} /></div>
                <div>
                  <h4 className="fw-bold m-0">{stats.totalUsers}</h4>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Registered Users</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="glass-card d-flex align-items-center gap-3">
                <div className="bg-primary-subtle text-primary p-3 rounded-3"><HandHeart size={22} className="text-info" /></div>
                <div>
                  <h4 className="fw-bold m-0">{stats.totalDonations}</h4>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Total Listings</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="glass-card d-flex align-items-center gap-3">
                <div className="bg-warning-subtle text-warning p-3 rounded-3"><FileCheck size={22} /></div>
                <div>
                  <h4 className="fw-bold m-0">{stats.pendingNgos}</h4>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Pending NGOs</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="glass-card d-flex align-items-center gap-3">
                <div className="bg-danger-subtle text-danger p-3 rounded-3"><AlertCircle size={22} /></div>
                <div>
                  <h4 className="fw-bold m-0">{stats.pendingComplaints}</h4>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Open Complaints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-pills border-bottom border-secondary pb-3 mb-4 gap-2">
            {['overview', 'ngos', 'users', 'donations', 'complaints'].map(tab => (
              <li className="nav-item" key={tab}>
                <button 
                  className={`btn text-capitalize ${activeTab === tab ? 'btn-success text-white' : 'btn-outline-secondary text-secondary'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content Panels */}
          {activeTab === 'overview' && (
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="glass-card h-100">
                  <h5 className="fw-bold text-white mb-4">Donation Status Distribution</h5>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2c303d" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e2435', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="glass-card h-100">
                  <h5 className="fw-bold text-white mb-4">User Type Allocation</h5>
                  <div style={{ width: '100%', height: 300 }} className="d-flex flex-column align-items-center justify-content-center">
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e2435', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.8rem' }}>
                      {pieData.map((item, idx) => (
                        <span key={item.name} className="d-flex align-items-center gap-1">
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: COLORS[idx], borderRadius: '50%' }}></span>
                          <span className="text-secondary">{item.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ngos' && (
            <div className="glass-card">
              <h5 className="fw-bold text-white mb-3">Pending NGO Registration Verifications</h5>
              {pendingNgosList.length === 0 ? (
                <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>No NGO registrations are currently awaiting approval.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle m-0 border border-secondary" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr className="border-bottom border-secondary text-secondary">
                        <th>Org Name</th>
                        <th>Reg ID</th>
                        <th>Contact Person</th>
                        <th>Address</th>
                        <th>Phone/Email</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingNgosList.map(ngo => (
                        <tr key={ngo.id} className="border-bottom border-secondary">
                          <td className="fw-bold text-light">{ngo.organizationName}</td>
                          <td>{ngo.registrationNumber}</td>
                          <td>{ngo.contactPerson}</td>
                          <td>{ngo.address}</td>
                          <td>
                            <div className="d-flex flex-column text-muted" style={{ fontSize: '0.8rem' }}>
                              <span>{ngo.user.email}</span>
                              <span>{ngo.user.phone}</span>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={() => handleApproveNgo(ngo.id)}>
                                <Check size={14} /> Approve
                              </button>
                              <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => handleRejectNgo(ngo.id)}>
                                <X size={14} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card">
              <h5 className="fw-bold text-white mb-3">Platform User Profiles</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle m-0 border border-secondary" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr className="border-bottom border-secondary text-secondary">
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role Profile</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-bottom border-secondary">
                        <td className="fw-bold text-light">{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td className="text-capitalize text-success">{u.role.name.replace('ROLE_', '').toLowerCase()}</td>
                        <td>
                          <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                            {u.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="text-end">
                          {u.username !== 'admin' ? (
                            <button 
                              className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-success'}`}
                              onClick={() => handleToggleUser(u.id)}
                            >
                              {u.active ? 'Suspend' : 'Activate'}
                            </button>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>System Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="glass-card">
              <h5 className="fw-bold text-white mb-3">All Food Listings Log</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle m-0 border border-secondary" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr className="border-bottom border-secondary text-secondary">
                      <th>Food Name</th>
                      <th>Donor</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationsList.map(d => (
                      <tr key={d.id} className="border-bottom border-secondary">
                        <td className="fw-bold text-light">{d.foodName}</td>
                        <td>{d.donor.username}</td>
                        <td><span className="badge bg-secondary">{d.foodType}</span></td>
                        <td>{d.quantity}</td>
                        <td>{new Date(d.expiryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>
                          <span className={`metric-badge status-${d.status.toLowerCase()}`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="glass-card">
              <h5 className="fw-bold text-white mb-3">Feedback & Complaints Resolution Console</h5>
              {complaintsList.length === 0 ? (
                <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>No complaints or feedback have been submitted.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {complaintsList.map(c => (
                    <div key={c.id} className="p-3 bg-secondary bg-opacity-25 rounded-3 border border-secondary">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold text-white mb-0">{c.title}</h6>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Filed by {c.user.username} ({c.user.role.name.replace('ROLE_','')}) on {new Date(c.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <span className={`badge ${c.status === 'RESOLVED' ? 'bg-success' : 'bg-warning'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-secondary mb-3" style={{ fontSize: '0.85rem' }}>{c.description}</p>
                      
                      {c.status === 'PENDING' ? (
                        <div className="d-flex gap-2">
                          <input 
                            type="text" 
                            className="form-control form-control-sm bg-dark text-white border-secondary"
                            placeholder="Enter feedback resolution notes..."
                            value={resolveFeedback[c.id] || ''}
                            onChange={(e) => setResolveFeedback(prev => ({ ...prev, [c.id]: e.target.value }))}
                          />
                          <button 
                            className="btn btn-sm btn-success px-3"
                            onClick={() => handleResolveComplaint(c.id)}
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <div className="bg-dark p-2.5 rounded border border-success border-opacity-25">
                          <small className="text-success fw-bold d-block" style={{ fontSize: '0.75rem' }}>Admin Resolution Feedback:</small>
                          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{c.adminFeedback}</span>
                          {c.resolvedAt && (
                            <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                              Resolved on: {new Date(c.resolvedAt).toLocaleString()}
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
