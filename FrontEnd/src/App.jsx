import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus, Home, LogOut, Trash2 } from "lucide-react"; // Added Trash2 import

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from "./firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc
} from "firebase/firestore";

// Component Imports
import Header from "./components/Header";
import JobForm from "./components/JobForm";
import JobTable from "./components/JobTable";

// Styles
import "./App.css";

function App() {
  // --- 1. Authentication State ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data State
  const [jobs, setJobs] = useState([]);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null); // Stores ID or 'ALL'

  const searchInputRef = useRef(null);

  // --- 2. Auth & Data Effects ---

  // Listen for Authentication Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Jobs
  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      try {
        let q = query(
          collection(db, "applications"), 
          where("user_id", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by Date (Client Side)
        data.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));

        // Filter by Search
        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          data = data.filter(job => 
            job.company.toLowerCase().includes(lowerTerm) || 
            job.role.toLowerCase().includes(lowerTerm)
          );
        }

        // Filter by Status
        if (filterStatus !== "All") {
          data = data.filter(job => job.status === filterStatus);
        }

        setJobs(data);
      } catch (err) {
        console.error("❌ Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, [user, searchTerm, filterStatus]);

  // --- 3. Helper Functions ---

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setJobs([]); 
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  const goHome = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setIsSearchOpen(false);
  };

  // --- 4. CRUD Handlers ---

  const addJob = async (jobData) => {
    if (!user) return;
    try {
      const newJob = {
        ...jobData,
        status: "Applied",
        date_applied: new Date().toISOString(),
        user_id: user.uid 
      };

      const docRef = await addDoc(collection(db, "applications"), newJob);
      setJobs(prev => [{ ...newJob, id: docRef.id }, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error adding job:", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)));
      const jobRef = doc(db, "applications", id);
      await updateDoc(jobRef, { status: newStatus });
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  // --- NEW: DELETE HANDLERS ---

  // Step 1: Open Modal for Single Delete
  const confirmDelete = (id) => {
    setJobToDelete(id);
    setShowDeleteModal(true);
  };

  // Step 1: Open Modal for Delete All
  const confirmDeleteAll = () => {
    setJobToDelete('ALL');
    setShowDeleteModal(true);
  };

  // Step 2: Actually Execute Delete (Runs when user clicks "Yes")
  const executeDelete = async () => {
    if (!user) return;
    
    try {
      if (jobToDelete === 'ALL') {
        const deletePromises = jobs.map(job => deleteDoc(doc(db, "applications", job.id)));
        await Promise.all(deletePromises);
        setJobs([]);
      } else {
        await deleteDoc(doc(db, "applications", jobToDelete));
        setJobs(jobs.filter((job) => job.id !== jobToDelete));
      }
    } catch (error) {
      console.error("❌ Error deleting:", error);
    } finally {
      // Close Modal & Reset
      setShowDeleteModal(false);
      setJobToDelete(null);
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

  if (authLoading) return <div className="loading-screen">Loading NextRole...</div>;

  return (
    <>
      {!user ? (
        <div className="auth-container">
          <div className="login-card" style={{ textAlign: 'center', color: '#ffaa00' }}>
            <h1>NextRole</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>Track your job applications simply.</p>
            <button className="btn-action" onClick={handleLogin} style={{ margin: '0 auto' }}>
              Sign In with Google
            </button>
          </div>
        </div>
      ) : (
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

              <div style={{ marginLeft: "10px", display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #ffaa00' }} 
                />
                <button 
                  onClick={handleLogout} 
                  className="btn-close-circle" 
                  title="Sign Out"
                  style={{ width: 32, height: 32 }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </Header>

          {/* Pass the CONFIRM functions, not the EXECUTE functions */}
          <JobTable
            jobs={jobs}
            onDelete={confirmDelete}
            onStatusChange={updateStatus}
            onDeleteAll={confirmDeleteAll}
          />

          {/* ADD JOB MODAL */}
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

          {/* NEW: DELETE CONFIRMATION MODAL */}
          {showDeleteModal && (
            <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
              <div 
                className="modal-content" 
                style={{ maxWidth: '400px', textAlign: 'center', borderColor: '#ef4444' }} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ marginBottom: '20px', color: '#ef4444' }}>
                   <Trash2 size={48} style={{ margin: '0 auto' }} />
                </div>
                <h2 className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
                  Are you sure?
                </h2>
                <p style={{ color: '#a1a1aa', marginBottom: '30px', fontSize: '1rem' }}>
                  {jobToDelete === 'ALL' 
                    ? "This will permanently delete ALL applications in this list."
                    : "You are about to remove this application permanently."}
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)} 
                    className="btn-action"
                    style={{ border: '1px solid #525252', color: '#d4d4d8', width: '100px', justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeDelete} 
                    className="btn-action"
                    style={{ 
                      background: '#ef4444', 
                      borderColor: '#ef4444', 
                      color: '#fff', 
                      width: '100px', 
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

export default App;