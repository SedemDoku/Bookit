# Bookmark Manager - Full Stack Web Application

A Raindrop.io-inspired bookmark manager built with PHP, MySQL, and vanilla JavaScript. Features a complete web application with user authentication, media upload support, and browser extensions for Chrome and Firefox.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - Secure signup/login with password validation and session management
- ✅ **Bookmark Management** - Full CRUD operations for bookmarks
- ✅ **Collections/Categories** - Nested collection support with hierarchical organization
- ✅ **Tags System** - Tag-based bookmark organization
- ✅ **Search & Filter** - Advanced search functionality across bookmarks
- ✅ **Media Support** - Upload and manage audio/video files with secure serving
- ✅ **Multiple Bookmark Types** - Link, text, image, audio, and video bookmarks

### Browser Extensions
- ✅ **Chrome Extension** - Quick bookmark saving via context menu
- ✅ **Firefox Extension** - Full Firefox support with WebExtensions API
- ✅ **Extension Features** - Login, view bookmarks, delete, and save from any webpage

### Security Features
- ✅ **CORS Protection** - Whitelist-based origin control
- ✅ **CSRF Protection** - Token-based request validation
- ✅ **SQL Injection Prevention** - Prepared statements throughout
- ✅ **Security Headers** - CSP, X-Frame-Options, XSS protection
- ✅ **Input Validation** - Comprehensive sanitization and validation
- ✅ **User Isolation** - Strict database-level user data separation
- ✅ **Secure Media Serving** - Validated file access via dedicated API endpoint

## 📋 Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher / MariaDB 10.2+
- Apache or PHP built-in server
- Chrome or Firefox browser (for extensions)

## 🛠️ Setup Instructions

### 1. Database Setup

1. Open phpMyAdmin or your MySQL client
2. Create a new database named `bookmark_db`
3. Import the database schema:
   ```bash
   mysql -u your_username -p bookmark_db < database.sql
   ```
   Or use phpMyAdmin's Import feature with `database.sql`

### 2. PHP Configuration

Edit `config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bookmark_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

**Environment Variables (Optional):**
The application supports environment variables for enhanced security:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

### 3. Web Server Setup

#### Option A: XAMPP/WAMP/MAMP

1. Copy project to web server directory:
   - XAMPP: `C:\xampp\htdocs\Personal_Web_Tech_Project\`
   - WAMP: `C:\wamp64\www\Personal_Web_Tech_Project\`
   - MAMP: `/Applications/MAMP/htdocs/Personal_Web_Tech_Project/`

2. Start Apache and MySQL services

3. Access at: `http://localhost/Personal_Web_Tech_Project/`

#### Option B: PHP Built-in Server

```bash
cd c:\xampp\htdocs\Personal_Web_Tech_Project
php -S localhost:8000
```

Access at: `http://localhost:8000`

### 4. Browser Extension Setup

#### Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `WebExtention/` folder
5. Configure API URL in `popup.js` if needed

#### Firefox Extension

1. Open Firefox → `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from `WebExtensionFirefox/` folder
4. Configure API URL in `popup.js` if needed

### 5. Media Upload Configuration

Create the uploads directory with proper permissions:

```bash
mkdir uploads/media
chmod 755 uploads/media
```

### 6. First Use

1. Navigate to `login.html` or `signup.html`
2. Create an account (password requirements: 8+ chars, must include special character)
3. Log in and start managing bookmarks!

## 📁 Project Structure

```
Personal_Web_Tech_Project/
├── api/
│   ├── auth.php           # Authentication endpoints (signup, login, logout)
│   ├── bookmarks.php      # Bookmark CRUD + media upload
│   ├── collections.php    # Collection management
│   └── media.php          # Secure media file serving
├── WebExtention/          # Chrome extension
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   ├── manifest.json      # Chrome extension manifest
│   └── README.md          # Extension documentation
├── WebExtensionFirefox/   # Firefox extension
│   ├── background.js      # Firefox background script
│   ├── content.js         # Content script
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── manifest.json      # Firefox extension manifest
├── uploads/media/         # User-uploaded media files
├── index.php              # Main application (requires login)
├── login.html             # Login page
├── signup.html            # Signup page
├── index.html             # Redirect to index.php
├── app.js                 # Main application JavaScript
├── auth.js                # Authentication JavaScript
├── cookies.js             # Cookie consent handling
├── style.css              # Main application styles
├── auth.css               # Authentication page styles
├── cookies.css            # Cookie banner styles
├── config.php             # Database config + security functions
├── database.sql           # Database schema
├── setup_database.php     # Database setup helper
├── README.md              # This file
├── QUICK_START.md         # Implementation reference
├── CONFIGURATION.md       # Configuration guide
└── COMPREHENSIVE_DOCUMENTATION.md  # Detailed documentation
```

## 🔌 API Endpoints

### Authentication (`api/auth.php`)

- `POST /api/auth.php?action=signup` - Create new user account
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=logout` - User logout
- `GET /api/auth.php?action=check` - Check authentication status
- `GET /api/auth.php?action=user` - Get current user info

