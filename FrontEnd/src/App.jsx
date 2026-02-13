import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import { dark } from '@clerk/themes';
import Header from './components/Header';
import JobForm from './components/JobForm';
import JobTable from './components/JobTable';
import './App.css'; 

function App() {
  const { user, isLoaded } = useUser();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'user-id': user?.id 
  });

  useEffect(() => {
    if (!user) return;
    const fetchJobs = async () => {
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (filterStatus && filterStatus !== 'All') query.append('status', filterStatus);

      try {
        const res = await fetch(`http://localhost:5000/jobs?${query.toString()}`, { headers: getHeaders() });
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
    };
    
    // Debounce search slightly
    const timeoutId = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, user]);

  const addJob = async (jobData) => {
    try {
      const response = await fetch('http://localhost:5000/jobs', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jobData),
      });
      if (response.status === 409) {
        const data = await response.json();
        if(window.confirm(`Duplicate! Update status of ${data.job.company}?`)) updateStatus(data.job.id, jobData.status);
        return;
      }
      if (response.ok) {
        setJobs([await response.json(), ...jobs]);
        setShowModal(false);
      }
    } catch (error) { console.error(error); }
  };

  const updateStatus = async (id, newStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    await fetch(`http://localhost:5000/jobs/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({status: newStatus}) });
  };

  const deleteJob = async (id) => {
    await fetch(`http://localhost:5000/jobs/${id}`, { method: 'DELETE', headers: getHeaders() });
    setJobs(jobs.filter(job => job.id !== id));
  };
  
  const deleteAllJobs = async () => {
    let url = 'http://localhost:5000/jobs/all';
    if (filterStatus !== 'All') url += `?status=${filterStatus}`;
    const res = await fetch(url, { method: 'DELETE', headers: getHeaders() });
    if(res.ok) filterStatus === 'All' ? setJobs([]) : setJobs(jobs.filter(j => j.status !== filterStatus));
  };

  // --- NEW: Handle "Enter" and "Escape" keys ---
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsSearchOpen(false); // Close on Enter
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false); // Close on Escape
      setSearchTerm('');      // Optional: Clear text on Escape
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  if (!isLoaded) return <div style={{color:'#ffaa00', padding: 40, textAlign: 'center'}}>Loading NextRole...</div>;

  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505' }}>
          <SignIn 
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#ffaa00',
                colorBackground: '#121212',
                colorText: '#ffffff',
                colorInputBackground: '#000000',
                colorInputText: '#ffaa00',
                borderRadius: '8px'
              }
            }}
          />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container">
          <Header jobs={jobs} onFilterSelect={setFilterStatus}>
            <div className="button-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                
                {/* ADD JOB BUTTON */}
                <button className="btn-action btn-add" onClick={() => setShowModal(true)}>
                  <Plus size={20} /> Add Job
                </button>
                
                {/* SEARCH TOGGLE LOGIC */}
                {!isSearchOpen ? (
                  <button className="btn-action" onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}>
                    <Search size={20} /> Search
                  </button>
                ) : (
                  <div className="expanded-section search-mode">
                    <div className="input-group">
                      <Search size={18} className="icon-left" />
                      <input 
                        ref={searchInputRef} 
                        className="input-clean" 
                        placeholder="Type & Press Enter..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onKeyDown={handleSearchKeyDown} /* <--- ADDED THIS */
                      />
                    </div>
                    {/* CLOSE BUTTON */}
                    <button onClick={closeSearch} className="btn-close-circle">
                      <X size={18}/>
                    </button>
                  </div>
                )}
                
                {/* USER PROFILE */}
                <div style={{ marginLeft: '10px' }}>
                  <UserButton 
                    appearance={{
                      baseTheme: dark,
                      variables: { colorPrimary: '#ffaa00' }
                    }}
                  />
                </div>
            </div>
          </Header>

          <JobTable jobs={jobs} onDelete={deleteJob} onStatusChange={updateStatus} onDeleteAll={deleteAllJobs} />

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">New Application</h2>
                  <button onClick={() => setShowModal(false)} className="btn-close-section"><X size={24} /></button>
                </div>
                <JobForm onAdd={addJob} />
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}

export default App;