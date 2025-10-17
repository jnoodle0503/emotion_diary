import React, { useEffect } from 'react';

const AdSenseScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8158152519872192";
    script.async = true;
    script.crossOrigin = "anonymous";
    
    // Avoid adding multiple scripts
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      document.head.appendChild(script);
    }

    return () => {
      // Clean up the script when the component unmounts
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
};

export default AdSenseScript;
