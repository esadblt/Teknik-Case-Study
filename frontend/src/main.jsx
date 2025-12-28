import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import '@siemens/ix/dist/siemens-ix/siemens-ix.css'
import {defineCustomElements} from '@siemens/ix/loader'

defineCustomElements();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
