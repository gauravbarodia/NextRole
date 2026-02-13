import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import Header from './components/Header';
import JobForm from './components/JobForm';
import JobTable from './components/JobTable';
import './App.css'; 

function App() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('none'); 
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'search' && searchInputRef.current) searchInputRef.current.focus();
  }, [activeTab]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (filterStatus && filterStatus !== 'All') query.append('status', filterStatus);

        const res = await fetch(`http://localhost:5000/jobs?${query.toString()}`);
        const data = await res.json();
        setJobs(data);
      } catch (err) { console.error(err); }
    };
    const timeoutId = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  const addJob = async (jobData) => {
    try {
      const response = await fetch('http://localhost:5000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (response.status === 409) {
        const data = await response.json();
        const shouldUpdate = window.confirm(`Duplicate! Update status of ${data.job.company}?`);
        if (shouldUpdate) updateStatus(data.job.id, jobData.status);
        return;
      }
      if (response.ok) {
        const newJob = await response.json();
        setJobs([newJob, ...jobs]);
        setActiveTab('none');
      }
    } catch (error) { console.error(error); }
  };

  const updateStatus = async (id, newStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    try {
      await fetch(`http://localhost:5000/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) { console.error(error); }
  };

  const deleteJob = async (id) => {
    try {
      await fetch(`http://localhost:5000/jobs/${id}`, { method: 'DELETE' });
      setJobs(jobs.filter(job => job.id !== id));
    } catch (error) { console.error(error); }
  };

  const deleteAllJobs = async () => {
    let url = 'http://localhost:5000/jobs/all';
    if (filterStatus !== 'All') url += `?status=${filterStatus}`;

    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (filterStatus === 'All') setJobs([]);
        else setJobs(jobs.filter(job => job.status !== filterStatus));
      }
    } catch (error) { console.error("Error clearing jobs:", error); }
  };

  const closeAll = () => { setActiveTab('none'); setSearchTerm(''); setFilterStatus('All'); };

  return (
    <div className="container">
      <Header jobs={jobs} onFilterSelect={setFilterStatus}>
        <div className="action-bar">
          {activeTab === 'none' && (
            <div className="button-group">
              <button className="btn-action btn-add" onClick={() => setActiveTab('add')}>
                <Plus size={18} /> Add Job
              </button>
              <button className="btn-action btn-search" onClick={() => setActiveTab('search')}>
                <Search size={18} /> Search
              </button>
            </div>
          )}
          {activeTab === 'add' && (
            <div className="expanded-section">
              <div className="section-header">
                <h3>New Application</h3>
                <button onClick={closeAll} className="btn-close-section"><X size={20}/></button>
              </div>
              <JobForm onAdd={addJob} />
            </div>
          )}
          {activeTab === 'search' && (
            <div className="expanded-section search-mode">
               <div className="input-group">
                <Search size={18} className="icon-left" />
                <input 
                  ref={searchInputRef} 
                  className="input-clean" 
                  placeholder="Search companies or roles..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  autoFocus
                />
              </div>
              
              {/* REMOVED: Divider and Filter Dropdown */}
              
              <button onClick={closeAll} className="btn-close-circle">
                <X size={18}/>
              </button>
            </div>
          )}
        </div>
      </Header>

      <JobTable jobs={jobs} onDelete={deleteJob} onStatusChange={updateStatus} onDeleteAll={deleteAllJobs} />
    </div>
  );
}

export default App;