## SpecStory

## CSS Resizing and Style Adjustments (2/15/2025, 12:46:14 AM)

_**User**_

1. Remove or Relax Conflicting Size Rules
Open styles.css.
Find any fixed or max sizing applied to .modern-popout that uses !important (e.g. max-height: 400px !important; width: 420px !important;).
Remove or substantially relax those rules, especially the ones forcing a maximum height of 400px or a fixed width of 420px. Otherwise, the inline styles you set during resizing may conflict with the !important declarations.
Keep or move the flexible constraints to your .modern-popout.resizable class, but do not use !important. For example:
css
Copy
.modern-popout {
  /* Remove width, height, max-height, or any fixed constraints here */
}

.modern-popout.resizable {
  min-width: 300px;
  max-width: 800px; /* optional */
  min-height: 200px;
  max-height: 800px; /* optional */
  transition: none; /* You can disable transitions during resize */
}
Ensure you have a resizer.bottom-right element in the DOM so the user sees the handle (already present, but confirm it’s not visually hidden forever).

---

_**Assistant**_

I'll help you modify the styles to fix the resizing conflicts. Here are the changes needed:

```css:styles.css
// ... existing code ...

.modern-popout {
  position: fixed !important;
  right: 2rem !important;
  background: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border: none !important;
  border-radius: 12px !important;
  z-index: 2147483647 !important;
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  overflow: hidden !important;
  opacity: 0;
  display: flex !important;
  flex-direction: column !important;
  -webkit-font-smoothing: antialiased !important;
  animation: fadeIn 0.2s ease forwards !important;
}

// ... existing code ...

/* Update resizable popup styles */
.modern-popout.resizable {
  min-width: 300px;
  min-height: 200px;
  max-width: 800px;
  max-height: 800px;
  transition: none;
  width: auto;
  height: auto;
}

/* Update resizer visibility */
.resizer.bottom-right {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.modern-popout:hover .resizer.bottom-right {
  opacity: 1;
}

.modern-popout.resizing .resizer.bottom-right {
  opacity: 1;
}

// ... rest of existing code ...
```

The key changes are:
1. Removed fixed width/height constraints from .modern-popout
2. Moved sizing constraints to .modern-popout.resizable without !important
3. Improved resizer visibility handling
4. Removed max-width/height constraints that were conflicting with resize

This should allow the resize functionality to work properly while maintaining the popup's other styling characteristics.

---

_**User**_

2. Restructure the Popup for Flexible Layout
The goal: allow the header, the main body, and any footer or context buttons to remain visible while the main body itself scrolls if content is too large.

In styles.css, give your .modern-popout a flex container layout:
css
Copy
.modern-popout {
  display: flex;
  flex-direction: column;
  /* no fixed width/height here */
}
Make .modern-popout-body expand to fill available space (rather than a hard-coded height). For example:
css
Copy
.modern-popout-body {
  flex: 1; /* Let the body grow/shrink to fill leftover space */
  overflow-y: auto; /* Scroll content if it overflows */
  padding: 16px; /* or your preferred padding */
}
If you have a footer (like .context-buttons), place it below and ensure it does not vanish under the body. For example:
css
Copy
.context-buttons {
  /* this can remain at the bottom of the popout */
  padding: 12px 16px;
}

---

_**Assistant**_

I'll help restructure the popup layout to be more flexible. Here are the necessary changes:

