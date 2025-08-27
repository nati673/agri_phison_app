import { useEffect } from 'react';

export function useDisableNumberInputScroll() {
  useEffect(() => {
    const handleWheel = (event) => {
      // Check if the event target is an input of type number
      if (event.target.type === 'number') {
        event.preventDefault(); // Prevent default scroll behavior
      }
    };

    // Add event listener to the document to capture wheel events
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup function to remove event listener on unmount
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount
}
