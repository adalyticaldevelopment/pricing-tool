export const sendHeightToParent = () => {
  if (window.parent !== window) {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'resize', height }, '*');
  }
};

// Observe DOM changes to update height
export const observeHeightChanges = () => {
  if (typeof window === 'undefined') return;

  const resizeObserver = new ResizeObserver(() => {
    sendHeightToParent();
  });

  resizeObserver.observe(document.body);

  // Also send height on initial load and after any dynamic content changes
  window.addEventListener('load', sendHeightToParent);
  const mutationObserver = new MutationObserver(sendHeightToParent);
  mutationObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}; 