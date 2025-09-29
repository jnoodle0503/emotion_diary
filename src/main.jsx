import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import './index.css'
import './lib/i18n'; // Import i18n configuration
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import i18n from './lib/i18n'; // Import the i18n instance

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <I18nextProvider i18n={i18n}> {/* Wrap App with I18nextProvider */}
          <App />
        </I18nextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)