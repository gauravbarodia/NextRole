import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

function JobForm({ onAdd }) {
  const [form, setForm] = useState({ company: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    onAdd({ ...form, status: 'Applied' });
    setForm({ company: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div>
        <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.9rem' }}>Company</label>
        <input 
          className="input-styled"
          placeholder="e.g. Google" 
          value={form.company}
          onChange={(e) => setForm({...form, company: e.target.value})}
          autoFocus 
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.9rem' }}>Role</label>
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