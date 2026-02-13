import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

function JobTable({ jobs, onDelete, onStatusChange, onDeleteAll }) {
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Offer': return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
      case 'Interview': return { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
      case 'Rejected': return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
      default: return { background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' };
    }
  };

  return (
    <div className="table-wrapper">
      <div className="table-header-row">
        <span className="table-title">Recent Applications</span>
        {jobs.length > 0 && (
          <button className="btn-delete-all" onClick={onDeleteAll}>
            <AlertTriangle size={14} /> Clear All
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No applications found.</td></tr>
          ) : (
            jobs.map((job) => {
              const style = getStatusStyle(job.status);
              return (
                <tr key={job.id}>
                  <td style={{ fontWeight: '600' }}>{job.company}</td>
                  <td>{job.role}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(job.date_applied).toLocaleDateString()}
                  </td>
                  <td>
                    <select 
                      className="status-badge"
                      value={job.status}
                      onChange={(e) => onStatusChange(job.id, e.target.value)}
                      style={style}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Wishlist">Wishlist</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => onDelete(job.id)} className="btn-icon">
                      <Trash2 size={18} />
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