### Bookmarks (`api/bookmarks.php`)

- `GET /api/bookmarks.php` - Get all bookmarks for authenticated user
- `GET /api/bookmarks.php?id={id}` - Get specific bookmark
- `POST /api/bookmarks.php` - Create new bookmark (supports multipart/form-data for media)
- `PUT /api/bookmarks.php?id={id}` - Update bookmark
- `DELETE /api/bookmarks.php?id={id}` - Delete bookmark

### Collections (`api/collections.php`)

- `GET /api/collections.php` - Get all collections for authenticated user
- `GET /api/collections.php?id={id}` - Get specific collection
- `POST /api/collections.php` - Create new collection
- `PUT /api/collections.php?id={id}` - Update collection
- `DELETE /api/collections.php?id={id}` - Delete collection

### Media (`api/media.php`)

- `GET /api/media.php?f={filename}` - Securely serve uploaded media files

## 🔐 Security Features

### Request Protection
- **CORS**: Whitelist-based origin validation
- **CSRF**: Token-based protection for state-changing operations
- **SQL Injection**: All queries use prepared statements
- **Input Validation**: Comprehensive sanitization of all user inputs

### Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Authentication
- Session-based authentication for web app
- Header-based authentication for browser extensions
- Password hashing with PHP's `password_hash()`
- Password requirements: 8+ characters, must include special character

### User Isolation
- Database-level user_id enforcement
- Media files validated against user ownership
- No cross-user data access possible

## 🎯 Usage

### Web Application

1. **Login/Signup**: Access via `login.html` or `signup.html`
2. **Create Bookmarks**: Click "Add Bookmark" button
3. **Organize**: Create collections and add tags
4. **Search**: Use the search bar to filter bookmarks
5. **Media Upload**: Select audio/video type and upload files
6. **Manage**: Edit, delete, or favorite bookmarks

### Browser Extension

1. **Login**: Click extension icon and enter credentials
2. **View Bookmarks**: Browse all bookmarks in the popup
3. **Quick Save**: Right-click on any page element → "Save to Bookmarks"
4. **Context Menu Options**:
   - Save page as bookmark
   - Save selected text
   - Save image
   - Save audio/video
5. **Delete**: Click delete button on any bookmark in popup

## 🎨 UI Features

- Modern, responsive design
- Dark/light color scheme
- Drag-and-drop support
- Real-time search and filtering
- Modal dialogs for forms
- Cookie consent banner
- Loading states and error handling

## 📚 Documentation

- **README.md** (this file) - Setup and overview
- **QUICK_START.md** - Quick implementation reference and requirements checklist
- **CONFIGURATION.md** - Detailed configuration guide
- **COMPREHENSIVE_DOCUMENTATION.md** - Complete technical documentation
- **WebExtention/README.md** - Browser extension setup guide

## 🛠️ Development

### Database Schema

The application uses 4 main tables:
- `users` - User accounts
- `collections` - Bookmark collections/folders
- `bookmarks` - Bookmark entries
- `tags` - Bookmark tags

See [database.sql](database.sql) for complete schema.

### Technology Stack

**Backend:**
- PHP 7.4+
- MySQL 5.7+
- Session-based authentication

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS3 with custom properties
- No frameworks/libraries required

**Browser Extensions:**
- WebExtensions API
- Chrome Manifest V3
- Firefox WebExtensions

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `config.php`
- Ensure database `bookmark_db` exists

### Extension Not Working
- Check API URL in `popup.js` and `background.js`
- Verify server is accessible
- Check browser console for errors
- Ensure CORS headers are set correctly

### Media Upload Fails
- Check `uploads/media/` directory exists and is writable
- Verify file size limits in php.ini
- Ensure correct MIME types are configured

### Login/Session Issues
- Clear browser cookies
- Check PHP session configuration
- Verify `session_start()` is called

## 📝 License

This is a personal web technology project for educational purposes.

## 👤 Author

Created as part of a web technology course project.

---

**Note**: For detailed implementation notes and security requirements, see [QUICK_START.md](QUICK_START.md)