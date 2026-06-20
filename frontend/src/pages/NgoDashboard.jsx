import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Check, Truck, User, QrCode } from 'lucide-react';
import apiClient from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse'); // browse, tasks, complaints
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [ngoProfile, setNgoProfile] = useState(null);
  const [acceptedAssignments, setAcceptedAssignments] = useState([]);
  
  // Volunteer dispatch states
  const [availableVolunteers, setAvailableVolunteers] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState({});
  
  // Complaints states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadNgoProfile = async () => {
    try {
      const res = await apiClient.get('/ngos/profile');
      setNgoProfile(res.data);
      loadNearbyDonations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNearbyDonations = async (profile) => {
    try {
      const res = await apiClient.get('/donations/nearby');
      setNearbyDonations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await apiClient.get('/donations/assignments/ngo');
      setAcceptedAssignments(res.data);
      
      // For each assignment that is not yet dispatched, load nearby volunteers
      res.data.forEach(async (a) => {
        if (a.status === 'ACCEPTED') {
          loadNearbyVolunteers(a.id, a.donation.latitude, a.donation.longitude);
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadNearbyVolunteers = async (assignmentId, lat, lng) => {
    try {
      const res = await apiClient.get(`/volunteers/nearby?lat=${lat}&lng=${lng}`);
      setAvailableVolunteers(prev => ({ ...prev, [assignmentId]: res.data }));
      if (res.data.length > 0) {
        setSelectedVolunteer(prev => ({ ...prev, [assignmentId]: res.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadComplaints = async () => {
    try {
      const res = await apiClient.get('/complaints/my');
      setMyComplaints(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNgoProfile();
    loadAssignments();
    loadComplaints();
  }, []);

  const handleAcceptDonation = async (id) => {
    setMessage('');
    setError('');
    try {
      await apiClient.post(`/donations/${id}/accept`);
      setMessage('Donation accepted successfully! You can now dispatch volunteers.');
      loadNgoProfile();
      loadAssignments();
    } catch (e) {
      setError('Failed to accept donation.');
    }
  };

  const handleDispatchVolunteer = async (assignmentId) => {
    const volunteerId = selectedVolunteer[assignmentId];
    if (!volunteerId) {
      alert('No volunteer selected');
      return;
    }

    setMessage('');
    setError('');
    try {
      await apiClient.post(`/donations/assignments/${assignmentId}/assign?volunteerId=${volunteerId}`);
      setMessage('Volunteer dispatched successfully! Task assigned.');
      loadAssignments();
    } catch (e) {
      setError('Dispatch assignment failed.');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post('/complaints', { title: complaintTitle, description: complaintDesc });
      setMessage('Complaint filed successfully. Administrators will review it.');
      setComplaintTitle('');
      setComplaintDesc('');
      loadComplaints();
    } catch (err) {
      setError('Failed to file complaint.');
    }
  };

  return (
    <div className="bg-dark min-vh-100 text-white font-outfit d-flex flex-column">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar role="ROLE_NGO" />
        <div className="p-4 w-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-0">NGO Portal</h2>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Find local listings and coordinate volunteer collections</span>
            </div>
            <div className="d-flex gap-2">
              {['browse', 'tasks', 'complaints'].map(tab => (
                <button
                  key={tab}
                  className={`btn text-capitalize btn-sm px-3 ${activeTab === tab ? 'btn-success text-white' : 'btn-outline-secondary text-secondary'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'browse' ? 'Browse Food' : tab === 'tasks' ? 'Collection Tasks' : 'Complaints'}
                </button>
              ))}
            </div>
          </div>

          {message && <div className="alert alert-success border-0 text-center py-2.5 mb-4">{message}</div>}
          {error && <div className="alert alert-danger border-0 text-center py-2.5 mb-4">{error}</div>}

          {activeTab === 'browse' && ngoProfile && (
            <div className="row g-4">
              {/* Map panel */}
              <div className="col-lg-7">
                <div className="glass-card mb-3">
                  <h6 className="fw-bold text-white mb-2">Surplus Food Listings Within 15 Km:</h6>
                  <MapContainer center={[ngoProfile.latitude, ngoProfile.longitude]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[ngoProfile.latitude, ngoProfile.longitude]}>
                      <Popup>
                        <span className="fw-bold text-success">Your NGO Center Office</span>
                      </Popup>
                    </Marker>
                    
                    {nearbyDonations.map(d => (
                      <Marker key={d.id} position={[d.latitude, d.longitude]}>
                        <Popup>
                          <div className="d-flex flex-column gap-1 text-white">
                            <span className="fw-bold text-success" style={{ fontSize: '0.85rem' }}>{d.foodName}</span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Qty: {d.quantity}</span>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Type: {d.foodType}</span>
                            <span className="text-secondary mb-2" style={{ fontSize: '0.75rem' }}>Expires: {new Date(d.expiryTime).toLocaleTimeString()}</span>
                            <button className="btn btn-xs btn-success py-1" onClick={() => handleAcceptDonation(d.id)}>
                              Accept Donation
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Cards Panel */}
              <div className="col-lg-5">
                <div className="glass-card h-100 overflow-auto" style={{ maxHeight: '495px' }}>
                  <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                    <MapPin size={18} className="text-success" />
                    <span>Nearby Food Cards</span>
                  </h5>
                  {nearbyDonations.length === 0 ? (
                    <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>No available food listed in your search coordinates.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {nearbyDonations.map(d => (
                        <div key={d.id} className="p-3 bg-secondary bg-opacity-25 rounded-3 border border-secondary transition-all">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="fw-bold text-white m-0">{d.foodName}</h6>
                            <span className="badge bg-secondary">{d.foodType}</span>
                          </div>
                          <div className="text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
                            <span className="d-block">Quantity: {d.quantity}</span>
                            <span className="d-block">Location: {d.pickupLocation}</span>
                            <span className="d-block text-danger">Expires: {new Date(d.expiryTime).toLocaleString()}</span>
                          </div>
                          <button className="btn btn-success btn-sm w-100 fw-bold border-0" onClick={() => handleAcceptDonation(d.id)}>
                            Accept
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="glass-card">
              <h5 className="fw-bold text-white mb-3">Accepted Donation Collection Tasks</h5>
              {acceptedAssignments.length === 0 ? (
                <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>No collection tasks currently on your queue.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle m-0 border border-secondary" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr className="border-bottom border-secondary text-secondary">
                        <th>Food Details</th>
                        <th>Donor address</th>
                        <th>Volunteer dispatch</th>
                        <th>Status</th>
                        <th className="text-center">Verification QR</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedAssignments.map(a => (
                        <tr key={a.id} className="border-bottom border-secondary">
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-bold text-light">{a.donation.foodName}</span>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Qty: {a.donation.quantity}</small>
                            </div>
                          </td>
                          <td>{a.donation.pickupLocation}</td>
                          <td>
                            {a.status === 'ACCEPTED' ? (
                              <div className="d-flex flex-column gap-1">
                                <select 
                                  className="form-select form-select-sm bg-dark text-white border-secondary"
                                  value={selectedVolunteer[a.id] || ''}
                                  onChange={(e) => setSelectedVolunteer(prev => ({ ...prev, [a.id]: e.target.value }))}
                                >
                                  {availableVolunteers[a.id]?.length === 0 && (
                                    <option value="">No volunteers available</option>
                                  )}
                                  {availableVolunteers[a.id]?.map(v => (
                                    <option key={v.id} value={v.id}>{v.fullName} (Available)</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center gap-1 text-success">
                                <User size={14} />
                                <span>{a.volunteer?.fullName}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`metric-badge status-${a.status.toLowerCase()}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="text-center">
                            {a.qrCodeImagePath && (
                              <a 
                                href={`http://localhost:8080/${a.qrCodeImagePath}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn btn-outline-info btn-xs py-1"
                              >
                                <QrCode size={14} /> Open QR
                              </a>
                            )}
                          </td>
                          <td className="text-end">
                            {a.status === 'ACCEPTED' ? (
                              <button 
                                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                onClick={() => handleDispatchVolunteer(a.id)}
                                disabled={!selectedVolunteer[a.id]}
                              >
                                <Truck size={14} /> Dispatch
                              </button>
                            ) : (
                              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>In Transit</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="glass-card">
                  <h5 className="fw-bold text-white mb-3">Submit Feedback / Complaint</h5>
                  <form onSubmit={handleCreateComplaint} className="d-flex flex-column gap-3">
                    <div className="form-group">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Subject Title</label>
                      <input 
                        type="text" 
                        value={complaintTitle} 
                        onChange={(e) => setComplaintTitle(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        placeholder="e.g. Volunteer route mapping issue" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Detailed Description</label>
                      <textarea 
                        value={complaintDesc} 
                        onChange={(e) => setComplaintDesc(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        rows={4} 
                        placeholder="Detail the issue or suggestion..." 
                        required 
                      />
                    </div>
                    <button type="submit" className="btn btn-success fw-bold border-0 text-white mt-2">
                      Submit Ticket
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="glass-card">
                  <h5 className="fw-bold text-white mb-3">Submitted Tickets</h5>
                  {myComplaints.length === 0 ? (
                    <p className="text-secondary m-0">No complaints filed.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {myComplaints.map(c => (
                        <div key={c.id} className="p-3 bg-secondary bg-opacity-25 rounded-3 border border-secondary">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="fw-bold text-white mb-0">{c.title}</h6>
                            <span className={`badge ${c.status === 'RESOLVED' ? 'bg-success' : 'bg-warning'}`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>{c.description}</p>
                          {c.adminFeedback && (
                            <div className="bg-dark p-2 rounded border border-success border-opacity-25 mt-2">
                              <small className="text-success fw-bold d-block" style={{ fontSize: '0.75rem' }}>Admin Response:</small>
                              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{c.adminFeedback}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
export { NgoDashboard };
