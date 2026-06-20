import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Bike, Navigation, CheckCircle2, ShieldAlert, AlertCircle, QrCode } from 'lucide-react';
import apiClient from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, complaints
  const [assignments, setAssignments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [volunteerProfile, setVolunteerProfile] = useState(null);

  // QR Modal states
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrActionType, setQrActionType] = useState('pickup'); // pickup, deliver
  const [inputQrHash, setInputQrHash] = useState('');
  
  // Complaints states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfileAndTasks = async () => {
    try {
      const pRes = await apiClient.get('/volunteers/profile');
      setVolunteerProfile(pRes.data);
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const loadTasks = async () => {
    try {
      const res = await apiClient.get('/donations/assignments/volunteer');
      setAssignments(res.data);
      // Select the first active task for navigation display
      const activeTask = res.data.find(a => a.status === 'ASSIGNED' || a.status === 'PICKED_UP');
      if (activeTask) {
        setSelectedTask(activeTask);
      } else if (res.data.length > 0 && !selectedTask) {
        setSelectedTask(res.data[0]);
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
    loadProfileAndTasks();
    loadComplaints();
  }, []);

  const openVerificationModal = (task, action) => {
    setSelectedTask(task);
    setQrActionType(action);
    setInputQrHash('');
    setError('');
    setMessage('');
    setShowQrModal(true);
  };

  const handleVerifyQr = async () => {
    if (!inputQrHash.trim()) {
      setError('Please enter the verification hash or click Auto-Scan');
      return;
    }

    setError('');
    setMessage('');
    try {
      const endpoint = qrActionType === 'pickup' ? 'pickup' : 'deliver';
      await apiClient.post(`/donations/assignments/${selectedTask.id}/${endpoint}?qrHash=${inputQrHash}`);
      
      setMessage(`Verification successful! Status updated to ${qrActionType === 'pickup' ? 'PICKED UP' : 'DELIVERED'}.`);
      setTimeout(() => {
        setShowQrModal(false);
        loadTasks();
      }, 1500);
    } catch (e) {
      setError('Invalid QR verification token. Please verify.');
    }
  };

  const handleAutoScan = () => {
    // Fill the hash automatically for developer simulation
    setInputQrHash(selectedTask.qrCodeHash);
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
        <Sidebar role="ROLE_VOLUNTEER" />
        <div className="p-4 w-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-0">Rider Dispatch Console</h2>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>View assigned collection tasks and coordinate drop-offs</span>
            </div>
            <div className="d-flex gap-2">
              {['tasks', 'complaints'].map(tab => (
                <button
                  key={tab}
                  className={`btn text-capitalize btn-sm px-3 ${activeTab === tab ? 'btn-success text-white' : 'btn-outline-secondary text-secondary'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'tasks' ? 'Assigned Pickups' : 'Complaints'}
                </button>
              ))}
            </div>
          </div>

          {message && <div className="alert alert-success border-0 text-center py-2.5 mb-4">{message}</div>}
          {error && <div className="alert alert-danger border-0 text-center py-2.5 mb-4">{error}</div>}

          {activeTab === 'tasks' && (
            <div className="row g-4">
              {/* Task list and maps */}
              <div className="col-lg-6">
                <div className="glass-card mb-4">
                  <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                    <Bike size={18} className="text-success" />
                    <span>My Assigned Tasks</span>
                  </h5>
                  {assignments.length === 0 ? (
                    <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>You have no delivery assignments listed on your queue.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {assignments.map(a => (
                        <div 
                          key={a.id} 
                          className={`p-3 rounded-3 border transition-all ${
                            selectedTask?.id === a.id ? 'border-success bg-secondary bg-opacity-20' : 'border-secondary bg-secondary bg-opacity-10'
                          }`}
                          onClick={() => setSelectedTask(a)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="fw-bold text-white m-0">{a.donation.foodName}</h6>
                            <span className={`metric-badge status-${a.status.toLowerCase()}`}>
                              {a.status}
                            </span>
                          </div>
                          
                          <div className="text-secondary mb-3" style={{ fontSize: '0.8rem' }}>
                            <span className="d-block"><span className="fw-bold text-light">Pickup address:</span> {a.donation.pickupLocation}</span>
                            <span className="d-block"><span className="fw-bold text-light">Drop address:</span> {a.ngo.address} ({a.ngo.organizationName})</span>
                            <span className="d-block text-danger">Expiry: {new Date(a.donation.expiryTime).toLocaleTimeString()}</span>
                          </div>

                          <div className="d-flex gap-2">
                            {a.status === 'ASSIGNED' && (
                              <button 
                                className="btn btn-sm btn-success w-100 fw-bold border-0 d-flex align-items-center justify-content-center gap-1 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVerificationModal(a, 'pickup');
                                }}
                              >
                                <QrCode size={14} /> Verify Pickup QR
                              </button>
                            )}
                            {a.status === 'PICKED_UP' && (
                              <button 
                                className="btn btn-sm btn-info w-100 fw-bold border-0 d-flex align-items-center justify-content-center gap-1 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVerificationModal(a, 'deliver');
                                }}
                              >
                                <QrCode size={14} /> Verify Delivery QR
                              </button>
                            )}
                            {a.status === 'DELIVERED' && (
                              <span className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                                <CheckCircle2 size={16} /> Order Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Map Panel */}
              <div className="col-lg-6">
                <div className="glass-card mb-3">
                  <h6 className="fw-bold text-white mb-2 d-flex align-items-center gap-1">
                    <Navigation size={16} className="text-success" />
                    <span>Rider Collection Route Map:</span>
                  </h6>
                  {selectedTask ? (
                    <div>
                      <MapContainer center={[selectedTask.donation.latitude, selectedTask.donation.longitude]} zoom={13} scrollWheelZoom={true}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {/* Donor pin */}
                        <Marker position={[selectedTask.donation.latitude, selectedTask.donation.longitude]}>
                          <Popup>
                            <span className="fw-bold text-danger">Pickup: {selectedTask.donation.foodName}</span>
                          </Popup>
                        </Marker>
                        
                        {/* NGO pin */}
                        <Marker position={[selectedTask.ngo.latitude, selectedTask.ngo.longitude]}>
                          <Popup>
                            <span className="fw-bold text-success">Dropoff: {selectedTask.ngo.organizationName}</span>
                          </Popup>
                        </Marker>

                        {/* Navigation Line */}
                        <Polyline 
                          positions={[
                            [selectedTask.donation.latitude, selectedTask.donation.longitude],
                            [selectedTask.ngo.latitude, selectedTask.ngo.longitude]
                          ]} 
                          color="green" 
                          dashArray="5, 10" 
                        />
                      </MapContainer>
                      <small className="text-muted mt-2 d-block" style={{ fontSize: '0.7rem' }}>
                        Green dotted polyline maps the route from Donor collection spot to the target NGO center.
                      </small>
                    </div>
                  ) : (
                    <div className="py-5 text-center text-secondary border border-secondary border-dashed rounded-3">
                      Select an assigned task on the left to activate map navigation overlays.
                    </div>
                  )}
                </div>
              </div>
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
                        placeholder="e.g. Navigation coords are mismatching" 
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

          {/* QR Verification Modal popup */}
          {showQrModal && selectedTask && (
            <div className="modal fade show d-block bg-black bg-opacity-75" tabIndex="-1" style={{ zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-secondary bg-opacity-95 text-white border border-secondary shadow-lg">
                  <div className="modal-header border-bottom border-secondary">
                    <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                      <QrCode size={18} className="text-success" />
                      <span>Scan QR Verification: {qrActionType === 'pickup' ? 'Food Pickup' : 'Food Delivery'}</span>
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowQrModal(false)}></button>
                  </div>
                  <div className="modal-body py-4 text-center">
                    <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
                      Scan the QR Code provided by the {qrActionType === 'pickup' ? 'Donor' : 'NGO'} to verify this hand-off transaction.
                    </p>
                    
                    {error && <div className="alert alert-danger py-2 border-0 mb-3" style={{ fontSize: '0.8rem' }}>{error}</div>}
                    {message && <div className="alert alert-success py-2 border-0 mb-3" style={{ fontSize: '0.8rem' }}>{message}</div>}

                    {/* QR Code image display */}
                    {selectedTask.qrCodeImagePath && (
                      <div className="bg-white p-2 rounded d-inline-block mb-3">
                        <img 
                          src={`http://localhost:8080/${selectedTask.qrCodeImagePath}`} 
                          alt="Verification QR" 
                          style={{ width: '150px', height: '150px' }} 
                        />
                      </div>
                    )}

                    <div className="form-group col-sm-10 mx-auto mb-3">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.8rem' }}>Verification Token Hash</label>
                      <input 
                        type="text" 
                        value={inputQrHash} 
                        onChange={(e) => setInputQrHash(e.target.value)} 
                        className="form-control bg-dark text-white border-secondary text-center" 
                        placeholder="Enter hash manually or Auto-Scan" 
                      />
                    </div>
                    
                    <button type="button" onClick={handleAutoScan} className="btn btn-outline-info btn-sm border-0 mb-3">
                      [Simulate QR Camera Auto-Scan]
                    </button>

                    <div className="d-flex gap-2 justify-content-center border-top border-secondary pt-3 mt-3">
                      <button type="button" className="btn btn-sm btn-outline-secondary text-light-hover" onClick={() => setShowQrModal(false)}>Close</button>
                      <button type="button" className="btn btn-sm btn-success px-4" onClick={handleVerifyQr}>Confirm Transaction</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
export { VolunteerDashboard };
