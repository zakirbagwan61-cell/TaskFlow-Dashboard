
import TaskCard from "./TaskCard";

const columns = [
  { id: "todo", label: "To Do", style: "todo" },
  { id: "in-progress", label: "In Progress", style: "progress" },
  { id: "completed", label: "Completed", style: "completed" },
  { id: "overdue", label: "Overdue", style: "overdue" },
];

export default function KanbanBoard({
  tasks,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onDueDateChange,
}) {
  return (
    <section className="kanban-board">
      {columns.map((column) => {
        const items = tasks.filter(
          (task) => task.status === column.id
        );

        return (
          <section className="kanban-column" key={column.id}>
            <div className="column-header">
              <span className="drag-dots">⠿</span>

              <span className={`column-pill ${column.style}`}>
                {column.label}
              </span>

              <span className="column-count">{items.length}</span>

              <button
                type="button"
                className="column-more"
                aria-label={`${column.label} options`}
                title="Column options"
                onClick={() =>
                  alert(`${column.label} column options can be added next.`)
                }
              >
                •••
              </button>

              <button
                type="button"
                className="column-add"
                onClick={() => onCreate(column.id)}
                aria-label={`Create task in ${column.label}`}
              >
                +
              </button>
            </div>

            <div className="column-body">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onStatusChange={onStatusChange}
                  onDueDateChange={onDueDateChange}
                />
              ))}

              {items.length === 0 && (
                <p className="empty-column">No tasks yet</p>
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
}
