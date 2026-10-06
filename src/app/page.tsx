"use client";

import { useMemo, useState, type ReactNode } from "react";

type Task = {
  id: number;
  name: string;
  project: string;
  priority: "High" | "Medium" | "Low";
  status: "In Progress" | "Pending" | "Completed";
  due: string;
  initials: string;
  color: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    name: "Finalize homepage wireframes",
    project: "Website Redesign",
    priority: "High",
    status: "In Progress",
    due: "Today",
    initials: "SC",
    color: "lavender",
  },
  {
    id: 2,
    name: "Review Q3 campaign brief",
    project: "Marketing Campaign",
    priority: "Medium",
    status: "Pending",
    due: "Today",
    initials: "JD",
    color: "peach",
  },
  {
    id: 3,
    name: "Update component library",
    project: "Mobile App",
    priority: "Low",
    status: "In Progress",
    due: "Oct 09",
    initials: "AK",
    color: "mint",
  },
  {
    id: 4,
    name: "Prepare client presentation",
    project: "Website Redesign",
    priority: "High",
    status: "Pending",
    due: "Oct 10",
    initials: "SC",
    color: "lavender",
  },
  {
    id: 5,
    name: "Set up analytics events",
    project: "Marketing Campaign",
    priority: "Medium",
    status: "Completed",
    due: "Oct 06",
    initials: "JD",
    color: "peach",
  },
];

