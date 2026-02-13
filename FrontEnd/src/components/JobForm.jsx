import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

/**
 * JobForm Component
 * * Simple form to add a new job application.
 * Uses local state to manage input before submitting to the parent.
 */
function JobForm({ onAdd }) {
  const [form, setForm] = useState({ company: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic Validation
    if (!form.company || !form.role) return;
    
    // Default new jobs to 'Applied' status
    onAdd({ ...form, status: 'Applied' });
    
    // Reset Form
    setForm({ company: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      {/* Company Input */}
      <div>
        <label className="input-label">Company</label>
        <input 
          className="input-styled"
          placeholder="e.g. Google" 
          value={form.company}
          onChange={(e) => setForm({...form, company: e.target.value})}
          autoFocus 
        />
      </div>

      {/* Role Input */}
      <div>
        <label className="input-label">Role</label>
        <input 
          className="input-styled"
          placeholder="e.g. Frontend Engineer" 
          value={form.role}
          onChange={(e) => setForm({...form, role: e.target.value})}
        />
      </div>

      <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
        <PlusCircle size={20} /> Add Application
      </button>
    </form>
  );
}
export default JobForm;