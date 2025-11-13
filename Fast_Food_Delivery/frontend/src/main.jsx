import React from 'react'
import ReactDom from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'


// https://fast-food-delivery-ecommerce-ci-cd-three-om5v.onrender.com

Sentry.init({

  dsn: process.env.REACT_APP_SENTRY_DSN,

  // Setting this option to true will send default PII data to Sentry.

  // For example, automatic IP address collection on events

  sendDefaultPii: true,

  integrations: [

    Sentry.browserTracingIntegration()

  ],

// Tracing

tracesSampleRate: 1.0, // Capture 100% of the transactions

  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled

  tracePropagationTargets: ["localhost", /^https:\/\/fast-food-delivery-ecommerce-ci-cd-three-om5v\.onrender\.com\/api/],

  // Enable logs to be sent to Sentry

  enableLogs: true
});

ReactDom.createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
)
