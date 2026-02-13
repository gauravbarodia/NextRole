import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

function JobForm({ onAdd }) {
  const [form, setForm] = useState({ company: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    
    // Default to 'Applied'
    onAdd({ ...form, status: 'Applied' });
    setForm({ company: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>Company</label>
        <input 
          className="input-styled input-large"
          placeholder="e.g. Google" 
          value={form.company}
          onChange={(e) => setForm({...form, company: e.target.value})}
          autoFocus // Automatically focus when popup opens
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>Role</label>
        <input 
          className="input-styled input-large"
          placeholder="e.g. Frontend Engineer" 
          value={form.role}
          onChange={(e) => setForm({...form, role: e.target.value})}
        />
      </div>

      <button type="submit" className="btn-primary btn-large" style={{ marginTop: '10px' }}>
        <PlusCircle size={22} /> Add Application
      </button>
    </form>
  );
}

export default JobForm;