```css:styles.css
// ... existing code ...

.modern-popout {
  position: fixed !important;
  right: 2rem !important;
  background: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border: none !important;
  border-radius: 12px !important;
  z-index: 2147483647 !important;
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  overflow: hidden !important;
  opacity: 0;
  display: flex !important;
  flex-direction: column !important;
  -webkit-font-smoothing: antialiased !important;
  animation: fadeIn 0.2s ease forwards !important;
}

.modern-popout-header {
  flex-shrink: 0 !important; /* Prevent header from shrinking */
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 12px 16px !important;
  background: white !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}

.modern-popout-body {
  flex: 1 1 auto !important; /* Allow body to grow and shrink */
  min-height: 0 !important; /* Required for Firefox flex scrolling */
  overflow-y: auto !important;
  padding: 16px !important;
  color: #555 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.context-buttons {
  flex-shrink: 0 !important; /* Prevent footer from shrinking */
  padding: 12px 16px !important;
  display: flex !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  background: #f9fafb !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
}

/* Resizer styles */
.resizer.bottom-right {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 24px !important;
  height: 24px !important;
  cursor: se-resize !important;
  opacity: 0;
  transition: opacity 0.2s ease !important;
  z-index: 2147483647 !important;
  background: transparent !important;
  touch-action: none !important;
}

.resizer.bottom-right::after {
  content: '' !important;
  position: absolute !important;
  right: 6px !important;
  bottom: 6px !important;
  width: 14px !important;
  height: 14px !important;
  border-right: 2px solid rgba(99, 102, 241, 0.5) !important;
  border-bottom: 2px solid rgba(99, 102, 241, 0.5) !important;
  border-radius: 0 0 2px 0 !important;
}

// ... rest of existing code ...
```

Key changes:
1. Made header and footer flex-shrink: 0 to prevent them from collapsing
2. Made body flex: 1 1 auto to allow it to grow/shrink while maintaining scrollability
3. Added min-height: 0 to body for Firefox compatibility
4. Restored resizer styles with proper positioning
5. Maintained proper flex layout structure for the entire popup

This should give you a flexible layout where:
- Header stays at top
- Body expands to fill available space and scrolls if needed
- Footer stays at bottom
- Resize handle remains visible and functional

---

_**User**_

3. Modernize and Harden the initResize Logic
Below is a more robust approach that you can replace or upgrade your existing initResize function with. It ensures:

Two-dimensional resizing (width + height).
The popup never “disappears” on mouse release.
The user can’t shrink it below a minimum size or stretch it beyond a maximum size (matching your .resizable CSS constraints).
The resize does not reset the popup’s position or cause it to jump around.
js
Copy
function initResize(e) {
  // 1. Prevent text selection or default drag
  e.preventDefault();
  e.stopPropagation();

  let isResizing = true;
  
  // 2. Record initial cursor and popup dimensions
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = annotationDiv.offsetWidth;
  const startHeight = annotationDiv.offsetHeight;

  // 3. Prepare for live resizing
  annotationDiv.classList.add('resizing');
  document.body.style.cursor = 'se-resize'; // entire document shows a resize cursor

  function onMouseMove(moveEvt) {
    if (!isResizing) return;

    // 3A. Calculate deltas
    const deltaX = moveEvt.clientX - startX;
    const deltaY = moveEvt.clientY - startY;

    // 3B. Compute new width/height
    let newWidth = startWidth + deltaX;
    let newHeight = startHeight + deltaY;

    // 3C. Clamp them within min/max if desired:
    // (Adjust these numbers to match your .modern-popout.resizable CSS)
    newWidth = Math.max(300, Math.min(800, newWidth));
    newHeight = Math.max(200, Math.min(800, newHeight));

    // 3D. Apply
    annotationDiv.style.width = newWidth + 'px';
    annotationDiv.style.height = newHeight + 'px';
  }

  function onMouseUp() {
    if (!isResizing) return;
    isResizing = false;

    // 4. Cleanup
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mouseleave', onMouseUp);
    annotationDiv.classList.remove('resizing');

    // 5. Restore cursor
    document.body.style.cursor = '';

    // 6. Ensure the popout remains visible (some code might re-hide it).
    annotationDiv.style.display = 'flex';
    annotationDiv.style.opacity = '1';
  }

  // 7. Listen for live mouse events
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mouseleave', onMouseUp);
}
Important: The code above does not force any extra content height changes inside .modern-popout-body. By removing that logic, the body is free to flex and scroll as needed.

---

_**Assistant**_

I'll help you update the resize logic in content.js. Here are the changes:

