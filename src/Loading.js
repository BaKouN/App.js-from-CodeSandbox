import { useEffect, useState } from 'react';
import './preloader.css';           // see step 2
import * as THREE from 'three';

/**
 * Shows a fullscreen overlay until:
 *   – window "load" event fires,  AND
 *   – every URL in `sources` has finished downloading
 *
 * Children are rendered right away (canvas starts loading in the bg).
 */
export default function Preloader({ sources = [], children }) {
  const [done, setDone] = useState(false);

useEffect(() => {
  /* A. window load  +  B. critical images (your current code) */
  const win  = new Promise(res => window.addEventListener('load', res, { once:true }));
  const imgs = Promise.all(
    sources.map(
      src => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = src; })
    )
  );

  /* C. NEW: wait for Three’s DefaultLoadingManager */
  const threeReady = new Promise(res => {
    // If nothing is in the queue, onLoad fires immediately
    THREE.DefaultLoadingManager.onLoad = res;
  });

  Promise.all([win, imgs, threeReady]).then(() => setDone(true));
}, [sources]);

  

  return (
    <>
      {children}

      {/* overlay is rendered until done === true */}
      <div className={`loader-overlay ${done ? 'fade-out' : ''}`}>
        <h1 className="loader-title">Ta surprise est bientot prete Emma...</h1>
        <h2 className="loader-title">De la part ton plus grand fan</h2>
      </div>
    </>
  );
}