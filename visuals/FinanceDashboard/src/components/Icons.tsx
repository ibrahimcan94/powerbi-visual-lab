import React from "react";
export type IconName="grid"|"wallet"|"trend"|"users"|"invoice"|"search"|"menu"|"settings"|"chevron"|"close"|"arrow"|"sun"|"moon"|"info"|"check";
const paths:Record<IconName,React.ReactNode>={
    grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    wallet:<><path d="M4 5h14v4H4a2 2 0 0 1 0-4Zm0 4H3v11h18V9H4Z"/><path d="M15 13h6v4h-6z"/></>,
    trend:<><path d="m3 17 6-6 4 4 8-10M15 5h6v6"/></>,
    users:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/></>,
    invoice:<><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z M8 8h8M8 12h8M8 16h4"/></>,
    search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    menu:<path d="M4 6h16M4 12h16M4 18h16"/>,settings:<><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3H9Z"/><circle cx="12" cy="12" r="3"/></>,
    chevron:<path d="m9 5 7 7-7 7"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,moon:<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>,info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,check:<path d="m4 12 5 5L20 6"/>
};
export const Icon:React.FC<{name:IconName;size?:number}>=({name,size=20})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
