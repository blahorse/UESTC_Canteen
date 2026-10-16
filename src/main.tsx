import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import InstallApp from './install-app';
import './style.css';
createRoot(document.getElementById('root')!).render(<><App/><InstallApp/></>);
