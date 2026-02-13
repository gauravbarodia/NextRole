import React from 'react';
import { Briefcase } from 'lucide-react';

function Header({ jobs, onFilterSelect, children }) {
  const safeJobs = Array.isArray(jobs) ? jobs : []; 
  const stats = {
    Total: safeJobs.length,
    Interview: safeJobs.filter(j => j.status === 'Interview').length,
    Offer: safeJobs.filter(j => j.status === 'Offer').length,
    Rejected: safeJobs.filter(j => j.status === 'Rejected').length
  };

  return (
    <div>
      <div className="header-container">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', fontWeight: '800', color: '#ffaa00', margin: 0, letterSpacing: '-0.02em' }}>
          <Briefcase size={32} strokeWidth={2.5} />
          NextRole
        </h1>
        <div className="header-actions">
           {children}
        </div>
      </div>

      <div className="stats-row">
        {/* ADDED CLASS: card-applications for consistent glow */}
        <div className="stat-card card-applications" onClick={() => onFilterSelect('All')}>
          <div className="stat-count">{stats.Total}</div>
          <div className="stat-label">Applications</div>
        </div>

        <div className="stat-card card-applications" onClick={() => onFilterSelect('Interview')}>
          <div className="stat-count">{stats.Interview}</div>
          <div className="stat-label">Interviews</div>
        </div>

        <div className="stat-card card-offer" onClick={() => onFilterSelect('Offer')}>
          <div className="stat-count">{stats.Offer}</div>
          <div className="stat-label">Offers</div>
        </div>

        <div className="stat-card card-rejected" onClick={() => onFilterSelect('Rejected')}>
          <div className="stat-count">{stats.Rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
    </div>
  );
}
export default Header;