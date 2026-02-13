import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Ensure this exists, or remove if unused
import './App.css'   // We use this one
import { ClerkProvider } from '@clerk/clerk-react'

// REPLACE WITH YOUR KEY
const PUBLISHABLE_KEY = "pk_test_Ym9sZC1hZGRlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk"; 

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)