
export default function Topbar({
  search,
  setSearch,
  onCreate,
  onToggleSidebar,
  onHelp,
  onNotifications,
  unreadCount = 0,
}) {
  return (
    <header className="topbar">
      <button
        className="collapse-btn"
        type="button"
        aria-label="Collapse or expand sidebar"
        title="Collapse / Expand sidebar"
        onClick={onToggleSidebar}
      >
        ⇤
      </button>

      <label className="top-search">
        <span className="search-icon">⌕</span>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          aria-label="Search tasks"
        />

        <span className="shortcut">⌘ + F</span>
      </label>

      <div className="top-actions">
        <div className="create-split">
          <button type="button" onClick={onCreate}>
            ＋ Create New
          </button>

          
<button
  type="button"
  aria-label="More create options"
  onClick={onCreate}
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
</button>

        </div>

        {/* Help button */}
        <button
          className="top-icon"
          type="button"
          aria-label="Help"
          title="Help"
          onClick={onHelp}
        >
          ?
        </button>

        {/* Notification bell icon */}
        <button
          className="top-icon notification-button"
          type="button"
          aria-label={`Notifications, ${unreadCount} unread`}
          title="Notifications"
          onClick={onNotifications}
        >
          <svg
            className="notification-svg"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User profile */}
        <div className="profile">
          <div className="avatar">R</div>

          <div className="profile-text">
            <span>Reyhan Adinata</span>
            <small>Lead Product</small>
          </div>

          
<span className="profile-chevron">
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
</span>

        </div>
      </div>
    </header>
  );
}
