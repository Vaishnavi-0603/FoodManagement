import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import apiClient from '../services/api';

const RegisterPage = () => {
  const [role, setRole] = useState('DONOR'); // DONOR, NGO, VOLUNTEER
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    organizationName: '',
    registrationNumber: '',
    contactPerson: '',
    fullName: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
      },
      (err) => {
        console.error(err);
        // Fallback to default mock coordinates (NYC center)
        setFormData(prev => ({
          ...prev,
          latitude: '40.712800',
          longitude: '-74.006000',
        }));
        setError('Could not fetch location automatically. Using default coordinates.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: role,
    };

    if (role === 'NGO') {
      payload.organizationName = formData.organizationName;
      payload.registrationNumber = formData.registrationNumber;
      payload.contactPerson = formData.contactPerson;
      payload.address = formData.address;
      payload.latitude = parseFloat(formData.latitude) || 40.7188;
      payload.longitude = parseFloat(formData.longitude) || -74.0080;
    } else if (role === 'VOLUNTEER') {
      payload.fullName = formData.fullName;
      payload.address = formData.address;
      payload.latitude = parseFloat(formData.latitude) || 40.7158;
      payload.longitude = parseFloat(formData.longitude) || -74.0020;
    }

    try {
      await apiClient.post('/auth/register', payload);
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-vh-100 py-5 font-outfit text-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="glass-card shadow-lg p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white mb-1">Create Account</h3>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Join the food redistribution network</span>
              </div>

              {/* Role Select Buttons */}
              <div className="d-flex justify-content-center gap-2 mb-4">
                {['DONOR', 'NGO', 'VOLUNTEER'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`btn px-4 py-2 fw-bold border-0 transition-all ${
                      role === r ? 'btn-success text-white' : 'btn-outline-secondary text-secondary'
                    }`}
                    onClick={() => handleRoleChange(r)}
                    disabled={loading}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger border-0 text-center py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success border-0 text-center py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="row g-3">
                {/* Base Credentials */}
                <div className="col-md-6">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    disabled={loading}
                  />
                </div>

                {/* NGO specific inputs */}
                {role === 'NGO' && (
                  <>
                    <hr className="border-secondary my-3" />
                    <h6 className="text-success fw-bold m-0 col-12">NGO Registration Details</h6>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Organization Name</label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Registration ID / License</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Office Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Geolocation Coordinate Fetch */}
                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Latitude</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        placeholder="e.g. 40.7128"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Longitude</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        placeholder="e.g. -74.0060"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="btn btn-outline-info btn-sm d-flex align-items-center gap-1 border-0"
                        disabled={loading}
                      >
                        <MapPin size={16} />
                        Auto-detect Coordinates
                      </button>
                    </div>
                  </>
                )}

                {/* Volunteer specific inputs */}
                {role === 'VOLUNTEER' && (
                  <>
                    <hr className="border-secondary my-3" />
                    <h6 className="text-success fw-bold m-0 col-12">Volunteer Profile Details</h6>

                    <div className="col-md-12">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Primary Area Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Latitude</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        placeholder="e.g. 40.7128"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Longitude</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                        placeholder="e.g. -74.0060"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="btn btn-outline-info btn-sm d-flex align-items-center gap-1 border-0"
                        disabled={loading}
                      >
                        <MapPin size={16} />
                        Auto-detect Coordinates
                      </button>
                    </div>
                  </>
                )}

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2.5 fw-bold border-0 shadow text-white"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Already have an account? </span>
                <Link to="/login" className="text-success text-decoration-none fw-bold" style={{ fontSize: '0.85rem' }}>
                  Login here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
export { RegisterPage };
