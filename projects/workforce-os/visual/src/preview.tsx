import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import rows from './sample.json';
createRoot(document.getElementById('root')!).render(<><div className="wo-demo">SYNTHETIC DEMO · Fictional people and figures · No Workday connection</div><div style={{height:'calc(100% - 28px)'}}><App rows={rows}/></div></>);
