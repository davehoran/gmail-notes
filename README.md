# Gmail Notes & Tags Extension

A Chrome extension that lets you add personal notes and tags to any Gmail message, helping you organize and remember important context about your emails.

## ✨ Features

- **Personal Notes**: Add private notes to any email that only you can see
- **Tags & Categories**: Organize your notes with custom tags
- **Search**: Quickly find notes by searching text or filtering by tags
- **Auto-save**: Notes are automatically saved to your browser's local storage
- **Clean UI**: Beautiful, Gmail-integrated interface that feels native

## 📦 Installation

### Step 1: Download the Extension Files

Make sure you have all these files in a folder:
- `manifest.json`
- `content.js`
- `styles.css`
- `popup.html`
- `popup.js`
- `icon16.png`
- `icon48.png`
- `icon128.png`

### Step 2: Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder containing all the extension files
5. The extension should now appear in your extensions list!

### Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "Gmail Notes & Tags" in the list
3. Click the pin icon to keep it visible in your toolbar

## 🚀 How to Use

### Adding a Note to an Email

1. Open Gmail and click on any email to view it
2. You'll see a blue **"📝 Personal Notes"** panel at the top of the email
3. Type your note in the text area
4. (Optional) Add tags separated by commas (e.g., "important, follow-up, client")
5. Click **Save Note**

### Editing or Deleting a Note

1. Open an email that has a note
2. Click **Edit Note** to modify it
3. Make your changes and click **Save Note**
4. Or click **Delete** to remove the note entirely

### Searching Your Notes

1. Click the extension icon in Chrome's toolbar
2. Type keywords in the search box to find notes
3. Click on any tag to filter notes by that tag
4. Click a search result to open that email in Gmail

### Collapsing the Notes Panel

- Click the **−** button in the panel header to collapse/expand it

## 💾 Data Storage

- All notes are stored locally in your browser using Chrome's storage API
- Notes are **private** and only visible to you
- Notes are synced across Chrome browsers where you're logged in
- No data is sent to external servers

## 🎨 Customization

You can customize the extension by editing these files:

- **styles.css**: Change colors, fonts, and layout
- **content.js**: Modify functionality and behavior
- **popup.html/popup.js**: Customize the search interface

## 🛠️ Troubleshooting

### The notes panel doesn't appear

1. Make sure you're viewing a single email (not the inbox list)
2. Refresh the Gmail page
3. Check that the extension is enabled in `chrome://extensions/`

### Notes aren't saving

1. Check that the extension has storage permissions
2. Open Chrome DevTools (F12) and check the Console for errors
3. Try reloading the extension

### Search isn't working

1. Make sure you've saved at least one note
2. Click the extension icon to open the search popup
3. Try refreshing the popup window

## 📝 Privacy & Security

- This extension runs entirely on your computer
- No data is collected, tracked, or sent anywhere
- Notes are stored locally in Chrome's secure storage
- The extension only runs on Gmail pages (mail.google.com)

## 🔄 Updates

To update the extension after making changes:

1. Go to `chrome://extensions/`
2. Find "Gmail Notes & Tags"
3. Click the refresh icon (🔄)

## ⚙️ Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Storage access only
- **Storage Type**: chrome.storage.local (local storage with sync capability)
- **Content Script**: Injects UI into Gmail pages
- **Popup**: Provides search functionality

## 🎯 Tips for Best Use

1. **Use descriptive tags**: Create a tag system that works for you (e.g., "urgent", "waiting-for-reply", "ideas")
2. **Keep notes concise**: Brief notes are easier to search and scan
3. **Tag consistently**: Use the same tags to make filtering effective
4. **Search regularly**: Use the search feature to find old notes quickly

## 📋 File Structure

```
gmail-notes-extension/
├── manifest.json       # Extension configuration
├── content.js          # Main script (runs on Gmail pages)
├── styles.css          # Styling for notes panel
├── popup.html          # Search interface HTML
├── popup.js            # Search functionality
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## 🐛 Known Issues

- Notes are tied to email IDs, so if Gmail changes an email's ID, the note won't appear
- The panel appears after a short delay to ensure Gmail has loaded
- Threaded conversations show the same note for all messages

## 🤝 Contributing

Feel free to modify and improve this extension! Some ideas:

- Add rich text formatting
- Export notes to a file
- Add reminders or due dates
- Create note templates
- Add keyboard shortcuts
- Sync with external note-taking apps

## 📄 License

This extension is provided as-is for personal use. Feel free to modify and share!

---

**Enjoy organizing your Gmail with personal notes! 📧✨**
