import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from './page';
import './resume.css';
createRoot(document.getElementById('resume-root')!).render(<Home/>);
