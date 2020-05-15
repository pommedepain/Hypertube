import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth * 1.2 : undefined,
      height: isClient ? window.innerHeight * 1.2 : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    function getSize() {
        return {
          width: isClient ? window.innerWidth * 1.2 : undefined,
          height: isClient ? window.innerHeight * 1.2 : undefined
        };
      }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]); 

  return windowSize;
}
