import React, { useState } from 'react';
import defaultProfilePic from '../../assets/sidenav/profile.png';

export default function Avatar({ src, name, className, size = 32 }) {
    // If src is completely empty, fallback to ui-avatars.
    // If it's still missing or broken, onError will switch to defaultProfilePic.
    
    const generateFallback = () => {
        if (name) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=${size * 2}`;
        }
        return defaultProfilePic;
    };

    const [imgSrc, setImgSrc] = useState(src || generateFallback());

    React.useEffect(() => {
        setImgSrc(src || generateFallback());
    }, [src, name, size]);

    const handleError = () => {
        // Prevent infinite loops if the fallback itself fails
        if (imgSrc !== defaultProfilePic) {
            setImgSrc(defaultProfilePic);
        }
    };

    return (
        <img 
            className={`object-cover ${className}`}
            src={imgSrc} 
            alt={name || "User Avatar"} 
            onError={handleError}
        />
    );
}
