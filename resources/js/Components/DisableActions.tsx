// components/DisableActions.tsx

import { useEffect } from 'react';
import { router } from '@inertiajs/react';

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes
const WARNING_TIME = 60 * 1000; // Warn 1 minute before logout

const DisableActions = () => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;
    let warningShown = false;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('Right-click is disabled on this page.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')
      ) {
        e.preventDefault();
        alert('This action is disabled.');
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    /**
     * Disable text selection across browsers
     */
    const disableTextSelection = () => {
      const style = document.body.style;
      style.userSelect = 'none';
      (style as any).webkitUserSelect = 'none'; // Safari
      (style as any).mozUserSelect = 'none';    // Firefox
      (style as any).msUserSelect = 'none';     // IE/Edge
    };

    /**
     * Add transparent overlay on images to prevent right-click saving
     */
    const protectImages = () => {
      document.querySelectorAll('img').forEach(img => {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '10';
        overlay.style.backgroundColor = 'transparent';
        if (img.parentElement) {
          img.parentElement.style.position = 'relative';
          img.parentElement.appendChild(overlay);
        }
      });
    };

    /**
     * Reset inactivity timer on user interaction
     */
    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      warningShown = false;

      timeoutId = setTimeout(() => {
        // Show warning before logout
        warningTimeoutId = setTimeout(() => {
          if (!warningShown) {
            warningShown = true;
            const confirmed = confirm(
              'You will be logged out due to inactivity in 1 minute. Click OK to stay logged in.'
            );
            if (confirmed) {
              resetTimer(); // Extend session
            } else {
              forceLogout();
            }
          }
        }, INACTIVITY_TIME - WARNING_TIME);

        // Force logout after full timeout
        setTimeout(() => {
          forceLogout();
        }, INACTIVITY_TIME);
      }, 1000); // Start 1s after last activity
    };

    /**
     * Force logout via Inertia POST to /logout, then redirect to /login
     */
    const forceLogout = () => {
      if (
        confirm('You have been inactive. For security, you are being logged out.')
      ) {
        router.visit('/logout', {
          method: 'post',
          preserveState: false,
          preserveScroll: false,
          onSuccess: () => {
            router.visit('/login');
          },
        });
      } else {
        router.visit('/login');
      }
    };

    // Track user activity to reset timer
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    // Apply restrictions
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);
    disableTextSelection();
    setTimeout(protectImages, 500); // Wait for images to render

    // Start initial timer
    resetTimer();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      activityEvents.forEach(event =>
        window.removeEventListener(event, resetTimer, true)
      );
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      document.body.style.userSelect = ''; // Re-enable text selection
    };
  }, []);

  return null; // No UI rendered
};

export default DisableActions;
