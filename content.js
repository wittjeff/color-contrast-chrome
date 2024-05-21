(() => {
  let startX, startY, endX, endY;
  let selectionBox = null;
  let originalCursor;

  function createSelectionBox() {
    selectionBox = document.createElement('div');
    selectionBox.id = 'selection-box';
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px dashed #000';
    selectionBox.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    document.body.appendChild(selectionBox);
  }

  function updateSelectionBox() {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(startX - endX);
    const height = Math.abs(startY - endY);
    selectionBox.style.left = `${x}px`;
    selectionBox.style.top = `${y}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startSelection') {
      document.addEventListener('mousedown', onMouseDown, true);
      originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'crosshair';
    }
  });

  function onMouseDown(event) {
    if (event.button !== 0) return; // Only respond to left clicks
    startX = event.clientX;
    startY = event.clientY;
    createSelectionBox();
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);
    event.preventDefault(); // Prevent text selection
  }

  function onMouseMove(event) {
    endX = event.clientX;
    endY = event.clientY;
    updateSelectionBox();
    event.preventDefault(); // Prevent text selection
  }

  function onMouseUp(event) {
    endX = event.clientX;
    endY = event.clientY;
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseup', onMouseUp, true);

    chrome.runtime.sendMessage({
      action: 'selectionMade',
      area: {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(startX - endX),
        height: Math.abs(startY - endY)
      }
    });

    document.body.removeChild(selectionBox);
    selectionBox = null;
    document.removeEventListener('mousedown', onMouseDown, true);
    document.body.style.cursor = originalCursor;
    event.preventDefault(); // Prevent text selection
  }
})();
