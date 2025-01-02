// Draggable functionality for the popup
function initDraggable(element, handle) {
  let isDragging = false;
  let startX, startY;
  let elementX, elementY;

  // Add drag handle to header
  const dragHandle = document.createElement('div');
  dragHandle.className = 'drag-handle';
  dragHandle.innerHTML = '⋮⋮';
  handle.insertBefore(dragHandle, handle.firstChild);

  dragHandle.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    window.isDragging = true;

    // Get current element position
    const rect = element.getBoundingClientRect();
    elementX = rect.left;
    elementY = rect.top;

    // Get mouse position
    startX = e.clientX;
    startY = e.clientY;

    // Reset any fixed positioning
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.left = `${elementX}px`;
    element.style.top = `${elementY}px`;

    // Add dragging class
    element.classList.add('dragging');
    dragHandle.style.cursor = 'grabbing';
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    // Calculate new position
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementRect = element.getBoundingClientRect();

    // Calculate new position with bounds checking
    let newX = elementX + dx;
    let newY = elementY + dy;

    // Keep element within viewport
    newX = Math.max(0, Math.min(newX, viewportWidth - elementRect.width));
    newY = Math.max(0, Math.min(newY, viewportHeight - elementRect.height));

    // Update element position
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  }

  function stopDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    window.isDragging = false;
    
    // Remove dragging class
    element.classList.remove('dragging');
    dragHandle.style.cursor = 'grab';
  }
}

// Export for use in content.js
window.initDraggable = initDraggable; 