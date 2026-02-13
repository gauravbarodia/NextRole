/**
 * Main Application Component
 * * This component acts as the central controller for the application.
 * It manages:
 * 1. Global State (Jobs list, Search term, Filter status)
 * 2. API Communication (Fetching, Adding, Updating, Deleting jobs)
 * 3. User Authentication (via Clerk)
 * 4. Layout Composition (Header, Table, Modals)
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus, Home } from "lucide-react"; 
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

// Component Imports
import Header from "./components/Header";
import JobForm from "./components/JobForm";
import JobTable from "./components/JobTable";

// Styles
import "./App.css";

function App() {
  // --- 1. Authentication & State ---
  const { user, isLoaded } = useUser();
  
  // Data State
  const [jobs, setJobs] = useState([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // 'All', 'Applied', 'Interview', etc.
  const [showModal, setShowModal] = useState(false);       // Toggles the "Add Job" modal
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Toggles the Search Bar visibility
  
  const searchInputRef = useRef(null); // Used to auto-focus input when search opens

  // --- 2. Helper Functions ---

  /**
   * Resets the dashboard view to the default state.
   * Clears search, resets filters, and closes search bar.
   */
  const goHome = () => {
    setSearchTerm(""); 
    setFilterStatus("All"); 
    setIsSearchOpen(false); 
  };

  /**
   * Generates headers for API requests.
   * Includes 'user-id' to ensure we only touch the current user's data.
   */
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "user-id": user?.id,
  });

  // --- 3. Effects (API Calls) ---

  /**
   * Fetch Jobs Effect
   * Runs whenever the user searches, changes filter, or logs in.
   * Includes a debounce (300ms) to prevent spamming the API while typing.
   */
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in

    const fetchJobs = async () => {
      // Build Query String
      const query = new URLSearchParams();
      if (searchTerm) query.append("search", searchTerm);
      if (filterStatus && filterStatus !== "All") query.append("status", filterStatus);

      try {
        const res = await fetch(`http://localhost:5000/jobs?${query.toString()}`, { headers: getHeaders() });
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    const timeoutId = setTimeout(fetchJobs, 300); // Debounce
    return () => clearTimeout(timeoutId); // Cleanup on re-render
  }, [searchTerm, filterStatus, user]);

  // --- 4. CRUD Handlers ---

  const addJob = async (jobData) => {
    try {
      const response = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(jobData),
      });

      // Handle Duplicates (HTTP 409)
      if (response.status === 409) {
        const data = await response.json();
        const confirmUpdate = window.confirm(`Duplicate! Update status of ${data.job.company}?`);
        if (confirmUpdate) updateStatus(data.job.id, jobData.status);
        return;
      }

      if (response.ok) {
        const newJob = await response.json();
        setJobs([newJob, ...jobs]); // Optimistic update
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    // 1. Optimistic UI Update (Update state immediately)
    setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)));
    
    // 2. API Call
    await fetch(`http://localhost:5000/jobs/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const deleteJob = async (id) => {
    // 1. API Call
    await fetch(`http://localhost:5000/jobs/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    // 2. Update UI
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const deleteAllJobs = async () => {
    let url = "http://localhost:5000/jobs/all";
    if (filterStatus !== "All") url += `?status=${filterStatus}`;
    
    const res = await fetch(url, { method: "DELETE", headers: getHeaders() });
    
    if (res.ok) {
      // If filtering, only remove those visible. If 'All', clear everything.
      filterStatus === "All"
        ? setJobs([])
        : setJobs(jobs.filter((j) => j.status !== filterStatus));
    }
  };

  // --- 5. UI Event Handlers ---

  // Closes search on 'Enter' or 'Escape'
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setIsSearchOpen(false);
    if (e.key === "Escape") closeSearch();
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  // Loading State
  if (!isLoaded) return <div className="loading-screen">Loading NextRole...</div>;

  return (
    <>
      {/* State: User NOT Logged In */}
      <SignedOut>
        <div className="auth-container">
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#ffaa00",
                colorBackground: "#121212",
                colorText: "#ffffff",
                colorInputBackground: "#000000",
                colorInputText: "#ffaa00",
                borderRadius: "8px",
              },
            }}
          />
        </div>
      </SignedOut>

      {/* State: User Logged In */}
      <SignedIn>
        <div className="container">
          
          {/* --- HEADER SECTION --- */}
          <Header jobs={jobs} onFilterSelect={setFilterStatus} onHome={goHome}>
            <div className="button-group">
              
              {/* Home Button */}
              <button className="btn-action" onClick={goHome} title="Reset to Home">
                <Home size={20} />
              </button>

              {/* Add Job Button */}
              <button className="btn-action btn-add" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Add Application
              </button>

              {/* Search Toggle Logic */}
              {!isSearchOpen ? (
                <button
                  className="btn-action"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                >
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
                      onKeyDown={handleSearchKeyDown}
                    />
                  </div>
                  <button onClick={closeSearch} className="btn-close-circle">
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* User Profile Bubble */}
              <div style={{ marginLeft: "10px" }}>
                <UserButton appearance={{ baseTheme: dark, variables: { colorPrimary: "#ffaa00" } }} />
              </div>
            </div>
          </Header>

          {/* --- MAIN TABLE SECTION --- */}
          <JobTable
            jobs={jobs}
            onDelete={deleteJob}
            onStatusChange={updateStatus}
            onDeleteAll={deleteAllJobs}
          />

          {/* --- MODAL SECTION --- */}
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