
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import KanbanBoard from "./components/tasks/KanbanBoard";
import { initialTasks } from "./data/tasks";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const teamMembers = [
  { name: "Alex Morgan", role: "Project Manager", initials: "AM" },
  { name: "Sarah Johnson", role: "UI/UX Designer", initials: "SJ" },
  { name: "David Wilson", role: "Frontend Developer", initials: "DW" },
  { name: "Emily Brown", role: "Backend Developer", initials: "EB" },
];

function getTodayString() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDateAfterDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

// Due date nikalne se task ka saved status change nahi hoga.
function isTaskOverdue(task, today = getTodayString()) {
  return (
    task.status !== "completed" &&
    Boolean(task.dueDate) &&
    task.dueDate < today
  );
}

function getEffectiveStatus(task) {
  return task.status;
}

function loadReadNotifications() {
  try {
    const saved = localStorage.getItem("taskflow-read-notifications");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeItem, setActiveItem] = useState("My Tasks");

  const [search, setSearch] = useState("");
  const [project, setProject] = useState("all");
  const [period, setPeriod] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState("board");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [readNotificationIds, setReadNotificationIds] =
    useState(loadReadNotifications);

  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [newStatus, setNewStatus] = useState("todo");
  const [newPriority, setNewPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "TaskFlow workspace is ready",
      detail: "Your task management workspace is ready to use.",
      time: "Just now",
    },
  ]);

  const [today, setToday] = useState(getTodayString);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentDate = getTodayString();

      setToday((previousDate) =>
        previousDate === currentDate ? previousDate : currentDate
      );
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "taskflow-read-notifications",
        JSON.stringify(readNotificationIds)
      );
    } catch {
      // App browser storage ke bina bhi kaam karega.
    }
  }, [readNotificationIds]);

  const projects = useMemo(
    () => [...new Set(tasks.map((task) => task.project))],
    [tasks]
  );

  // Task ka status wahi rahega jo tasks data mein saved hai.
  const displayTasks = useMemo(
    () => tasks.map((task) => ({ ...task })),
    [tasks]
  );

  const notifications = useMemo(() => {
    const threeDaysFromNow = getDateAfterDays(3);

    const activityNotifications = activities
      .filter(
        (activity) =>
          activity.title !== "TaskFlow workspace is ready"
      )
      .map((activity) => ({
        id: `activity-${activity.id}`,
        title: activity.title,
        detail: activity.detail,
        time: activity.time,
        type: "activity",
      }));

    const deadlineNotifications = tasks
      .filter((task) => {
        if (!task.dueDate || task.status === "completed") {
          return false;
        }

        const isOverdue = task.dueDate < today;
        const isDueSoon =
          task.dueDate >= today &&
          task.dueDate <= threeDaysFromNow;

        return isOverdue || isDueSoon;
      })
      .map((task) => {
        const overdue = task.dueDate < today;

        return {
          id: `due-${task.id}-${task.dueDate}`,
          title: overdue
            ? `Overdue task: ${task.title}`
            : `Upcoming deadline: ${task.title}`,
          detail: overdue
            ? `Due date was ${task.dueDate}. Please review this task.`
            : `This task is due on ${task.dueDate}.`,
          time: overdue ? "Past due" : `Due ${task.dueDate}`,
          type: "deadline",
        };
      });

    return [...deadlineNotifications, ...activityNotifications];
  }, [tasks, activities, today]);

  const unreadCount = notifications.filter(
    (notification) =>
      !readNotificationIds.includes(notification.id)
  ).length;

  function markNotificationRead(notificationId) {
    setReadNotificationIds((current) =>
      current.includes(notificationId)
        ? current
        : [...current, notificationId]
    );
  }

  function markAllNotificationsRead() {
    setReadNotificationIds((current) => [
      ...new Set([
        ...current,
        ...notifications.map((notification) => notification.id),
      ]),
    ]);
  }

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return displayTasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.project.toLowerCase().includes(query);

        const matchesProject =
          project === "all" || task.project === project;

        const matchesStatus =
          status === "all" || task.status === status;

        const matchesPriority =
          priority === "all" ||
          task.priority.toLowerCase() === priority;

        const matchesPeriod =
          period === "all" ||
          (period === "upcoming" &&
            Boolean(task.dueDate) &&
            task.dueDate >= today) ||
          (period === "past" && isTaskOverdue(task, today));

        return (
          matchesSearch &&
          matchesProject &&
          matchesStatus &&
          matchesPriority &&
          matchesPeriod
        );
      })
      .sort((a, b) => {
        const dateA = a.dueDate || "9999-12-31";
        const dateB = b.dueDate || "9999-12-31";
        return dateA.localeCompare(dateB);
      });
  }, [
    displayTasks,
    search,
    project,
    period,
    status,
    priority,
    today,
  ]);

  function addActivity(activityTitle, detail) {
    setActivities((current) => [
      {
        id: Date.now() + Math.random(),
        title: activityTitle,
        detail,
        time: new Date().toLocaleString(),
      },
      ...current,
    ]);
  }

  function clearFilters() {
    setSearch("");
    setProject("all");
    setPeriod("all");
    setStatus("all");
    setPriority("all");
  }

  function openCreate(initialStatus = "todo") {
    setEditingTask(null);
    setTitle("");
    setProjectName("");
    setNewStatus(
      initialStatus === "overdue" ? "todo" : initialStatus
    );
    setNewPriority("Medium");
    setDueDate("");
    setShowModal(true);
  }

  function openEdit(task) {
    const originalTask = tasks.find((item) => item.id === task.id);

    if (!originalTask) return;

    setEditingTask(originalTask);
    setTitle(originalTask.title);
    setProjectName(originalTask.project);
    setNewStatus(
      originalTask.status === "overdue"
        ? "todo"
        : originalTask.status
    );
    setNewPriority(originalTask.priority);
    setDueDate(originalTask.dueDate || "");
    setShowModal(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim().length < 3) {
      alert("Task title kam se kam 3 characters ka hona chahiye.");
      return;
    }

    if (projectName.trim().length < 2) {
      alert("Project name kam se kam 2 characters ka hona chahiye.");
      return;
    }

    if (!dueDate) {
      alert("Please due date select karo.");
      return;
    }

    const taskData = {
      title: title.trim(),
      project: projectName.trim(),
      status: newStatus,
      priority: newPriority,
      dueDate,
    };

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );

      addActivity(
        `Task updated: ${taskData.title}`,
        "Task details were updated."
      );
    } else {
      const newTask = {
        id: Date.now(),
        ...taskData,
      };

      setTasks((current) => [...current, newTask]);

      addActivity(
        `Task created: ${newTask.title}`,
        `Added to ${newTask.project} with ${newTask.priority} priority.`
      );
    }

    clearFilters();
    setActiveItem("My Tasks");
    setShowModal(false);
    setEditingTask(null);
  }

  function handleDelete(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setTasks((current) =>
      current.filter((item) => item.id !== task.id)
    );

    addActivity(
      `Task deleted: ${task.title}`,
      `${task.project} task was deleted.`
    );
  }

  function handleDuplicate(task) {
    const duplicate = {
      ...task,
      id: Date.now(),
      title: `${task.title} (Copy)`,
      status: task.status === "overdue" ? "todo" : task.status,
    };

    setTasks((current) => [...current, duplicate]);

    addActivity(
      `Task duplicated: ${task.title}`,
      `Created "${duplicate.title}" in ${task.project}.`
    );
  }

  function handleStatusChange(taskId, newTaskStatus) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) return;

    if (task.status === newTaskStatus) return;

    setTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? { ...item, status: newTaskStatus }
          : item
      )
    );

    const statusLabel =
      statusOptions.find((item) => item.value === newTaskStatus)?.label ||
      newTaskStatus;

    addActivity(
      `Status changed: ${task.title}`,
      `Task status changed to ${statusLabel}.`
    );
  }

  function handleDueDateChange(taskId, newDate) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || task.dueDate === newDate) return;

    setTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              dueDate: newDate,
              status:
                item.status === "overdue" ? "todo" : item.status,
            }
          : item
      )
    );

    addActivity(
      `Due date updated: ${task.title}`,
      `New due date: ${newDate}.`
    );
  }

  function handleNavigation(item) {
    setActiveItem(item);

    if (["My Tasks", "All Tasks", "Overview"].includes(item)) {
      clearFilters();
      setView("board");
    }
  }

  const filtersActive =
    search !== "" ||
    project !== "all" ||
    period !== "all" ||
    status !== "all" ||
    priority !== "all";

  const taskPageItems = ["My Tasks", "All Tasks", "Overview"];
  const isTasksPage = taskPageItems.includes(activeItem);
  const isActivityPage = activeItem === "Activity";

  const isProjectsPage = [
    "Projects",
    "All Projects",
    "My Projects",
  ].includes(activeItem);

  const isTeamPage = ["Team", "All Members"].includes(activeItem);

  const pageTitle = isTasksPage
    ? activeItem === "Overview"
      ? "Dashboard Overview"
      : activeItem
    : isActivityPage
      ? "Activity"
      : isProjectsPage
        ? "Projects"
        : isTeamPage
          ? "Team Members"
          : activeItem;

  const completedTasks = displayTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgressTasks = displayTasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const todoTasks = displayTasks.filter(
    (task) => task.status === "todo"
  ).length;

  return (
    <div
      className={`app-shell ${
        sidebarCollapsed ? "sidebar-is-collapsed" : ""
      }`}
    >
      <Sidebar
        activeItem={activeItem}
        setActiveItem={handleNavigation}
        isCollapsed={sidebarCollapsed}
      />

      <div className="workspace">
        <Topbar
          search={search}
          setSearch={setSearch}
          onCreate={() => openCreate()}
          onToggleSidebar={() =>
            setSidebarCollapsed((current) => !current)
          }
          onHelp={() => setShowHelp(true)}
          onNotifications={() =>
            setShowNotifications((current) => !current)
          }
          unreadCount={unreadCount}
        />

        <main className="page-content">
          <div className="page-heading">
            <h1>{pageTitle}</h1>

            {isTasksPage && (
              
<button
  className="primary-button"
  onClick={() => openCreate()}
>
  <span className="create-task-label">+ Create New Task</span>

  <span className="create-task-arrow">
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>
</button>

            )}
          </div>

          {isTasksPage && (
            <>
              {activeItem === "Overview" && (
                <div className="overview-stats">
                  <div className="overview-card">
                    <span>Total Tasks</span>
                    <strong>{tasks.length}</strong>
                  </div>

                  <div className="overview-card">
                    <span>To Do</span>
                    <strong>{todoTasks}</strong>
                  </div>

                  <div className="overview-card">
                    <span>In Progress</span>
                    <strong>{inProgressTasks}</strong>
                  </div>

                  <div className="overview-card">
                    <span>Completed</span>
                    <strong>{completedTasks}</strong>
                  </div>
                </div>
              )}

              <div className="toolbar">
                <div className="view-toggle">
                  <button
                    className={view === "board" ? "selected" : ""}
                    onClick={() => setView("board")}
                    aria-label="Board view"
                  >
                    ▦
                  </button>

                  <button
                    className={view === "list" ? "selected" : ""}
                    onClick={() => setView("list")}
                    aria-label="List view"
                  >
                    ☰
                  </button>
                </div>

                <div className="filter-controls">
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    aria-label="Filter by project"
                  >
                    <option value="all">All Project</option>
                    {projects.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    aria-label="Filter by time"
                  >
                    <option value="all">All Time</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Due Date</option>
                  </select>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Filter by status"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  
<div className="filter-select-wrap">
  <select
    className="filter-select"
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    aria-label="Filter by priority"
  >
    <option value="all">All Priority</option>
    <option value="high">High</option>
    <option value="medium">Medium</option>
    <option value="low">Low</option>
  </select>

  <svg
    className="filter-select-arrow"
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
</div>


                  <input
                    className="board-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="⌕ Search task / project"
                    aria-label="Search task or project"
                  />
                </div>
              </div>

              {filtersActive && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear filters ×
                </button>
              )}

              {view === "board" ? (
                <KanbanBoard
                  tasks={filteredTasks}
                  onCreate={openCreate}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onStatusChange={handleStatusChange}
                  onDueDateChange={handleDueDateChange}
                />
              ) : (
                <div className="task-list">
                  {filteredTasks.map((task) => (
                    <div className="list-row" key={task.id}>
                      <strong>{task.title}</strong>
                      <span>{task.project}</span>
                      <span>{task.status}</span>
                      <span>{task.priority}</span>
                      <span>{task.dueDate}</span>

                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(task)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {filteredTasks.length === 0 && (
                    <p className="empty-results">
                      No tasks match your filters.
                    </p>
                  )}
                </div>
              )}

              {filteredTasks.length === 0 && view === "board" && (
                <p className="empty-results">
                  No tasks match your search or filters.
                </p>
              )}
            </>
          )}

          {isActivityPage && (
            <section className="content-panel">
              <p className="section-description">
                Recent activity in your TaskFlow workspace.
              </p>

              <div className="activity-list">
                {activities.map((activity) => (
                  <article className="activity-item" key={activity.id}>
                    <div className="activity-dot">✓</div>
                    <div className="activity-details">
                      <h3>{activity.title}</h3>
                      <p>{activity.detail}</p>
                      <small>{activity.time}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {isProjectsPage && (
            <section className="projects-grid">
              {projects.length > 0 ? (
                projects.map((projectTitle) => {
                  const projectTasks = displayTasks.filter(
                    (task) => task.project === projectTitle
                  );

                  const done = projectTasks.filter(
                    (task) => task.status === "completed"
                  ).length;

                  const progress = Math.round(
                    (done / projectTasks.length) * 100
                  );

                  return (
                    <article className="project-card" key={projectTitle}>
                      <div className="project-card-top">
                        <div className="project-icon">▦</div>
                        <span className="project-tag">Project</span>
                      </div>

                      <h2>{projectTitle}</h2>

                      <p>
                        {projectTasks.length}{" "}
                        {projectTasks.length === 1 ? "task" : "tasks"}
                      </p>

                      <div className="progress-label">
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <button
                        className="project-view-button"
                        onClick={() => {
                          setSearch("");
                          setPeriod("all");
                          setStatus("all");
                          setPriority("all");
                          setProject(projectTitle);
                          setView("board");
                          setActiveItem("My Tasks");
                        }}
                      >
                        View project tasks →
                      </button>
                    </article>
                  );
                })
              ) : (
                <p className="empty-results">
                  No projects yet. Create a task to add a project.
                </p>
              )}
            </section>
          )}

          {isTeamPage && (
            <section className="content-panel">
              <p className="section-description">
                Team directory preview. These are sample members.
              </p>

              <div className="team-grid">
                {teamMembers.map((member) => (
                  <article className="team-card" key={member.name}>
                    <div className="team-avatar">{member.initials}</div>
                    <h2>{member.name}</h2>
                    <p>{member.role}</p>
                    <span className="team-status">Team member</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {!isTasksPage &&
            !isActivityPage &&
            !isProjectsPage &&
            !isTeamPage && (
              <section className="content-panel">
                <h2>{pageTitle}</h2>
                <p className="section-description">
                  This section is ready for future development.
                </p>
              </section>
            )}
        </main>
      </div>

      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
              setEditingTask(null);
            }
          }}
        >
          <form className="task-modal" onSubmit={handleSubmit}>
            <div className="modal-heading">
              <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <label>
              Task title
              <input
                autoFocus
                required
                minLength={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </label>

            <label>
              Project name
              <input
                required
                minLength={2}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </label>

            <label>
              Status
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions
                  .filter((item) => item.value !== "all")
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Due date
              <input
                type="date"
                required
                min={editingTask ? undefined : getTodayString()}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </button>

              <button className="primary-button" type="submit">
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showHelp && (
        <div
          className="utility-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowHelp(false);
            }
          }}
        >
          <section
            className="utility-modal help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <div className="utility-modal-heading">
              <div>
                <span className="utility-eyebrow">TASKFLOW GUIDE</span>
                <h2 id="help-title">How can we help?</h2>
              </div>
              <button
                type="button"
                className="utility-close"
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
              >
                ×
              </button>
            </div>

            <p className="utility-description">
              Quick guide to using your task management workspace.
            </p>

            <div className="help-guide-list">
              <article>
                <span className="help-guide-icon">＋</span>
                <div>
                  <h3>Create a task</h3>
                  <p>
                    Select Create New, enter the title, project, status,
                    priority and due date, then save.
                  </p>
                </div>
              </article>

              <article>
                <span className="help-guide-icon">✎</span>
                <div>
                  <h3>Edit or manage a task</h3>
                  <p>
                    Edit, duplicate, change status, update due dates,
                    or delete a task.
                  </p>
                </div>
              </article>

              <article>
                <span className="help-guide-icon">⌕</span>
                <div>
                  <h3>Search and filter</h3>
                  <p>
                    Use search and project, time, status and priority
                    filters to find tasks.
                  </p>
                </div>
              </article>

              <article>
                <span className="help-guide-icon">▦</span>
                <div>
                  <h3>Manage your workspace</h3>
                  <p>
                    Switch Board/List views, review Activity, or
                    collapse the sidebar to save space.
                  </p>
                </div>
              </article>
            </div>

            <button
              type="button"
              className="utility-primary-button"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}

      {showNotifications && (
        <div
          className="notification-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowNotifications(false);
            }
          }}
        >
          <section
            className="notification-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
          >
            <div className="notification-panel-heading">
              <div>
                <h2 id="notifications-title">Notifications</h2>
                <p>
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You're all caught up."}
                </p>
              </div>

              <button
                type="button"
                className="utility-close"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
              >
                ×
              </button>
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read"
                onClick={markAllNotificationsRead}
              >
                Mark all as read
              </button>
            )}

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const isRead = readNotificationIds.includes(
                    notification.id
                  );

                  return (
                    <button
                      type="button"
                      key={notification.id}
                      className={`notification-item ${
                        isRead
                          ? "notification-read"
                          : "notification-unread"
                      }`}
                      onClick={() =>
                        markNotificationRead(notification.id)
                      }
                    >
                      <span
                        className={`notification-type-icon ${
                          notification.type === "deadline"
                            ? "deadline-icon"
                            : "activity-icon"
                        }`}
                      >
                        {notification.type === "deadline" ? "◷" : "✓"}
                      </span>

                      <span className="notification-copy">
                        <strong>{notification.title}</strong>
                        <span>{notification.detail}</span>
                        <small>{notification.time}</small>
                      </span>

                      {!isRead && (
                        <span
                          className="notification-unread-dot"
                          aria-label="Unread"
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="notification-empty">
                  <span>✓</span>
                  <h3>You're all caught up!</h3>
                  <p>
                    Task updates and upcoming deadlines will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
