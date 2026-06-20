import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-dark text-white font-outfit min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <div className="container py-5 my-auto">
        <div className="row align-items-center justify-content-between gy-5">
          <div className="col-lg-6 text-center text-lg-start">
            <span className="badge bg-success-subtle text-success border border-success mb-3 px-3 py-2" style={{ fontSize: '0.85rem' }}>
              🌍 Tackling Surplus and Waste Together
            </span>
            <h1 className="display-4 fw-extrabold tracking-tight mb-4 text-white">
              Bridge the Gap Between <br />
              <span className="text-success">Food Surplus & Hungry bellies</span>
            </h1>
            <p className="lead text-secondary mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Connect surplus food from hotels, grocers, and events with local NGOs, shelters, and volunteers. Track the entire donation cycle in real-time, verified securely using QR codes.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
              <Link className="btn btn-success btn-lg px-4 py-3 fw-bold shadow transition-all" to="/register">
                Start Saving Food
              </Link>
              <Link className="btn btn-outline-secondary btn-lg px-4 py-3 text-light-hover transition-all" to="/login">
                Access Dashboard
              </Link>
            </div>
          </div>
          <div className="col-lg-5">
            {/* Visual Stats Panel (Glassmorphism layout) */}
            <div className="glass-card p-4 d-flex flex-column gap-4 shadow-lg">
              <h4 className="text-light fw-bold border-bottom border-secondary pb-3 mb-0">Platform Impact Metrics</h4>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success-subtle text-success p-3 rounded-3">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-white">8,450 +</h3>
                  <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Servings Rescued</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle text-primary p-3 rounded-3">
                  <MapPin size={24} className="text-info" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-white">150 +</h3>
                  <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Approved NGOs Registered</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning-subtle text-warning p-3 rounded-3">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-white">99.2 %</h3>
                  <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Successful Deliveries Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-black py-5 border-top border-secondary mt-auto">
        <div className="container">
          <div className="row gy-4 justify-content-center">
            <div className="col-md-4">
              <div className="glass-card border-0 h-100">
                <h5 className="text-success fw-bold">Donors</h5>
                <p className="text-secondary mb-0">Post food details, select pickup spot on the map, upload photos, and watch details get accepted by active NGOs near you.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card border-0 h-100">
                <h5 className="text-info fw-bold">NGOs</h5>
                <p className="text-secondary mb-0">Filter and accept listings in your vicinity, dispatch local volunteers for collection, and track routes from start to finish.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card border-0 h-100">
                <h5 className="text-warning fw-bold">Volunteers</h5>
                <p className="text-secondary mb-0">Receive pickup notifications, navigate to the target address, and scan QR verification codes to complete pickups and drop-offs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
export { LandingPage };
