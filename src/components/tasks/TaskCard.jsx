
import { useState } from "react";

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onDueDateChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStatuses, setShowStatuses] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const date = task.dueDate
    ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "No due date";

  function closeMenu() {
    setMenuOpen(false);
    setShowStatuses(false);
    setShowDatePicker(false);
  }

  return (
    <article className="task-card">
      <div className="task-company">
        <span className={`company-icon company-${task.id % 5}`}>
          {task.project?.charAt(0) || "T"}
        </span>

        <span className="company-name">{task.project}</span>

        <button
          type="button"
          className="task-menu"
          aria-label={`Options for ${task.title}`}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((current) => !current);
            setShowStatuses(false);
            setShowDatePicker(false);
          }}
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="task-dropdown">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onEdit?.(task);
              }}
            >
              <span>✎</span> Edit Task
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStatuses((current) => !current);
                setShowDatePicker(false);
              }}
            >
              <span>⇄</span> Change Status
              <span className="menu-arrow">›</span>
            </button>

            {showStatuses && (
              <div className="task-submenu">
                {statusOptions.map((status) => (
                  <button
                    type="button"
                    key={status.value}
                    className={
                      task.status === status.value ? "current-status" : ""
                    }
                    onClick={() => {
                      onStatusChange?.(task.id, status.value);
                      closeMenu();
                    }}
                  >
                    {task.status === status.value ? "✓ " : ""}
                    {status.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowDatePicker((current) => !current);
                setShowStatuses(false);
              }}
            >
              <span>▦</span> Change Due Date
            </button>

            {showDatePicker && (
              <div className="task-date-picker">
                <input
                  type="date"
                  aria-label="New task due date"
                  value={task.dueDate || ""}
                  onChange={(event) => {
                    if (event.target.value) {
                      onDueDateChange?.(task.id, event.target.value);
                      closeMenu();
                    }
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onDuplicate?.(task);
              }}
            >
              <span>▣</span> Duplicate Task
            </button>

            <div className="task-menu-divider" />

            <button
              type="button"
              className="delete-task-option"
              onClick={() => {
                closeMenu();
                onDelete?.(task);
              }}
            >
              <span>⌫</span> Delete Task
            </button>
          </div>
        )}
      </div>

      <h3>{task.title}</h3>

      <div className="task-meta">
        <time dateTime={task.dueDate || undefined}>{date}</time>

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>
    </article>
  );
}
