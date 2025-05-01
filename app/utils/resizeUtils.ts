export const sendHeightToParent = () => {
  if (window.parent !== window) {
    // Get the maximum height by checking multiple elements
    const bodyHeight = document.body.scrollHeight;
    const htmlHeight = document.documentElement.scrollHeight;
    const mainContent = document.querySelector('main')?.scrollHeight || 0;
    const height = Math.max(bodyHeight, htmlHeight, mainContent) + 50; // Add padding
    window.parent.postMessage({ type: 'resize', height }, '*');
  }
};

// Observe DOM changes to update height
export const observeHeightChanges = () => {
  if (typeof window === 'undefined') return;

  // Initial resize after a short delay to ensure content is loaded
  setTimeout(sendHeightToParent, 100);
  setTimeout(sendHeightToParent, 500);
  setTimeout(sendHeightToParent, 1000);

  // Observe size changes
  const resizeObserver = new ResizeObserver(() => {
    sendHeightToParent();
  });

  resizeObserver.observe(document.body);

  // Observe DOM changes
  const mutationObserver = new MutationObserver(() => {
    setTimeout(sendHeightToParent, 0);
  });

  mutationObserver.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    characterData: true
  });

  // Additional event listeners
  window.addEventListener('load', sendHeightToParent);
  window.addEventListener('resize', sendHeightToParent);
  
  // Check for dynamic content loading
  const checkForChanges = setInterval(sendHeightToParent, 1000);
  
  // Cleanup function
  return () => {
    clearInterval(checkForChanges);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    window.removeEventListener('load', sendHeightToParent);
    window.removeEventListener('resize', sendHeightToParent);
  };
}; 