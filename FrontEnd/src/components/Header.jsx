import React from 'react';
import { Briefcase } from 'lucide-react';

/**
 * Header Component
 * * Displays the App Logo and the Dashboard Statistics Cards.
 * * Props:
 * @param {Array} jobs - The full list of jobs to calculate stats from.
 * @param {Function} onFilterSelect - Callback when a card is clicked to filter the table.
 * @param {Function} onHome - Callback to reset the view to home.
 * @param {ReactNode} children - The action buttons (Add Job, Search, etc.) passed from App.jsx.
 */
function Header({ jobs, onFilterSelect, onHome, children }) {
  
  // Ensure jobs is an array to prevent crashes
  const safeJobs = Array.isArray(jobs) ? jobs : []; 

  // Calculate Counts dynamically
  const stats = {
    Total: safeJobs.length,
    Interview: safeJobs.filter(j => j.status === 'Interview').length,
    Offer: safeJobs.filter(j => j.status === 'Offer').length,
    Rejected: safeJobs.filter(j => j.status === 'Rejected').length
  };

  return (
    <div>
      {/* Top Bar: Logo + Action Buttons */}
      <div className="header-container">
        <h1 
          onClick={onHome} 
          className="app-logo"
          title="Return Home"
        >
          <Briefcase size={32} strokeWidth={2.5} />
          NextRole
        </h1>

        <div className="header-actions">
           {children}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-row">
        {/* Total Applications */}
        <div className="stat-card card-applications" onClick={() => onFilterSelect('All')}>
          <div className="stat-count">{stats.Total}</div>
          <div className="stat-label">Applications</div>
        </div>

        {/* Interviews */}
         <div className="stat-card card-applications" onClick={() => onFilterSelect('Interview')}>
          <div className="stat-count">{stats.Interview}</div>
          <div className="stat-label">Interviews</div>
        </div>

        {/* Offers (Green Style) */}
        <div className="stat-card card-offer" onClick={() => onFilterSelect('Offer')}>
          <div className="stat-count">{stats.Offer}</div>
          <div className="stat-label">Offers</div>
        </div>

        {/* Rejections (Red Style) */}
        <div className="stat-card card-rejected" onClick={() => onFilterSelect('Rejected')}>
          <div className="stat-count">{stats.Rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
    </div>
  );
}
export default Header;