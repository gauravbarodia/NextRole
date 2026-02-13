import React from 'react';
import { Briefcase } from 'lucide-react';

function Header({ jobs, onFilterSelect, children }) {
  // --- SAFETY CHECK ---
  // If jobs is undefined, null, or not an array, default to empty array []
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
        {/* NEW LOGO STYLE: Simple Gold Text & Icon */}
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', fontWeight: '800', color: '#f59e0b', margin: 0, letterSpacing: '-0.02em' }}>
          <Briefcase size={32} strokeWidth={2.5} />
          NextRole
        </h1>
        
        {/* We can move the actions here if you want them in the header line like CodeZen, 
            but for now, your layout keeps them below which is fine. */}
      </div>

      <div className="stats-row">
        {/* Cards now use the CSS classes for the accent border */}
        <div className="stat-card" onClick={() => onFilterSelect('All')}>
          <div className="stat-label">Applications</div>
          <div className="stat-count">{stats.Total}</div>
        </div>

        <div className="stat-card" onClick={() => onFilterSelect('Interview')}>
          <div className="stat-label">Interviews</div>
          <div className="stat-count">{stats.Interview}</div>
        </div>

        <div className="stat-card" onClick={() => onFilterSelect('Offer')}>
          <div className="stat-label">Offers</div>
          <div className="stat-count">{stats.Offer}</div>
        </div>

        <div className="stat-card" onClick={() => onFilterSelect('Rejected')}>
          <div className="stat-label">Rejected</div>
          <div className="stat-count">{stats.Rejected}</div>
        </div>
      </div>

      {/* Action Bar (Search/Add) */}
      <div className="header-actions" style={{ marginBottom: '30px', justifyContent: 'flex-end' }}>
          {children}
      </div>
    </div>
  );
}

export default Header;