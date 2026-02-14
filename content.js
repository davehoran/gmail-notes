// Gmail Notes Extension - Content Script

let currentEmailId = null;
let notesPanel = null;

// Wait for Gmail to load
function init() {
  console.log('Gmail Notes Extension: Initializing...');
  
  // Monitor URL changes (Gmail is a single-page app)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      handleUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Initial check
  handleUrlChange();
}

// Handle URL changes to detect when viewing an email
function handleUrlChange() {
  const emailId = getEmailIdFromUrl();
  
  if (emailId && emailId !== currentEmailId) {
    currentEmailId = emailId;
    injectNotesPanel();
  } else if (!emailId && notesPanel) {
    // Remove panel if not viewing an email
    if (notesPanel && notesPanel.parentNode) {
      notesPanel.parentNode.removeChild(notesPanel);
    }
    notesPanel = null;
    currentEmailId = null;
  }
}

// Extract email ID from Gmail URL
function getEmailIdFromUrl() {
  const match = window.location.hash.match(/\/([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

// Create and inject the notes panel
function injectNotesPanel() {
  // Remove existing panel if any
  if (notesPanel && notesPanel.parentNode) {
    notesPanel.parentNode.removeChild(notesPanel);
  }
  
  // Wait for email content to load
  setTimeout(() => {
    const emailContainer = document.querySelector('[role="main"]');
    if (!emailContainer) {
      console.log('Gmail Notes: Email container not found');
      return;
    }
    
    // Create notes panel
    notesPanel = document.createElement('div');
    notesPanel.className = 'gmail-notes-panel';
    notesPanel.innerHTML = `
      <div class="gmail-notes-header">
        <h3>📝 Personal Notes</h3>
        <button class="gmail-notes-collapse" title="Collapse/Expand">−</button>
      </div>
      <div class="gmail-notes-content">
        <div class="gmail-notes-display" style="display: none;">
          <div class="gmail-notes-tags"></div>
          <div class="gmail-notes-text"></div>
          <button class="gmail-notes-edit-btn">Edit Note</button>
        </div>
        <div class="gmail-notes-editor">
          <textarea class="gmail-notes-textarea" placeholder="Add your personal notes about this email..."></textarea>
          <div class="gmail-notes-tags-input">
            <input type="text" class="gmail-notes-tag-input" placeholder="Add tags (comma-separated)" />
          </div>
          <div class="gmail-notes-actions">
            <button class="gmail-notes-save">Save Note</button>
            <button class="gmail-notes-cancel" style="display: none;">Cancel</button>
            <button class="gmail-notes-delete" style="display: none;">Delete</button>
          </div>
        </div>
      </div>
    `;
    
    // Insert panel at the top of the email
    emailContainer.insertBefore(notesPanel, emailContainer.firstChild);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load existing note
    loadNote();
  }, 500);
}

// Set up event listeners for the notes panel
function setupEventListeners() {
  const saveBtn = notesPanel.querySelector('.gmail-notes-save');
  const cancelBtn = notesPanel.querySelector('.gmail-notes-cancel');
  const deleteBtn = notesPanel.querySelector('.gmail-notes-delete');
  const editBtn = notesPanel.querySelector('.gmail-notes-edit-btn');
  const collapseBtn = notesPanel.querySelector('.gmail-notes-collapse');
  
  saveBtn.addEventListener('click', saveNote);
  cancelBtn.addEventListener('click', cancelEdit);
  deleteBtn.addEventListener('click', deleteNote);
  editBtn.addEventListener('click', editNote);
  collapseBtn.addEventListener('click', toggleCollapse);
}

// Load note for current email
function loadNote() {
  chrome.storage.local.get([currentEmailId], (result) => {
    const noteData = result[currentEmailId];
    
    if (noteData) {
      showNoteDisplay(noteData);
    } else {
      showNoteEditor();
    }
  });
}

// Show note in display mode
function showNoteDisplay(noteData) {
  const display = notesPanel.querySelector('.gmail-notes-display');
  const editor = notesPanel.querySelector('.gmail-notes-editor');
  const textDiv = notesPanel.querySelector('.gmail-notes-text');
  const tagsDiv = notesPanel.querySelector('.gmail-notes-tags');
  
  textDiv.textContent = noteData.note;
  
  // Display tags
  tagsDiv.innerHTML = '';
  if (noteData.tags && noteData.tags.length > 0) {
    noteData.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'gmail-note-tag';
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
  }
  
  display.style.display = 'block';
  editor.style.display = 'none';
}

// Show note editor
function showNoteEditor(noteData = null) {
  const display = notesPanel.querySelector('.gmail-notes-display');
  const editor = notesPanel.querySelector('.gmail-notes-editor');
  const textarea = notesPanel.querySelector('.gmail-notes-textarea');
  const tagInput = notesPanel.querySelector('.gmail-notes-tag-input');
  const cancelBtn = notesPanel.querySelector('.gmail-notes-cancel');
  const deleteBtn = notesPanel.querySelector('.gmail-notes-delete');
  
  if (noteData) {
    textarea.value = noteData.note;
    tagInput.value = noteData.tags ? noteData.tags.join(', ') : '';
    cancelBtn.style.display = 'inline-block';
    deleteBtn.style.display = 'inline-block';
  } else {
    textarea.value = '';
    tagInput.value = '';
    cancelBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
  }
  
  display.style.display = 'none';
  editor.style.display = 'block';
  textarea.focus();
}

// Edit existing note
function editNote() {
  chrome.storage.local.get([currentEmailId], (result) => {
    const noteData = result[currentEmailId];
    showNoteEditor(noteData);
  });
}

// Save note
function saveNote() {
  const textarea = notesPanel.querySelector('.gmail-notes-textarea');
  const tagInput = notesPanel.querySelector('.gmail-notes-tag-input');
  const noteText = textarea.value.trim();
  const tagText = tagInput.value.trim();
  
  if (!noteText) {
    alert('Please enter some text for your note');
    return;
  }
  
  // Parse tags
  const tags = tagText
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  const noteData = {
    note: noteText,
    tags: tags,
    timestamp: Date.now(),
    emailId: currentEmailId
  };
  
  // Save to storage
  chrome.storage.local.set({ [currentEmailId]: noteData }, () => {
    console.log('Note saved successfully');
    showNoteDisplay(noteData);
    
    // Also save to search index
    updateSearchIndex(currentEmailId, noteData);
  });
}

// Cancel editing
function cancelEdit() {
  chrome.storage.local.get([currentEmailId], (result) => {
    const noteData = result[currentEmailId];
    if (noteData) {
      showNoteDisplay(noteData);
    } else {
      showNoteEditor();
    }
  });
}

// Delete note
function deleteNote() {
  if (confirm('Are you sure you want to delete this note?')) {
    chrome.storage.local.remove([currentEmailId], () => {
      console.log('Note deleted');
      removeFromSearchIndex(currentEmailId);
      showNoteEditor();
    });
  }
}

// Toggle panel collapse
function toggleCollapse() {
  const content = notesPanel.querySelector('.gmail-notes-content');
  const collapseBtn = notesPanel.querySelector('.gmail-notes-collapse');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    collapseBtn.textContent = '−';
  } else {
    content.style.display = 'none';
    collapseBtn.textContent = '+';
  }
}

// Update search index
function updateSearchIndex(emailId, noteData) {
  chrome.storage.local.get(['searchIndex'], (result) => {
    const searchIndex = result.searchIndex || {};
    searchIndex[emailId] = {
      note: noteData.note,
      tags: noteData.tags,
      timestamp: noteData.timestamp
    };
    chrome.storage.local.set({ searchIndex: searchIndex });
  });
}

// Remove from search index
function removeFromSearchIndex(emailId) {
  chrome.storage.local.get(['searchIndex'], (result) => {
    const searchIndex = result.searchIndex || {};
    delete searchIndex[emailId];
    chrome.storage.local.set({ searchIndex: searchIndex });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
