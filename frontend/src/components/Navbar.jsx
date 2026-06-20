import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Award } from 'lucide-react';
import apiClient from '../services/api';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      setUser(null);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await apiClient.get('/notifications/unread');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    loadUser();
    loadNotifications();

    // Set polling interval for real-time notification alerts (every 30s)
    const interval = setInterval(loadNotifications, 30000);

    // Listen for custom auth updates (login, logout)
    window.addEventListener('auth-change', loadUser);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-change', loadUser);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ROLE_ADMIN') return '/admin';
    if (user.role === 'ROLE_DONOR') return '/donor';
    if (user.role === 'ROLE_NGO') return '/ngo';
    if (user.role === 'ROLE_VOLUNTEER') return '/volunteer';
    return '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top px-3 py-2 border-bottom border-secondary shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <Award className="text-success" size={26} />
          <span className="fw-bold tracking-tight text-white font-outfit">
            Food<span className="text-success">Saver</span>
          </span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user && (
              <li className="nav-item">
                <Link className="nav-link text-light-hover" to={getDashboardLink()}>
                  Dashboard
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link text-light-hover" to="/about">
                About Us
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="dropdown position-relative">
                  <button className="btn btn-outline-secondary border-0 p-1 position-relative text-light-hover dropdown-toggle no-arrow" type="button" id="notifDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <Bell size={22} className="text-light" />
                    {notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.65rem' }}>
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border border-secondary bg-dark text-white p-0 overflow-hidden" aria-labelledby="notifDropdown" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                    <li className="px-3 py-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-success">Notifications</span>
                      {notifications.length > 0 && (
                        <button className="btn btn-sm btn-link text-light-hover text-decoration-none p-0 text-secondary" onClick={handleMarkAllAsRead} style={{ fontSize: '0.75rem' }}>
                          Clear All
                        </button>
                      )}
                    </li>
                    {notifications.length === 0 ? (
                      <li className="px-3 py-4 text-center text-secondary">
                        <span style={{ fontSize: '0.85rem' }}>No new notifications</span>
                      </li>
                    ) : (
                      notifications.map(notif => (
                        <li key={notif.id} className="border-bottom border-secondary px-3 py-2 text-wrap bg-dark-hover" style={{ cursor: 'pointer' }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-bold text-light" style={{ fontSize: '0.85rem' }}>{notif.title}</span>
                            <button className="btn btn-sm border-0 p-0 text-danger" onClick={(e) => handleMarkAsRead(notif.id, e)} style={{ fontSize: '0.7rem' }}>
                              Dismiss
                            </button>
                          </div>
                          <p className="text-secondary m-0" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{notif.message}</p>
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* User info & Logout */}
                <div className="d-flex align-items-center gap-2 border-start border-secondary ps-3">
                  <div className="d-none d-md-flex flex-column text-end">
                    <span className="text-light fw-bold" style={{ fontSize: '0.85rem' }}>{user.username}</span>
                    <span className="text-success text-capitalize" style={{ fontSize: '0.7rem' }}>
                      {user.role.replace('ROLE_', '').toLowerCase()}
                    </span>
                  </div>
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span className="d-none d-sm-inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-success btn-sm px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-success btn-sm px-3" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
export { Navbar };
