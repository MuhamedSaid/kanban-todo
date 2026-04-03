import { Task, CreateTaskPayload, ColumnId, PAGE_SIZE } from '@/types/task';

// ============================================================
// API Client — communicates with json-server (or Next.js API routes)
// ============================================================

// When NEXT_PUBLIC_API_URL is set (e.g., http://localhost:4000), use json-server.
// When NOT set (Vercel), fall back to localStorage for a stateful, stable demo without a DB.
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_LOCAL = !API_URL;

// Initial payload for the Vercel demo
const initialTasks: Task[] = [
  { id: 1, title: 'API integration', description: 'Connect frontend to REST endpoints', column: 'todo', priority: 'MEDIUM' },
  { id: 2, title: 'Unit tests', description: 'Write tests for utility functions', column: 'todo', priority: 'LOW' },
  { id: 3, title: 'Performance audit', description: 'Lighthouse scores and bundle analysis', column: 'in_review', priority: 'HIGH' },
  { id: 4, title: 'Notification system', description: 'Toast notifications and in-app alerts', column: 'todo', priority: 'MEDIUM' },
  { id: 5, title: 'User settings page', description: 'Profile editing scenarios', column: 'done', priority: 'LOW' },
  { id: 6, title: 'Authentication flow', description: 'Implement login and signup', column: 'in_progress', priority: 'HIGH' },
  { id: 7, title: 'Payment gateway', description: 'Integrate Stripe for premium subs', column: 'in_review', priority: 'HIGH' },
  { id: 8, title: 'Responsive header', description: 'Fix mobile navigation menu', column: 'todo', priority: 'LOW' },
  { id: 9, title: 'Dashboard layout', description: 'Build responsive sidebar', column: 'done', priority: 'MEDIUM' },
  { id: 10, title: 'Design system', description: 'Set up color palette and typography', column: 'in_progress', priority: 'HIGH' },
];

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return initialTasks;
  const stored = localStorage.getItem('kanban_tasks');
  if (!stored) {
    localStorage.setItem('kanban_tasks', JSON.stringify(initialTasks));
    return initialTasks;
  }
  return JSON.parse(stored);
}

function saveLocalTasks(tasks: Task[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
  }
}

// Simulate network delay for realism during the demo
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface ColumnTasksResponse {
  tasks: Task[];
  hasMore: boolean;
  totalCount: number;
}

export async function fetchColumnTasks(
  column: ColumnId,
  page: number = 1,
  search: string = ''
): Promise<ColumnTasksResponse> {
  if (USE_LOCAL) {
    await delay(300);
    const all = getLocalTasks();
    let filtered = all.filter((t) => t.column === column);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    const totalCount = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const paginated = filtered.slice(start, start + PAGE_SIZE);
    return { tasks: paginated, hasMore: start + PAGE_SIZE < totalCount, totalCount };
  }

  // --- json-server flow ---
  const params = new URLSearchParams({ column, _page: String(page), _limit: String(PAGE_SIZE) });
  if (search.trim()) params.set('q', search.trim());
  const res = await fetch(`${API_URL}/tasks?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const tasks: Task[] = await res.json();
  const totalCount = Number(res.headers.get('X-Total-Count') || tasks.length);
  return { tasks, hasMore: page * PAGE_SIZE < totalCount, totalCount };
}

export async function fetchAllTasksCount(): Promise<number> {
  if (USE_LOCAL) {
    return getLocalTasks().length;
  }
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks count`);
  const tasks: Task[] = await res.json();
  return tasks.length;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  if (USE_LOCAL) {
    await delay(400);
    const all = getLocalTasks();
    const newTask: Task = { ...payload, id: Date.now() };
    saveLocalTasks([...all, newTask]);
    return newTask;
  }

  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create`);
  return res.json();
}

export async function updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
  if (USE_LOCAL) {
    await delay(200);
    const all = getLocalTasks();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    all[idx] = { ...all[idx], ...updates };
    saveLocalTasks(all);
    return all[idx];
  }

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  if (USE_LOCAL) {
    await delay(300);
    const all = getLocalTasks();
    saveLocalTasks(all.filter((t) => t.id !== id));
    return;
  }

  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete`);
}
