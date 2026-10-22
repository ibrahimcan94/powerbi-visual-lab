import React,{useEffect,useRef} from "react";
import {Icon} from "./Icons";
export const Drawer:React.FC<{title:string;onClose:()=>void;children:React.ReactNode}>=({title,onClose,children})=>{
    const panel=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null);
    useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();return()=>previous?.focus();},[]);
    return <div className="fd-drawer-overlay" onClick={onClose}><aside className="fd-drawer" role="dialog" aria-modal="true" aria-label={title} ref={panel} onClick={e=>e.stopPropagation()} onKeyDown={e=>{
        if(e.key==="Escape")onClose();
        if(e.key==="Tab"){
            const nodes=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,a[href],[tabindex="0"]')??[]),first=nodes[0],last=nodes[nodes.length-1];
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
        }
    }}><header><div><span className="fd-eyebrow">Finance workspace</span><h2>{title}</h2></div><button ref={close} className="fd-icon-button" aria-label="Close panel" onClick={onClose}><Icon name="close"/></button></header>{children}</aside></div>;
};