```javascript:content.js
// ... existing code ...

const initResize = (e) => {
  // 1. Prevent text selection or default drag
  e.preventDefault();
  e.stopPropagation();

  let isResizing = true;
  
  // 2. Record initial cursor and popup dimensions
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = annotationDiv.offsetWidth;
  const startHeight = annotationDiv.offsetHeight;

  // 3. Prepare for live resizing
  annotationDiv.classList.add('resizing');
  document.body.style.cursor = 'se-resize';

  const resize = (e) => {
    if (!isResizing || !annotationDiv) return;
    
    requestAnimationFrame(() => {
      // Calculate deltas
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Compute and clamp new dimensions
      const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
      
      // Apply dimensions
      annotationDiv.style.width = `${newWidth}px`;
      annotationDiv.style.height = `${newHeight}px`;
    });
  };

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;

    // Cleanup
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);
    
    if (annotationDiv) {
      annotationDiv.classList.remove('resizing');
      // Ensure popup stays visible
      annotationDiv.style.display = 'flex';
      annotationDiv.style.opacity = '1';
    }
    
    // Restore cursor
    document.body.style.cursor = '';
  };

  // Listen for live mouse events
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('mouseleave', stopResize);
};

// ... rest of existing code ...
```

Key improvements:
1. Removed manual content height adjustments to let flexbox handle it
2. Added requestAnimationFrame for smoother resizing
3. Better cleanup in stopResize
4. More robust error checking
5. Simplified dimension calculations
6. Ensures popup stays visible after resize

The resize logic now works with the flexbox layout we set up in the CSS changes. The popup will maintain its structure while resizing, with the body scrolling as needed.

---

_**User**_

4. Check for Overlapping Drag vs. Resize
Ensure that the drag handle (from draggable.js) is separate from the resize handle. You don’t want the user accidentally dragging when they intend to resize or vice versa.
Typically, the drag handle is in the top header; the resize handle is the bottom-right. They should not overlap.

---

_**Assistant**_

The drag and resize handles are already properly separated in the code:

1. The drag handle is initialized in the header:
```javascript:content.js
const header = document.createElement('div');
header.className = 'modern-popout-header';

// Initialize draggable functionality
window.initDraggable(annotationDiv, header);
```

2. The resize handle is a separate element at the bottom-right:
```javascript:content.js
// Add only bottom-right resizer
const resizer = document.createElement('div');
resizer.className = 'resizer bottom-right';
resizer.addEventListener('mousedown', initResize);
annotationDiv.appendChild(resizer);
```

And the CSS already positions them correctly:
```css:styles.css
.modern-popout-header {
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  // ... other styles ...
}

.resizer.bottom-right {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 24px !important;
  height: 24px !important;
  // ... other styles ...
}
```

The handles are properly separated with:
- Header/drag handle at the top
- Resize handle confined to bottom-right corner
- No overlapping interaction areas
- Clear visual distinction between the two

No changes needed for this requirement as it's already implemented correctly.

---

_**User**_

5. Prevent the Popup from Sliding Offscreen
If, after resizing, the right or bottom edge goes offscreen, the user might lose the handle. Consider adding bounding logic:

After you set the new width/height, check whether the bottom or right edge is offscreen. If so, readjust .style.top or .style.left so the popup is fully visible. For instance:

js
Copy
const rect = annotationDiv.getBoundingClientRect();
if (rect.right > window.innerWidth) {
  annotationDiv.style.left = (window.innerWidth - rect.width) + 'px';
}
if (rect.bottom > window.innerHeight) {
  annotationDiv.style.top = (window.innerHeight - rect.height) + 'px';
}

---

_**Assistant**_

I'll add the bounding logic to keep the popup on screen during resizing. Here's the update to the resize function:

