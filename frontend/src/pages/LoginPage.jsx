import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import apiClient from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { accessToken, id, username, email, role } = response.data;

      // Save to localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify({ id, username, email, role }));

      // Dispatch event to refresh Navbar
      window.dispatchEvent(new Event('auth-change'));

      // Redirect based on user role
      if (role === 'ROLE_ADMIN') navigate('/admin');
      else if (role === 'ROLE_DONOR') navigate('/donor');
      else if (role === 'ROLE_NGO') navigate('/ngo');
      else if (role === 'ROLE_VOLUNTEER') navigate('/volunteer');
      else navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid username/email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-vh-100 d-flex align-items-center py-5 font-outfit text-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="glass-card shadow-lg p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Sign in to access your dashboard</span>
              </div>

              {searchParams.get('expired') && (
                <div className="alert alert-warning border-0 text-center py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  Your session has expired. Please login again.
                </div>
              )}

              {error && (
                <div className="alert alert-danger border-0 text-center py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Username or Email</label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    placeholder="Enter username or email"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: '0.85rem' }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control bg-secondary text-white border-0 py-2.5 px-3 rounded-2"
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success py-2.5 fw-bold shadow border-0 mt-3 rounded-2 text-white"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Don't have an account? </span>
                <Link to="/register" className="text-success text-decoration-none fw-bold" style={{ fontSize: '0.85rem' }}>
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
export { LoginPage };
