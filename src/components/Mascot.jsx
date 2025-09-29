import React from 'react';
import './Mascot.css'; // 스타일을 위해 유지

function Mascot() {
  return (
    <svg viewBox="0 0 40 40" width="100" height="100" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>
      {/* 몸통 (나무 줄기) */}
      <rect x="17" y="25" width="6" height="10" rx="3" ry="3" fill="#8B4513" filter="url(#shadow)" />
      {/* 잎사귀 (풍성하고 둥근 형태) */}
      <path 
        d="M 5,20 C 0,10 10,0 20,5 C 30,0 40,10 35,20 C 40,30 30,40 20,35 C 10,40 0,30 5,20 Z" 
        fill="#4B8A74" 
        filter="url(#shadow)"
      />
    </svg>
  );
}

export default Mascot;
