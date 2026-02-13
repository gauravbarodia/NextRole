import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Plus, Home } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

// Component Imports
import Header from "./components/Header";
import JobForm from "./components/JobForm";
import JobTable from "./components/JobTable";

// Styles
import "./App.css";

function App() {
  // --- 1. Configuration & Authentication ---
  const { user, isLoaded } = useUser();
  
  // Use Railway URL if available, otherwise fallback to local for development
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Data State
  const [jobs, setJobs] = useState([]);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchInputRef = useRef(null);

  // --- 2. Helper Functions ---

  const goHome = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setIsSearchOpen(false);
  };

  // Memoize headers so they don't change unless user changes
  const getHeaders = useMemo(() => ({
    "Content-Type": "application/json",
    "user-id": user?.id,
  }), [user?.id]);

  // --- 3. Effects (API Calls) ---

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      const query = new URLSearchParams();
      if (searchTerm) query.append("search", searchTerm);
      if (filterStatus && filterStatus !== "All") query.append("status", filterStatus);

      try {
        const res = await fetch(`${BASE_URL}/jobs?${query.toString()}`, { 
            headers: getHeaders 
        });
        
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching jobs:", err);
      }
    };

    const timeoutId = setTimeout(fetchJobs, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, user, BASE_URL, getHeaders]);

  // --- 4. CRUD Handlers ---

  const addJob = async (jobData) => {
    try {
      const response = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers: getHeaders,
        body: JSON.stringify(jobData),
      });

      if (response.status === 409) {
        const data = await response.json();
        const confirmUpdate = window.confirm(`Duplicate found. Update status of ${data.job.company}?`);
        if (confirmUpdate) updateStatus(data.job.id, jobData.status);
        return;
      }

      if (response.ok) {
        const newJob = await response.json();
        setJobs((prev) => [newJob, ...prev]);
        setShowModal(false);
      }
    } catch (error) {
      console.error("❌ Error adding job:", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // Optimistic UI Update
      setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)));

      await fetch(`${BASE_URL}/jobs/${id}`, {
        method: "PUT",
        headers: getHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  const deleteJob = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: getHeaders,
      });

      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== id));
      }
    } catch (error) {
      console.error("❌ Error deleting job:", error);
    }
  };

  const deleteAllJobs = async () => {
    try {
      let url = `${BASE_URL}/jobs/all`;
      if (filterStatus !== "All") url += `?status=${filterStatus}`;

      const res = await fetch(url, { method: "DELETE", headers: getHeaders });

      if (res.ok) {
        filterStatus === "All"
          ? setJobs([])
          : setJobs(jobs.filter((j) => j.status !== filterStatus));
      }
    } catch (error) {
      console.error("❌ Error clearing jobs:", error);
    }
  };

  // --- 5. UI Logic ---

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setIsSearchOpen(false);
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  if (!isLoaded) return <div className="loading-screen">Loading NextRole...</div>;

  return (
    <>
      <SignedOut>
        <div className="auth-container">
          <SignIn appearance={{ baseTheme: dark, variables: { colorPrimary: "#ffaa00" } }} />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container">
          <Header jobs={jobs} onFilterSelect={setFilterStatus} onHome={goHome}>
            <div className="button-group">
              <button className="btn-action" onClick={goHome} title="Home"><Home size={20} /></button>
              
              <button className="btn-action btn-add" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Add Application
              </button>

              {!isSearchOpen ? (
                <button className="btn-action" onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}>
                  <Search size={20} /> Search
                </button>
              ) : (
                <div className="expanded-section search-mode">
                  <div className="input-group">
                    <Search size={18} className="icon-left" />
                    <input
                      ref={searchInputRef}
                      className="input-clean"
                      placeholder="Search company or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                    />
                  </div>
                  <button onClick={() => {setIsSearchOpen(false); setSearchTerm("");}} className="btn-close-circle">
                    <X size={18} />
                  </button>
                </div>
              )}

              <div style={{ marginLeft: "10px" }}>
                <UserButton appearance={{ baseTheme: dark, variables: { colorPrimary: "#ffaa00" } }} />
              </div>
            </div>
          </Header>

          <JobTable
            jobs={jobs}
            onDelete={deleteJob}
            onStatusChange={updateStatus}
            onDeleteAll={deleteAllJobs}
          />

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">New Application</h2>
                  <button onClick={() => setShowModal(false)} className="btn-close-section">
                    <X size={24} />
                  </button>
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