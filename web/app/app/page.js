'use client';

export default function DashboardPage() {
  return (
    <>
      <header className="header">
        <div className="brand">
          <img src="/logo.png" alt="BookIt Logo" className="brand-icon" style={{ height: '22px', width: 'auto' }} />
          <h1>BookIt</h1>
        </div>
        <div className="header-actions">
          <div className="search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input id="search-input" type="search" placeholder="Search bookmarks…" />
            <button className="search-button" id="search-button" type="button" title="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
          <button className="add-button" id="add-demo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Bookmark
          </button>
          <div className="user-menu">
            <span className="username" id="username-display">User</span>
            <button className="logout-btn" id="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">General</p>
            <ul className="category-list">
              <li className="category-item active" data-collection="">All <span className="pill">•</span></li>
              <li className="category-item" data-collection="unsorted">Unsorted</li>
            </ul>
          </div>
          <div className="sidebar-section">
            <p className="sidebar-label">Collections</p>
            <ul className="category-list nested" id="collections-list">
            </ul>
            <button className="new-collection" id="new-collection-btn">+ New collection…</button>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-header">
            <div className="header-info">
              <nav className="breadcrumb">
                <span>Collections</span>
                <span className="separator">/</span>
                <span className="current-category">All</span>
              </nav>
              <h2 className="collection-title" id="collection-title">All Bookmarks</h2>
              <p className="bookmark-count" id="bookmark-count">0 bookmarks</p>
            </div>
            <div className="header-filters">
              <div className="tag-filter" id="tag-filter"></div>
              <div className="view-controls">
                <button className="view-btn active" data-view="grid" title="Grid view">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button className="view-btn" data-view="list" title="List view">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                <button className="view-btn" data-view="canvas" title="Canvas view">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <section className="bookmark-grid" id="bookmark-grid"></section>

          <div id="canvas-container" style={{ display: 'none' }}>
            <div className="canvas-toolbar">
              <div className="canvas-toolbar-group">
                <button className="canvas-btn" id="canvas-zoom-in" title="Zoom In">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
                <button className="canvas-btn" id="canvas-zoom-out" title="Zoom Out">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
                <button className="canvas-btn" id="canvas-reset-zoom" title="Reset Zoom">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <div className="canvas-toolbar-group">
                <button className="canvas-btn" id="canvas-auto-layout" title="Auto Layout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Auto Layout
                </button>
                <button className="canvas-btn canvas-btn-primary" id="canvas-save" title="Save Canvas">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save
                </button>
              </div>
              <div className="canvas-toolbar-group" style={{ marginLeft: 'auto' }}>
                <span id="canvas-status" className="canvas-status">Ready</span>
              </div>
            </div>
            <div id="canvas-diagram" style={{ width: '100%', height: 'calc(100vh - 280px)', backgroundColor: '#f8f9fa', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}></div>
            <div className="canvas-instructions">
              <span className="canvas-instruction-item">
                <strong>Drag</strong> bookmarks to position
              </span>
              <span className="canvas-instruction-separator">•</span>
              <span className="canvas-instruction-item">
                <strong>Right-click and drag</strong> between nodes to connect
              </span>
              <span className="canvas-instruction-separator">•</span>
              <span className="canvas-instruction-item">
                <strong>Click Save</strong> to persist changes
              </span>
            </div>
          </div>

          <div className="empty-state" id="empty-state" style={{ display: 'none' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>No bookmarks yet</h3>
            <p>Start saving your favorite links, images, and content</p>
            <button className="add-button" id="add-empty-btn">Add Your First Bookmark</button>
          </div>
        </main>
      </div>

      <div id="bookmark-modal" className="modal hidden">
        <div className="modal-overlay"></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Add Bookmark</h2>
            <button type="button" className="modal-close">&times;</button>
          </div>
          <form id="bookmark-form" className="modal-form">
            <div className="form-field">
              <label className="form-label" htmlFor="bookmark-title">Title</label>
              <input className="form-input" type="text" id="bookmark-title" name="title" required placeholder="Bookmark title" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="bookmark-url">URL</label>
              <input className="form-input" type="url" id="bookmark-url" name="url" placeholder="https://example.com" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="bookmark-type">Type</label>
              <select className="form-input" id="bookmark-type" name="type">
                <option value="link">Link</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="bookmark-content">Content/Description</label>
              <textarea className="form-input" id="bookmark-content" name="content" placeholder="Add content or description"></textarea>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="bookmark-collection">Collection</label>
              <select className="form-input" id="bookmark-collection" name="collection_id">
                <option value="">Unsorted</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" id="bookmark-cancel">Cancel</button>
              <button type="submit" className="btn-primary">Add Bookmark</button>
            </div>
          </form>
        </div>
      </div>

      <div id="collection-modal" className="modal hidden">
        <div className="modal-overlay"></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>New Collection</h2>
            <button type="button" className="modal-close">&times;</button>
          </div>
          <form id="collection-form" className="modal-form">
            <div className="form-field">
              <label className="form-label" htmlFor="collection-name">Collection Name</label>
              <input className="form-input" type="text" id="collection-name" name="name" required placeholder="e.g., Work, Personal, Reading" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="collection-parent">Parent Collection (Optional)</label>
              <select className="form-input" id="collection-parent" name="parent_id">
                <option value="">None</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" id="collection-cancel">Cancel</button>
              <button type="submit" className="btn-primary">Create Collection</button>
            </div>
          </form>
        </div>
      </div>

      <div id="cookie-consent-dialog" className="cookie-consent-dialog">
        <div className="cookie-content">
          <h3>Cookie Notice</h3>
          <p>We use cookies to manage your session and keep you logged in. Cookies are essential for the app to function properly.</p>
          <p>We use a minimal cookie only for consent preferences. Authentication is handled without server sessions.</p>
          <div className="cookie-actions">
            <button id="cookie-decline-btn" className="cookie-btn cookie-btn-secondary">Decline</button>
            <button id="cookie-accept-btn" className="cookie-btn cookie-btn-primary">Accept</button>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/@mariusbongarts/previewbox/dist/index.min.js"></script>
      <script src="https://unpkg.com/gojs@3.0.2/release/go.js"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const API_BASE = '/api';
          `,
        }}
      ></script>
      <script src="/js/cookies.js"></script>
      <script src="/js/app.js"></script>
      <script src="/js/canvas.js"></script>
    </>
  );
}
