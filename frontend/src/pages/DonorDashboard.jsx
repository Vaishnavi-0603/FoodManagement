import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Heart, PlusCircle, CheckCircle, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import apiClient from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('new'); // new, history, complaints
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [trackingAssignment, setTrackingAssignment] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('VEG'); // VEG, NON_VEG, VEGAN, BAKERY, GROCERY
  const [prepTime, setPrepTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [latitude, setLatitude] = useState(40.7128); // default NYC
  const [longitude, setLongitude] = useState(-74.0060);
  const [imageFile, setImageFile] = useState(null);

  // Complaint states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDonations = async () => {
    try {
      const res = await apiClient.get('/donations/my');
      setDonations(res.data);
      if (res.data.length > 0 && !selectedDonation) {
        handleSelectDonation(res.data[0]);
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
    loadDonations();
    loadComplaints();
  }, []);

  const handleSelectDonation = async (donation) => {
    setSelectedDonation(donation);
    setTrackingAssignment(null);
    setTrackingHistory([]);
    try {
      // Load history
      const histRes = await apiClient.get(`/donations/${donation.id}/history`);
      setTrackingHistory(histRes.data);

      // Try fetching assignment details if accepted/picked up/delivered
      if (donation.status !== 'AVAILABLE') {
        const ngoRes = await apiClient.get('/donations/assignments/ngo'); // wait, let's find matching assignment
        const match = ngoRes.data.find(a => a.donation.id === donation.id);
        if (match) {
          setTrackingAssignment(match);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Map click handler to update coordinates
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat.toFixed(6));
        setLongitude(e.latlng.lng.toFixed(6));
      }
    });
    return null;
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const donationPayload = {
      foodName,
      quantity,
      foodType,
      prepTime,
      expiryTime,
      pickupLocation,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };

    try {
      // 1. Create Donation Record
      const res = await apiClient.post('/donations', donationPayload);
      const createdDonation = res.data;

      // 2. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await apiClient.post(`/donations/${createdDonation.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMessage('Donation listed successfully! Nearby NGOs have been alerted.');
      // Clear inputs
      setFoodName('');
      setQuantity('');
      setPrepTime('');
      setExpiryTime('');
      setPickupLocation('');
      setImageFile(null);
      
      loadDonations();
    } catch (err) {
      console.error(err);
      setError('Failed to create donation. Check values and try again.');
    } finally {
      setLoading(false);
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

  const renderTracker = () => {
    if (!selectedDonation) return null;

    const statuses = ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'];
    const currentIdx = statuses.indexOf(selectedDonation.status);

    return (
      <div className="glass-card mb-4 border-success border-opacity-25">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          <Clock size={18} className="text-success" />
          <span>Tracking: {selectedDonation.foodName}</span>
        </h5>
        
        {/* Visual Timeline Steps */}
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2 px-3">
          {statuses.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <React.Fragment key={step}>
                <div className="d-flex flex-column align-items-center position-relative">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                    isDone ? 'bg-success text-white' : 'bg-secondary text-muted'
                  } ${isCurrent ? 'ring-2' : ''}`} style={{ width: '36px', height: '36px', zIndex: 2 }}>
                    {idx + 1}
                  </div>
                  <span className="text-secondary mt-2 text-center" style={{ fontSize: '0.75rem', position: 'absolute', top: '35px', width: '80px' }}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
                {idx < statuses.length - 1 && (
                  <div className={`flex-grow-1 border-top ${
                    idx < currentIdx ? 'border-success border-2' : 'border-secondary'
                  }`} style={{ height: '2px', zIndex: 1, margin: '0 -20px' }}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-top border-secondary">
          <h6 className="fw-bold text-light mb-2">Audit log & Events:</h6>
          <ul className="list-unstyled d-flex flex-column gap-2 m-0" style={{ fontSize: '0.8rem' }}>
            {trackingHistory.map(h => (
              <li key={h.id} className="d-flex gap-2 align-items-start text-secondary">
                <CheckCircle size={14} className="text-success mt-0.5" />
                <div>
                  <span className="text-light fw-bold">[{h.status}]</span> {h.notes}
                  <small className="text-muted d-block">{new Date(h.changedAt).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-dark min-vh-100 text-white font-outfit d-flex flex-column">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar role="ROLE_DONOR" />
        <div className="p-4 w-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-0">Donor Console</h2>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>List food donations and track collection updates</span>
            </div>
            <div className="d-flex gap-2">
              {['new', 'history', 'complaints'].map(tab => (
                <button
                  key={tab}
                  className={`btn text-capitalize btn-sm px-3 ${activeTab === tab ? 'btn-success text-white' : 'btn-outline-secondary text-secondary'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'new' ? 'New Donation' : tab}
                </button>
              ))}
            </div>
          </div>

          {message && <div className="alert alert-success border-0 text-center py-2.5 mb-4">{message}</div>}
          {error && <div className="alert alert-danger border-0 text-center py-2.5 mb-4">{error}</div>}

          {activeTab === 'new' && (
            <div className="row g-4">
              {/* Form Input fields */}
              <div className="col-lg-6">
                <div className="glass-card">
                  <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-1">
                    <PlusCircle size={18} className="text-success" />
                    Create Food Donation
                  </h5>
                  <form onSubmit={handleCreateDonation} className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Food Name / Items</label>
                      <input 
                        type="text" 
                        value={foodName} 
                        onChange={(e) => setFoodName(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        placeholder="e.g. Veg Pasta & Sandwich pack"
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Quantity / Servings</label>
                      <input 
                        type="text" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        placeholder="e.g. 15 servings, 5 Kg"
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Food Category</label>
                      <select 
                        value={foodType} 
                        onChange={(e) => setFoodType(e.target.value)} 
                        className="form-select bg-secondary text-white border-0 py-2"
                      >
                        <option value="VEG">Vegetarian</option>
                        <option value="NON_VEG">Non-Vegetarian</option>
                        <option value="VEGAN">Vegan</option>
                        <option value="BAKERY">Bakery</option>
                        <option value="GROCERY">Grocery</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Preparation Time</label>
                      <input 
                        type="datetime-local" 
                        value={prepTime} 
                        onChange={(e) => setPrepTime(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Expiry Time</label>
                      <input 
                        type="datetime-local" 
                        value={expiryTime} 
                        onChange={(e) => setExpiryTime(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        required 
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Pickup Street Address</label>
                      <input 
                        type="text" 
                        value={pickupLocation} 
                        onChange={(e) => setPickupLocation(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        placeholder="Enter full pickup street location"
                        required 
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Food Photo (Optional)</label>
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])} 
                          className="form-control bg-secondary text-white border-0 py-2" 
                        />
                        <ImageIcon size={22} className="text-secondary" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-0.5" style={{ fontSize: '0.75rem' }}>Latitude: {latitude}</label>
                    </div>
                    <div className="col-md-6 text-end">
                      <label className="form-label text-secondary mb-0.5" style={{ fontSize: '0.75rem' }}>Longitude: {longitude}</label>
                    </div>

                    <div className="col-12 mt-3">
                      <button type="submit" className="btn btn-success w-100 py-2.5 fw-bold border-0 text-white" disabled={loading}>
                        {loading ? 'Creating Record...' : 'Publish Listing'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Map Interactive Coordinate Selection */}
              <div className="col-lg-6">
                <div className="glass-card mb-3">
                  <h6 className="fw-bold text-white mb-2">Pin Pickup Location on Map:</h6>
                  <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[latitude, longitude]} />
                    <MapEvents />
                  </MapContainer>
                  <small className="text-muted mt-2 d-block" style={{ fontSize: '0.7rem' }}>
                    Click anywhere on the map above to select the coordinates for the volunteer pickup routing.
                  </small>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="glass-card">
                  <h5 className="fw-bold text-white mb-3">My Donation Records</h5>
                  {donations.length === 0 ? (
                    <p className="text-secondary m-0">You haven't listed any food donations yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-hover align-middle m-0 border border-secondary" style={{ fontSize: '0.9rem' }}>
                        <thead>
                          <tr className="border-bottom border-secondary text-secondary">
                            <th>Food Items</th>
                            <th>Type</th>
                            <th>Qty</th>
                            <th>Expiry</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map(d => (
                            <tr 
                              key={d.id} 
                              className={`border-bottom border-secondary ${selectedDonation?.id === d.id ? 'table-active' : ''}`}
                              onClick={() => handleSelectDonation(d)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="fw-bold text-light">{d.foodName}</td>
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
                  )}
                </div>
              </div>
              
              {/* Tracker Panel */}
              <div className="col-lg-5">
                {selectedDonation ? renderTracker() : (
                  <div className="glass-card text-center py-5 text-secondary">
                    Select a donation on the left to track its active delivery status and view audits.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="glass-card">
                  <h5 className="fw-bold text-white mb-3">File a Complaint / Feedback</h5>
                  <form onSubmit={handleCreateComplaint} className="d-flex flex-column gap-3">
                    <div className="form-group">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Subject Title</label>
                      <input 
                        type="text" 
                        value={complaintTitle} 
                        onChange={(e) => setComplaintTitle(e.target.value)} 
                        className="form-control bg-secondary text-white border-0 py-2" 
                        placeholder="e.g. NGO missed pickup schedule" 
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
                        placeholder="Explain the issue in detail..." 
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
                  <h5 className="fw-bold text-white mb-3">My Complaint Log</h5>
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

export default DonorDashboard;
export { DonorDashboard };
