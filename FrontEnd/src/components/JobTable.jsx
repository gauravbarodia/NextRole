import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

function JobTable({ jobs, onDelete, onStatusChange, onDeleteAll }) {
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Offer': return { background: '#065f46', color: '#34d399', border: '1px solid #059669' };
      case 'Interview': return { background: '#451a03', color: '#fbbf24', border: '1px solid #b45309' };
      case 'Rejected': return { background: '#450a0a', color: '#f87171', border: '1px solid #991b1b' };
      default: return { background: '#1e1b4b', color: '#818cf8', border: '1px solid #4338ca' };
    }
  };

  return (
    <div className="table-wrapper">
      <div className="table-header-row">
        <span className="table-title">Recent Applications</span>
        {jobs.length > 0 && (
          <button className="btn-delete-all" onClick={onDeleteAll}>
            <AlertTriangle size={14} style={{marginRight: '6px'}}/> CLEAR ALL
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#d4d4d8', fontStyle: 'italic', opacity: 0.7 }}>
                NO APPLICATIONS FOUND.
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const style = getStatusStyle(job.status);
              return (
                <tr key={job.id}>
                  {/* Company Name */}
                  <td style={{ fontWeight: '800', letterSpacing: '0.05em' }}>
                    {job.company.toUpperCase()}
                  </td>
                  
                  {/* ROLE: UPDATED TO GOLD */}
                  <td style={{ fontWeight: '600', color: '#ffaa00' }}> 
                    {job.role.toUpperCase()}
                  </td>
                  
                  <td style={{ color: '#71717a', fontSize: '0.9rem' }}>
                    {new Date(job.date_applied).toLocaleDateString()}
                  </td>
                  <td>
                    <select 
                      className="status-badge"
                      value={job.status}
                      onChange={(e) => onStatusChange(job.id, e.target.value)}
                      style={style}
                    >
                      <option value="Applied">APPLIED</option>
                      <option value="Interview">INTERVIEW</option>
                      <option value="Offer">OFFER</option>
                      <option value="Rejected">REJECTED</option>
                      <option value="Wishlist">WISHLIST</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => onDelete(job.id)} className="btn-icon">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;