```javascript:content.js
const initResize = (e) => {
  e.preventDefault();
  e.stopPropagation();

  let isResizing = true;
  
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = annotationDiv.offsetWidth;
  const startHeight = annotationDiv.offsetHeight;
  
  annotationDiv.classList.add('resizing');
  document.body.style.cursor = 'se-resize';

  const resize = (e) => {
    if (!isResizing || !annotationDiv) return;
    
    requestAnimationFrame(() => {
      // Calculate deltas
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Compute and clamp new dimensions
      const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
      
      // Apply dimensions
      annotationDiv.style.width = `${newWidth}px`;
      annotationDiv.style.height = `${newHeight}px`;

      // Check if popup is going offscreen
      const rect = annotationDiv.getBoundingClientRect();
      const padding = 20; // Keep 20px from viewport edges

      // Prevent going off right edge
      if (rect.right > window.innerWidth - padding) {
        annotationDiv.style.left = `${window.innerWidth - rect.width - padding}px`;
      }

      // Prevent going off left edge
      if (rect.left < padding) {
        annotationDiv.style.left = `${padding}px`;
      }

      // Prevent going off bottom edge
      if (rect.bottom > window.innerHeight - padding) {
        annotationDiv.style.top = `${window.innerHeight - rect.height - padding}px`;
      }

      // Prevent going off top edge
      if (rect.top < padding) {
        annotationDiv.style.top = `${padding}px`;
      }
    });
  };

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;

    // Cleanup
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);
    
    if (annotationDiv) {
      annotationDiv.classList.remove('resizing');
      // Ensure popup stays visible
      annotationDiv.style.display = 'flex';
      annotationDiv.style.opacity = '1';

      // Final bounds check
      const rect = annotationDiv.getBoundingClientRect();
      const padding = 20;

      if (rect.right > window.innerWidth - padding) {
        annotationDiv.style.left = `${window.innerWidth - rect.width - padding}px`;
      }
      if (rect.left < padding) {
        annotationDiv.style.left = `${padding}px`;
      }
      if (rect.bottom > window.innerHeight - padding) {
        annotationDiv.style.top = `${window.innerHeight - rect.height - padding}px`;
      }
      if (rect.top < padding) {
        annotationDiv.style.top = `${padding}px`;
      }
    }
    
    // Restore cursor
    document.body.style.cursor = '';
  };

  // Listen for live mouse events
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('mouseleave', stopResize);
};
```

Key changes:
1. Added padding constant to keep popup away from viewport edges
2. Added bounds checking during resize to prevent going offscreen
3. Added final bounds check on resize stop for safety
4. Checks all four edges (left, right, top, bottom)
5. Maintains consistent padding from viewport edges

This ensures the popup and its resize handle remain accessible at all times, even during and after resizing.

---

_**User**_

Can you make "Select Prompt" text in the popup header high contrast in dark mode

---

_**Assistant**_

I'll update the prompt label styles to be more visible in dark mode:

```css:styles.css
// ... existing code ...

.prompt-label {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #4b5563 !important;
  margin-right: auto !important;
}

/* Add dark mode styles for prompt label */
@media (prefers-color-scheme: dark) {
  .prompt-label {
    color: #e5e7eb !important; /* Light gray for better contrast */
  }
}

// ... rest of existing code ...
```

