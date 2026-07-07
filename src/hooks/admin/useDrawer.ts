import { useState, useCallback, useEffect } from 'react';

export function useDrawer(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const openDrawer = useCallback((drawerData = null) => {
    setData(drawerData);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setData(null), 300); // Wait for animation
  }, []);

  const toggleDrawer = useCallback(() => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [isOpen, openDrawer, closeDrawer]);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll positions (both window and main element)
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const mainContent = document.querySelector('main');
      const mainScrollTop = mainContent ? mainContent.scrollTop : 0;
      
      // Prevent body scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Prevent scrolling on the main content area (this is where actual scrolling happens)
      let preventScrollHandler;
      if (mainContent) {
        mainContent.style.overflow = 'hidden';
        // Prevent scroll events only on the main content, allow scrolling in modals/drawers
        preventScrollHandler = (e) => {
          // Check if the event target or its parents is within a modal/drawer
          let target = e.target;
          let isInModalOrDrawer = false;
          
          // Traverse up the DOM tree to check if we're inside a modal/drawer
          while (target && target !== document.documentElement) {
            // Check for modal/drawer containers (they have z-50 class or scrollable containers)
            if (target.classList && target.classList.length > 0) {
              const classList = Array.from(target.classList);
              // Check if any class contains modal/drawer indicators or is scrollable
              const hasModalDrawerClass = classList.some(cls => 
                cls.includes('z-50') || 
                cls.includes('modal') || 
                cls.includes('drawer')
              );
              const hasScrollableClass = classList.some(cls => 
                cls.includes('overflow-y-auto') || 
                cls.includes('overflow-y-scroll')
              );
              
              // Check if this is a fixed positioned element (likely a modal/drawer container)
              const computedStyle = window.getComputedStyle(target);
              const isFixed = computedStyle.position === 'fixed' && target.classList.contains('z-50');
              
              if (hasModalDrawerClass || hasScrollableClass || isFixed) {
                isInModalOrDrawer = true;
                break;
              }
            }
            target = target.parentElement;
          }
          
          // Only prevent scroll if we're NOT in a modal/drawer
          if (!isInModalOrDrawer) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        };
        document.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true });
        document.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });

        return () => {
          // Restore scrolling
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.width = '';
          document.body.style.overflow = '';
          
          if (preventScrollHandler) {
            mainContent.style.overflow = '';
            document.removeEventListener('wheel', preventScrollHandler, { capture: true });
            document.removeEventListener('touchmove', preventScrollHandler, { capture: true });
          }
          
          // Restore scroll positions
          if (mainContent.scrollTop !== mainScrollTop) {
            mainContent.scrollTop = mainScrollTop;
          }
          window.scrollTo(scrollX, scrollY);
        };
      } else {
        return () => {
          // Restore scrolling
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.width = '';
          document.body.style.overflow = '';
          window.scrollTo(scrollX, scrollY);
        };
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeDrawer]);

  return {
    isOpen,
    data,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
}
