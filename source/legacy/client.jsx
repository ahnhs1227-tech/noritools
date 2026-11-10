import React from 'react';
import {createRoot} from 'react-dom/client';
import Tools from './Tools.jsx';
const root=document.getElementById('legacy-root');
createRoot(root).render(React.createElement(Tools,{tool:root.dataset.tool}));
