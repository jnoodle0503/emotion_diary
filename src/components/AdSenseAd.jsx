import React, { useEffect } from 'react';

const AdSenseAd = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block', marginTop: '2rem', marginBottom: '2rem' }
}) => {
  useEffect(() => {
    try {
      // Push the ad only if it hasn't been pushed yet
      if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-8158152519872192"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    ></ins>
  );
};

export default AdSenseAd;
