import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  HandHeart, 
  History, 
  Users, 
  FileCheck, 
  AlertCircle, 
  TrendingUp, 
  UserCheck,
  Bike
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (targetPath) => path === targetPath ? 'active bg-success text-white' : 'text-secondary bg-transparent';

  const renderAdminLinks = () => (
    <>
      <Link to="/admin" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/admin')}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard Stats</span>
      </Link>
      <Link to="/admin/ngos" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/admin/ngos')}`}>
        <UserCheck size={18} />
        <span>Approve NGOs</span>
      </Link>
      <Link to="/admin/users" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/admin/users')}`}>
        <Users size={18} />
        <span>Manage Users</span>
      </Link>
      <Link to="/admin/donations" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/admin/donations')}`}>
        <HandHeart size={18} />
        <span>All Donations</span>
      </Link>
      <Link to="/admin/complaints" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/admin/complaints')}`}>
        <AlertCircle size={18} />
        <span>Complaints & Feed</span>
      </Link>
    </>
  );

  const renderDonorLinks = () => (
    <>
      <Link to="/donor" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/donor')}`}>
        <HandHeart size={18} />
        <span>Donate Food</span>
      </Link>
      <Link to="/donor/history" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/donor/history')}`}>
        <History size={18} />
        <span>Donation History</span>
      </Link>
      <Link to="/donor/complaints" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/donor/complaints')}`}>
        <AlertCircle size={18} />
        <span>Complaints</span>
      </Link>
    </>
  );

  const renderNgoLinks = () => (
    <>
      <Link to="/ngo" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/ngo')}`}>
        <Map size={18} />
        <span>Nearby Map</span>
      </Link>
      <Link to="/ngo/assignments" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/ngo/assignments')}`}>
        <FileCheck size={18} />
        <span>Accepted Donations</span>
      </Link>
      <Link to="/ngo/volunteers" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/ngo/volunteers')}`}>
        <Users size={18} />
        <span>Volunteers Radius</span>
      </Link>
      <Link to="/ngo/complaints" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/ngo/complaints')}`}>
        <AlertCircle size={18} />
        <span>Complaints</span>
      </Link>
    </>
  );

  const renderVolunteerLinks = () => (
    <>
      <Link to="/volunteer" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/volunteer')}`}>
        <Bike size={18} />
        <span>Pickup Tasks</span>
      </Link>
      <Link to="/volunteer/complaints" className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all mb-2 ${isActive('/volunteer/complaints')}`}>
        <AlertCircle size={18} />
        <span>Complaints</span>
      </Link>
    </>
  );

  return (
    <div className="bg-dark border-end border-secondary p-3 h-100 flex-shrink-0" style={{ width: '240px', minHeight: 'calc(100vh - 56px)' }}>
      <nav className="nav flex-column">
        {role === 'ROLE_ADMIN' && renderAdminLinks()}
        {role === 'ROLE_DONOR' && renderDonorLinks()}
        {role === 'ROLE_NGO' && renderNgoLinks()}
        {role === 'ROLE_VOLUNTEER' && renderVolunteerLinks()}
      </nav>
    </div>
  );
};

export default Sidebar;
export { Sidebar };
