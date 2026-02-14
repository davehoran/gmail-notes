// Gmail Notes Search - Popup Script

let allNotes = [];
let allTags = new Set();
let selectedTag = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadAllNotes();
  setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Auto-search as user types (debounced)
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  });
}

// Load all notes from storage
function loadAllNotes() {
  chrome.storage.local.get(null, (items) => {
    allNotes = [];
    allTags = new Set();
    
    for (const [key, value] of Object.entries(items)) {
      // Skip searchIndex and other metadata
      if (key === 'searchIndex') continue;
      
      if (value && value.note) {
        allNotes.push({
          emailId: key,
          note: value.note,
          tags: value.tags || [],
          timestamp: value.timestamp || Date.now()
        });
        
        // Collect all tags
        if (value.tags) {
          value.tags.forEach(tag => allTags.add(tag));
        }
      }
    }
    
    // Sort notes by timestamp (newest first)
    allNotes.sort((a, b) => b.timestamp - a.timestamp);
    
    // Display filter tags
    displayFilterTags();
    
    // Update stats
    updateStats();
    
    // Show initial results (all notes)
    displayResults(allNotes);
  });
}

// Display filter tags
function displayFilterTags() {
  const filterTagsContainer = document.getElementById('filterTags');
  filterTagsContainer.innerHTML = '';
  
  if (allTags.size === 0) return;
  
  const sortedTags = Array.from(allTags).sort();
  sortedTags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'filter-tag';
    tagElement.textContent = tag;
    tagElement.addEventListener('click', () => toggleTagFilter(tag, tagElement));
    filterTagsContainer.appendChild(tagElement);
  });
}

// Toggle tag filter
function toggleTagFilter(tag, element) {
  if (selectedTag === tag) {
    // Deselect
    selectedTag = null;
    element.classList.remove('active');
    performSearch();
  } else {
    // Select new tag
    selectedTag = tag;
    
    // Remove active class from all tags
    document.querySelectorAll('.filter-tag').forEach(el => {
      el.classList.remove('active');
    });
    
    element.classList.add('active');
    performSearch();
  }
}

// Perform search
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim().toLowerCase();
  
  let filteredNotes = allNotes;
  
  // Filter by selected tag
  if (selectedTag) {
    filteredNotes = filteredNotes.filter(note => 
      note.tags && note.tags.includes(selectedTag)
    );
  }
  
  // Filter by search query
  if (query) {
    filteredNotes = filteredNotes.filter(note => {
      const noteMatch = note.note.toLowerCase().includes(query);
      const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(query));
      return noteMatch || tagMatch;
    });
  }
  
  displayResults(filteredNotes);
}

// Display search results
function displayResults(notes) {
  const resultsContainer = document.getElementById('results');
  
  if (notes.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <p>No notes found</p>
      </div>
    `;
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  notes.forEach(note => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    const tagsHtml = note.tags.length > 0
      ? `<div class="result-tags">
           ${note.tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}
         </div>`
      : '';
    
    const date = new Date(note.timestamp);
    const dateStr = formatDate(date);
    
    resultItem.innerHTML = `
      <div class="result-note">${escapeHtml(note.note)}</div>
      ${tagsHtml}
      <div class="result-date">${dateStr}</div>
    `;
    
    // Click to open email in Gmail
    resultItem.addEventListener('click', () => {
      openEmailInGmail(note.emailId);
    });
    
    resultsContainer.appendChild(resultItem);
  });
}

// Update statistics
function updateStats() {
  const statsContainer = document.getElementById('stats');
  const noteCount = allNotes.length;
  const tagCount = allTags.size;
  
  statsContainer.textContent = `${noteCount} note${noteCount !== 1 ? 's' : ''} • ${tagCount} tag${tagCount !== 1 ? 's' : ''}`;
}

// Open email in Gmail
function openEmailInGmail(emailId) {
  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${emailId}`;
  chrome.tabs.create({ url: gmailUrl });
}

// Format date for display
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    }
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