const initialProjects = [
  {
    name: "Website Redesign",
    category: "Design · Product",
    progress: 72,
    tasks: "18 / 25",
    color: "violet",
    mark: "W",
    date: "Oct 24, 2026",
  },
  {
    name: "Marketing Campaign",
    category: "Growth · Marketing",
    progress: 46,
    tasks: "12 / 26",
    color: "orange",
    mark: "M",
    date: "Nov 02, 2026",
  },
  {
    name: "Mobile App",
    category: "Product · Engineering",
    progress: 31,
    tasks: "8 / 26",
    color: "green",
    mark: "A",
    date: "Nov 18, 2026",
  },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    folder: (
      <>
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
        <path d="M3 10h18" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1L11 7.3h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z"
          transform="translate(-1 -1)"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10m-7 6h4" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState(initialTasks);
  const [projectList, setProjectList] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");
  const [priority, setPriority] = useState("All priority");
  const [view, setView] = useState("Overview");
  const [dialog, setDialog] = useState<"task" | "project" | null>(null);
  const [notice, setNotice] = useState("");

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesQuery = `${task.name} ${task.project}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          matchesQuery &&
          (status === "All status" || task.status === status) &&
          (priority === "All priority" || task.priority === priority)
        );
      }),
    [tasks, query, status, priority],
  );

  function addTask(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    setTasks((current) => [
      {
        id: Date.now(),
        name,
        project: String(formData.get("project") ?? "Website Redesign"),
        priority: String(
          formData.get("priority") ?? "Medium",
        ) as Task["priority"],
        status: "Pending",
        due: String(formData.get("due") ?? "Oct 14"),
        initials: "SC",
        color: "lavender",
      },
      ...current,
    ]);
    setDialog(null);
    setNotice("Task added to your workspace");
    window.setTimeout(() => setNotice(""), 2600);
  }

  const completed = tasks.filter((task) => task.status === "Completed").length;
  const toggleTask = (id: number) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Completed" ? "Pending" : "Completed",
            }
          : task,
      ),
    );
  const pageCopy: Record<
    string,
    { eyebrow: string; title: string; subtitle: string }
  > = {
    Overview: {
      eyebrow: "MONDAY, OCTOBER 06, 2026",
      title: "Good morning, Sarah",
      subtitle: "Here's what's happening with your projects today.",
    },
    Projects: {
      eyebrow: "WORKSPACE / PROJECTS",
      title: "Projects",
      subtitle: "Plan, track, and manage every project in your workspace.",
    },
    "My tasks": {
      eyebrow: "WORKSPACE / MY TASKS",
      title: "My tasks",
      subtitle: "Focus on the work that needs your attention.",
    },
    Reports: {
      eyebrow: "WORKSPACE / REPORTS",
      title: "Reports",
      subtitle: "Understand progress and keep your team aligned.",
    },
    Settings: {
      eyebrow: "WORKSPACE / SETTINGS",
      title: "Settings",
      subtitle: "Manage your workspace preferences.",
    },
  };
  const currentPage = pageCopy[view] ?? pageCopy.Overview;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="TaskFlow home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>taskflow</span>
        </a>
        <div className="workspace-switch">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy">
            <strong>Studio North</strong>
            <small>Workspace</small>
          </span>
          <span className="chevron">⌄</span>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            ["Overview", "grid"],
            ["Projects", "folder"],
            ["My tasks", "check"],
            ["Reports", "chart"],
          ].map(([label, icon]) => (
            <button
              key={label}
              onClick={() => setView(label)}
              className={`nav-item ${view === label ? "active" : ""}`}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "My tasks" && <span className="nav-count">8</span>}
            </button>
          ))}
        </nav>
        <div className="side-project-heading">
          <p className="nav-label">YOUR PROJECTS</p>
          <button onClick={() => setDialog("project")} aria-label="Add project">
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="project-nav">
          {projectList.map((project) => (
            <button
              key={project.name}
              className="project-nav-item"
              onClick={() => {
                setView("Projects");
                setQuery(project.name);
              }}
            >
              <span className={`project-dot ${project.color}`} />
              <span>{project.name}</span>
              <span className="project-menu">···</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setView("Settings")}>
            <Icon name="settings" />
            <span>Settings</span>
          </button>
          <div className="profile-card">
            <span className="profile-avatar">SC</span>
            <span className="profile-copy">
              <strong>Sarah Chen</strong>
              <small>Free plan</small>
            </span>
            <button aria-label="Profile options">···</button>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{view}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input
                aria-label="Search tasks and projects"
                placeholder="Search anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <i />
            </button>
            <span className="top-avatar">SC</span>
          </div>
        </header>
        <div className="content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">{currentPage.eyebrow}</p>
              <h1>
                {currentPage.title}{" "}
                {view === "Overview" && <span className="wave">✦</span>}
              </h1>
              <p className="subheading">{currentPage.subtitle}</p>
            </div>
            {(view === "Overview" || view === "Projects") && (
              <button
                className="primary-button"
                onClick={() => setDialog("project")}
              >
                <Icon name="plus" size={17} /> New project
              </button>
            )}
            {view === "My tasks" && (
              <button
                className="primary-button"
                onClick={() => setDialog("task")}
              >
                <Icon name="plus" size={17} /> Add task
              </button>
            )}
          </div>

          {view === "Overview" && (
            <section className="stats-grid" aria-label="Workspace summary">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total projects</span>
                  <span className="stat-icon violet-bg">
                    <Icon name="folder" size={17} />
                  </span>
                </div>
                <strong>
                  {projectList.length.toString().padStart(2, "0")}
                </strong>
                <div className="stat-foot">
                  <span className="trend">↗ 12%</span>
                  <span>vs. last month</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total tasks</span>
                  <span className="stat-icon blue-bg">
                    <Icon name="check" size={17} />
                  </span>
                </div>
                <strong>{(tasks.length + 67).toString()}</strong>
                <div className="stat-foot">
                  <span className="trend">↗ 8%</span>
                  <span>vs. last month</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>Completed tasks</span>
                  <span className="stat-icon green-bg">
                    <Icon name="check" size={17} />
                  </span>
                </div>
                <strong>{(completed + 42).toString()}</strong>
                <div className="stat-foot">
                  <span className="trend">↗ 18%</span>
                  <span>vs. last month</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="stat-top">
                  <span>In progress</span>
                  <span className="stat-icon orange-bg">
                    <Icon name="chart" size={17} />
                  </span>
                </div>
                <strong>12</strong>
                <div className="stat-foot">
                  <span className="neutral-trend">3 due soon</span>
                  <span>this week</span>
                </div>
              </article>
            </section>
          )}

          {(view === "Overview" || view === "Projects") && (
            <section className="projects-section">
              <div className="section-heading">
                <div>
                  <h2>{view === "Projects" ? "All projects" : "Projects"}</h2>
                  <p>
                    {view === "Projects"
                      ? "Keep your projects organized and moving forward."
                      : "Keep an eye on your team&apos;s progress."}
                  </p>
                </div>
                {view === "Overview" && (
                  <button
                    className="text-button"
                    onClick={() => setView("Projects")}
                  >
                    View all projects <Icon name="arrow" size={15} />
                  </button>
                )}
              </div>
              <div className="project-grid">
                {projectList.map((project, index) => (
                  <article className="project-card" key={project.name}>
                    <div className="project-card-top">
                      <span className={`project-logo ${project.color}`}>
                        {project.mark}
                      </span>
                      <button
                        className="icon-button subtle"
                        aria-label={`Options for ${project.name}`}
                      >
                        <Icon name="more" />
                      </button>
                    </div>
                    <h3>{project.name}</h3>
                    <p className="project-category">{project.category}</p>
                    <div className="progress-heading">
                      <span>Progress</span>
                      <strong>{project.progress}%</strong>
                    </div>
                    <div className="progress-track">
                      <span
                        className={project.color}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="project-meta">
                      <span>
                        <Icon name="check" size={14} />
                        {project.tasks} tasks
                      </span>
                      <span>
                        <Icon name="calendar" size={14} />
                        {project.date}
                      </span>
                    </div>
                    <div className="project-card-footer">
                      <div className="avatar-stack">
                        <span className="mini-avatar av1">SC</span>
                        <span className="mini-avatar av2">JD</span>
                        <span className="mini-avatar av3">AK</span>
                        <span className="avatar-more">+2</span>
                      </div>
                      <span className="project-status">
                        <i />{" "}
                        {index === 0
                          ? "On track"
                          : index === 1
                            ? "In progress"
                            : "In progress"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(view === "Overview" || view === "My tasks") && (
            <section className="tasks-section">
              <div className="section-heading task-heading">
                <div>
                  <h2>
                    My tasks <span className="task-total">{tasks.length}</span>
                  </h2>
                  <p>A little progress each day adds up.</p>
                </div>
                <button
                  className="outline-button"
                  onClick={() => setDialog("task")}
                >
                  <Icon name="plus" size={16} /> Add task
                </button>
              </div>
              <div className="task-toolbar">
                <div className="task-tabs">
                  <button className="selected-tab">
                    All tasks <span>{tasks.length}</span>
                  </button>
                  <button onClick={() => setStatus("Pending")}>Upcoming</button>
                  <button onClick={() => setStatus("Completed")}>
                    Completed
                  </button>
                </div>
                <div className="filters">
                  <label className="filter-control">
                    <Icon name="filter" size={15} />
                    <select
                      aria-label="Filter by status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option>All status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </label>
                  <label className="filter-control">
                    <select
                      aria-label="Filter by priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option>All priority</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <span className="select-chevron">⌄</span>
                  </label>
                </div>
              </div>
              <div className="task-table-wrap">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th className="task-name-head">TASK NAME</th>
                      <th>PROJECT</th>
                      <th>PRIORITY</th>
                      <th>DUE DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <button
                            className={`task-check ${task.status === "Completed" ? "is-done" : ""}`}
                            onClick={() => toggleTask(task.id)}
                            aria-label={`Mark ${task.name} ${task.status === "Completed" ? "incomplete" : "complete"}`}
                          >
                            {task.status === "Completed" && <span>✓</span>}
                          </button>
                          <span
                            className={
                              task.status === "Completed"
                                ? "task-name done"
                                : "task-name"
                            }
                          >
                            {task.name}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`table-project-dot ${task.project === "Website Redesign" ? "violet" : task.project === "Mobile App" ? "green" : "orange"}`}
                          />
                          {task.project}
                        </td>
                        <td>
                          <span
                            className={`priority ${task.priority.toLowerCase()}`}
                          >
                            <i />
                            {task.priority}
                          </span>
                        </td>
                        <td className="due-date">{task.due}</td>
                        <td>
                          <span
                            className={`status-pill ${task.status.toLowerCase().replace(" ", "-")}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-button row-more"
                            aria-label="Task options"
                          >
                            <Icon name="more" size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleTasks.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <Icon name="search" size={21} />
                    </span>
                    <strong>No tasks found</strong>
                    <p>Try another search or adjust your filters.</p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setStatus("All status");
                        setPriority("All priority");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                <div className="table-footer">
                  <span>
                    Showing{" "}
                    <strong>
                      {visibleTasks.length ? 1 : 0}-{visibleTasks.length}
                    </strong>{" "}
                    of <strong>{tasks.length}</strong> tasks
                  </span>
                  <div className="pagination">
                    <button disabled>‹</button>
                    <button className="page-number">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>…</span>
                    <button>8</button>
                    <button>›</button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {view === "Reports" && (
            <section className="page-panel">
              <div className="section-heading">
                <div>
                  <h2>Workspace reports</h2>
                  <p>Track delivery health across your projects.</p>
                </div>
              </div>
              <div className="report-grid">
                <article>
                  <span className="stat-icon violet-bg">
                    <Icon name="chart" size={17} />
                  </span>
                  <strong>{completed + 42}</strong>
                  <p>Completed tasks</p>
                </article>
                <article>
                  <span className="stat-icon orange-bg">
                    <Icon name="calendar" size={17} />
                  </span>
                  <strong>12</strong>
                  <p>Tasks in progress</p>
                </article>
                <article>
                  <span className="stat-icon green-bg">
                    <Icon name="check" size={17} />
                  </span>
                  <strong>{projectList.length}</strong>
                  <p>Active projects</p>
                </article>
              </div>
            </section>
          )}
          {view === "Settings" && (
            <section className="page-panel settings-panel">
              <div className="section-heading">
                <div>
                  <h2>Workspace settings</h2>
                  <p>These settings apply to your Studio North workspace.</p>
                </div>
              </div>
              <label>
                Workspace name
                <input defaultValue="Studio North" />
              </label>
              <label>
                Workspace description
                <textarea
                  rows={4}
                  defaultValue="A focused workspace for design, product, and growth teams."
                />
              </label>
              <button
                className="primary-button"
                onClick={() => {
                  setNotice("Settings saved");
                  window.setTimeout(() => setNotice(""), 2600);
                }}
              >
                Save changes
              </button>
            </section>
          )}
          <footer className="page-footer">
            <span>© 2026 TaskFlow</span>
            <span>
              Made for focused work <span className="footer-heart">♥</span>
            </span>
          </footer>
        </div>
      </section>

      {notice && (
        <div className="toast">
          <span>✓</span>
          {notice}
        </div>
      )}
      {dialog && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDialog(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="modal-top">
              <div>
                <p className="eyebrow">WORKSPACE</p>
                <h2 id="dialog-title">
                  {dialog === "task" ? "Create a task" : "New project"}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setDialog(null)}
                aria-label="Close dialog"
              >
                <Icon name="close" />
              </button>
            </div>
            {dialog === "task" ? (
              <form action={addTask}>
                <label>
                  Task name
                  <input
                    required
                    name="name"
                    placeholder="e.g. Review project brief"
                    autoFocus
                  />
                </label>
                <div className="form-row">
                  <label>
                    Project
                    <select name="project">
                      {projectList.map((project) => (
                        <option key={project.name}>{project.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select name="priority">
                      <option>Medium</option>
                      <option>High</option>
                      <option>Low</option>
                    </select>
                  </label>
                </div>
                <label>
                  Due date
                  <input name="due" placeholder="e.g. Oct 14" />
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setDialog(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    Create task
                  </button>
                </div>
              </form>
            ) : (
              <form
                action={(formData) => {
                  const name = String(formData.get("name") ?? "").trim();
                  if (name) {
                    setProjectList((current) => [
                      ...current,
                      {
                        name,
                        category: "New project",
                        progress: 0,
                        tasks: "0 / 0",
                        color: "violet",
                        mark: name.slice(0, 1).toUpperCase(),
                        date: "No deadline",
                      },
                    ]);
                    setNotice("Project added to your workspace");
                    window.setTimeout(() => setNotice(""), 2600);
                  }
                  setDialog(null);
                }}
              >
                <label>
                  Project name
                  <input
                    required
                    name="name"
                    placeholder="e.g. Product launch"
                    autoFocus
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="What is this project about?"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Start date
                    <input type="date" name="start" />
                  </label>
                  <label>
                    End date
                    <input type="date" name="end" />
                  </label>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setDialog(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    Create project
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