This change makes the "Select Prompt" text light gray (#e5e7eb) in dark mode, which provides better contrast against the dark background while maintaining consistency with other dark mode text elements in the UI.

---

_**User**_

Can you add all the resizing edits we just made to the main pop up, and make sure they apply to the fact check popup and the follow up questions pop up

Basically the resizing should be consistent across popups

---

_**Assistant**_

I'll help you make the resizing consistent across all popup types. Here are the changes:

```css:styles.css
/* Base resizable styles for all popup types */
.modern-popout.resizable,
.fact-check-view,
.followup-container {
  min-width: 300px;
  min-height: 200px;
  max-width: 800px;
  max-height: 800px;
  transition: none;
  width: auto;
  height: auto;
  display: flex !important;
  flex-direction: column !important;
}

/* Common header styles */
.modern-popout-header,
.fact-check-header,
.followup-header {
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}

/* Common body styles */
.modern-popout-body,
.fact-check-content,
.followup-input,
.followup-answer {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding: 16px !important;
}

/* Resizer styles - make it visible in all views */
.resizer.bottom-right {
  position: absolute !important;
  bottom: 0 !important;
  right: 0 !important;
  width: 24px !important;
  height: 24px !important;
  cursor: se-resize !important;
  opacity: 0;
  transition: opacity 0.2s ease !important;
  z-index: 2147483647 !important;
  background: transparent !important;
  touch-action: none !important;
}

.resizer.bottom-right::after {
  content: '' !important;
  position: absolute !important;
  right: 6px !important;
  bottom: 6px !important;
  width: 14px !important;
  height: 14px !important;
  border-right: 2px solid rgba(99, 102, 241, 0.5) !important;
  border-bottom: 2px solid rgba(99, 102, 241, 0.5) !important;
  border-radius: 0 0 2px 0 !important;
}

/* Show resizer on hover for all popup types */
.modern-popout:hover .resizer.bottom-right,
.fact-check-view:hover .resizer.bottom-right,
.followup-container:hover .resizer.bottom-right {
  opacity: 1;
}

/* Show resizer during resize for all popup types */
.modern-popout.resizing .resizer.bottom-right,
.fact-check-view.resizing .resizer.bottom-right,
.followup-container.resizing .resizer.bottom-right {
  opacity: 1;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .modern-popout-header,
  .fact-check-header,
  .followup-header {
    background: #1f2937 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .resizer.bottom-right::after {
    border-color: rgba(99, 102, 241, 0.6) !important;
  }
}
```

And update the JavaScript to handle resizing for all popup types:

```javascript:content.js
const initResize = (e) => {
  e.preventDefault();
  e.stopPropagation();

  let isResizing = true;
  const popup = e.target.closest('.modern-popout, .fact-check-view, .followup-container');
  if (!popup) return;
  
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = popup.offsetWidth;
  const startHeight = popup.offsetHeight;
  
  popup.classList.add('resizing');
  document.body.style.cursor = 'se-resize';

  const resize = (e) => {
    if (!isResizing || !popup) return;
    
    requestAnimationFrame(() => {
      // Calculate deltas
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Compute and clamp new dimensions
      const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
      
      // Apply dimensions
      popup.style.width = `${newWidth}px`;
      popup.style.height = `${newHeight}px`;

      // Check if popup is going offscreen
      const rect = popup.getBoundingClientRect();
      const padding = 20;

      // Prevent going off right edge
      if (rect.right > window.innerWidth - padding) {
        popup.style.left = `${window.innerWidth - rect.width - padding}px`;
      }

      // Prevent going off left edge
      if (rect.left < padding) {
        popup.style.left = `${padding}px`;
      }

      // Prevent going off bottom edge
      if (rect.bottom > window.innerHeight - padding) {
        popup.style.top = `${window.innerHeight - rect.height - padding}px`;
      }

      // Prevent going off top edge
      if (rect.top < padding) {
        popup.style.top = `${padding}px`;
      }
    });
  };

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;

    // Cleanup
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);
    
    if (popup) {
      popup.classList.remove('resizing');
      // Ensure popup stays visible
      popup.style.display = 'flex';
      popup.style.opacity = '1';

      // Final bounds check
      const rect = popup.getBoundingClientRect();
      const padding = 20;

      if (rect.right > window.innerWidth - padding) {
        popup.style.left = `${window.innerWidth - rect.width - padding}px`;
      }
      if (rect.left < padding) {
        popup.style.left = `${padding}px`;
      }
      if (rect.bottom > window.innerHeight - padding) {
        popup.style.top = `${window.innerHeight - rect.height - padding}px`;
      }
      if (rect.top < padding) {
        popup.style.top = `${padding}px`;
      }
    }
    
    // Restore cursor
    document.body.style.cursor = '';
  };

  // Listen for live mouse events
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('mouseleave', stopResize);
};
```

Key changes:
1. Made resizing styles consistent across all popup types
2. Updated the resize handler to work with any popup type
3. Ensured flex layout is consistent
4. Added bounds checking for all popup types
5. Made resize handle visible in all views
6. Maintained dark mode compatibility

This will give you consistent resizing behavior across the main popup, fact check view, and follow-up questions.

---

_**User**_

Resizing still doesn't work properly - the buttons are hidden and when I resize the window it disappears once I let go of the mouse

So I can't click any buttons as a result

---

_**Assistant**_

Let's fix the resizing issues. The problem seems to be with the z-index and visibility of elements during and after resize. Here are the necessary changes:

```css:styles.css
/* Base resizable styles for all popup types */
.modern-popout.resizable,
.fact-check-view,
.followup-container {
  min-width: 300px;
  min-height: 200px;
  max-width: 800px;
  max-height: 800px;
  transition: none;
  width: auto;
  height: auto;
  display: flex !important;
  flex-direction: column !important;
  position: fixed !important; /* Ensure fixed positioning */
  z-index: 2147483647 !important; /* Keep highest z-index */
}

/* Ensure content stays visible during resize */
.modern-popout.resizing,
.fact-check-view.resizing,
.followup-container.resizing {
  pointer-events: none !important; /* Prevent interaction during resize */
}

.modern-popout.resizing .resizer.bottom-right,
.fact-check-view.resizing .resizer.bottom-right,
.followup-container.resizing .resizer.bottom-right {
  pointer-events: auto !important; /* Keep resize handle active */
}

/* Ensure buttons and content stay visible */
.modern-popout-header,
.fact-check-header,
.followup-header,
.context-buttons,
.followup-actions {
  position: relative !important;
  z-index: 2147483647 !important;
}

/* Ensure fact check view stays properly positioned */
.fact-check-view {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: white !important;
}

/* Dark mode background for fact check */
@media (prefers-color-scheme: dark) {
  .fact-check-view {
    background: #1f2937 !important;
  }
}
```

And update the resize handler in content.js:

```javascript:content.js
const initResize = (e) => {
  e.preventDefault();
  e.stopPropagation();

  let isResizing = true;
  const popup = e.target.closest('.modern-popout, .fact-check-view, .followup-container');
  if (!popup) return;
  
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = popup.offsetWidth;
  const startHeight = popup.offsetHeight;
  const startLeft = popup.offsetLeft;
  const startTop = popup.offsetTop;
  
  popup.classList.add('resizing');
  document.body.style.cursor = 'se-resize';

  const resize = (e) => {
    if (!isResizing || !popup) return;
    
    requestAnimationFrame(() => {
      // Calculate deltas
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Compute and clamp new dimensions
      const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
      
      // Apply dimensions
      popup.style.width = `${newWidth}px`;
      popup.style.height = `${newHeight}px`;

      // Check if popup is going offscreen
      const rect = popup.getBoundingClientRect();
      const padding = 20;

      // Prevent going off right edge
      if (rect.right > window.innerWidth - padding) {
        popup.style.left = `${window.innerWidth - newWidth - padding}px`;
      }

      // Prevent going off left edge
      if (rect.left < padding) {
        popup.style.left = `${padding}px`;
      }

      // Prevent going off bottom edge
      if (rect.bottom > window.innerHeight - padding) {
        popup.style.top = `${window.innerHeight - newHeight - padding}px`;
      }

      // Prevent going off top edge
      if (rect.top < padding) {
        popup.style.top = `${padding}px`;
      }
    });
  };

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;

    // Cleanup
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);
    
    if (popup) {
      popup.classList.remove('resizing');
      
      // Ensure popup stays visible and interactive
      popup.style.display = 'flex';
      popup.style.opacity = '1';
      popup.style.visibility = 'visible';
      popup.style.pointerEvents = 'auto';

      // Final bounds check
      const rect = popup.getBoundingClientRect();
      const padding = 20;

      // Ensure popup stays within viewport
      if (rect.right > window.innerWidth - padding) {
        popup.style.left = `${window.innerWidth - rect.width - padding}px`;
      }
      if (rect.left < padding) {
        popup.style.left = `${padding}px`;
      }
      if (rect.bottom > window.innerHeight - padding) {
        popup.style.top = `${window.innerHeight - rect.height - padding}px`;
      }
      if (rect.top < padding) {
        popup.style.top = `${padding}px`;
      }

      // Force a repaint to ensure visibility
      popup.style.transform = 'translateZ(0)';
    }
    
    // Restore cursor
    document.body.style.cursor = '';
  };

  // Listen for live mouse events
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('mouseleave', stopResize);
};
```

Key changes:
1. Added proper z-index management
2. Fixed pointer events during resize
3. Ensured popup stays visible after resize
4. Added transform to force repaint
5. Improved position calculations
6. Added visibility and pointer-events reset
7. Fixed dark mode background for fact check view

This should keep all elements visible and interactive during and after resizing.

---



---

