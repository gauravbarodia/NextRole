import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

function JobForm({ onAdd }) {
  const [form, setForm] = useState({ company: '', role: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return;
    
    // Pass only the raw data; App.jsx handles status & date
    onAdd(form);
    
    setForm({ company: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
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