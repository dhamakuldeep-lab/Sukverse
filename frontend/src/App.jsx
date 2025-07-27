import React, { useState, useEffect } from 'react';

// API base URLs; during Docker deployment these correspond to service names
const AUTH_API = process.env.AUTH_API || 'http://localhost:8001';
const WORKSHOP_API = process.env.WORKSHOP_API || 'http://localhost:8002';

/**
 * App component
 *
 * This component orchestrates registration, login, dashboards for students,
 * trainers and admins, and the workshop learning interface.  It calls the
 * underlying microservices via REST APIs.  The UI uses Tailwind CSS for
 * modern styling and is responsive by default.
 */
export default function App() {
  // view can be 'home', 'register', 'login', 'student', 'trainer', 'admin', 'workshop', 'studentDetail'
  const [view, setView] = useState('home');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]); // for admin/trainer
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);

  // Helper: fetch with auth
  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  /** Registration handler */
  const handleRegister = async (email, password, role) => {
    const res = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.detail || 'Registration failed');
      return;
    }
    alert('Registration successful! Please log in.');
    setView('login');
  };

  /** Login handler */
  const handleLogin = async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await fetch(`${AUTH_API}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      alert('Invalid credentials');
      return;
    }
    const data = await res.json();
    setToken(data.access_token);
    // fetch user details
    const meRes = await authFetch(`${AUTH_API}/me`);
    const me = await meRes.json();
    setUser(me);
    if (me.role === 'admin') setView('admin');
    else if (me.role === 'trainer') setView('trainer');
    else setView('student');
  };

  /** Load workshops list for student/trainer */
  const loadWorkshops = async () => {
    const res = await fetch(`${WORKSHOP_API}/workshops`);
    const data = await res.json();
    setWorkshops(data);
  };

  /** Select workshop to join or manage */
  const openWorkshop = async (workshop) => {
    setSelectedWorkshop(workshop);
    const res = await fetch(`${WORKSHOP_API}/workshops/${workshop.id}`);
    const data = await res.json();
    setModules(data.modules);
    setView('workshop');
  };

  /** Update progress for student */
  const updateStudentProgress = async (moduleId, substepIndex, timeSpent) => {
    if (!user) return;
    await authFetch(`${WORKSHOP_API}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        module_id: moduleId,
        substep_position: substepIndex,
        time_spent: timeSpent,
      }),
    });
    // local state update: mark complete
    setProgress((prev) => {
      const key = `${user.id}-${moduleId}`;
      const record = prev[key] || { highest: -1 };
      return { ...prev, [key]: { highest: Math.max(record.highest, substepIndex) } };
    });
  };

  /** Submit quiz answers */
  const submitQuiz = async (quizId, answers) => {
    const res = await authFetch(`${WORKSHOP_API}/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, answers }),
    });
    const data = await res.json();
    alert(`You scored ${data.score} / ${data.total}`);
  };

  /** Submit feedback */
  const submitFeedback = async (stars, comments) => {
    await authFetch(`${WORKSHOP_API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, workshop_id: selectedWorkshop.id, stars, comments }),
    });
    alert('Thanks for your feedback!');
  };

  /** Load trainer/admin data */
  const loadStatsAndStudents = async () => {
    if (!selectedWorkshop) return;
    const statsRes = await authFetch(`${WORKSHOP_API}/workshops/${selectedWorkshop.id}/stats`);
    const statsData = await statsRes.json();
    setStats(statsData);
    const analyticsRes = await authFetch(`${WORKSHOP_API}/analytics/${selectedWorkshop.id}`);
    const analyticsData = await analyticsRes.json();
    setAnalytics(analyticsData);
    // list all users via auth service (admin only)
    if (user && user.role === 'admin') {
      const usersRes = await authFetch(`${AUTH_API}/users`);
      const usersData = await usersRes.json();
      setStudents(usersData);
    }
  };

  /** Handle logout */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSelectedWorkshop(null);
    setModules([]);
    setView('home');
  };

  // Load workshops when user enters student or trainer dashboard
  useEffect(() => {
    if (view === 'student' || view === 'trainer') {
      loadWorkshops();
    }
  }, [view]);

  // Load stats/analytics when trainer/admin opens workshop
  useEffect(() => {
    if (view === 'workshop' && (user?.role === 'trainer' || user?.role === 'admin')) {
      loadStatsAndStudents();
    }
  }, [view, selectedWorkshop]);

  // Components
  const Home = () => (
    <div className="text-center mt-20 space-y-4">
      <h1 className="text-3xl font-bold">Welcome to Jabi Learning Platform</h1>
      <div className="space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setView('login')}>Login</button>
        <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setView('register')}>Register</button>
      </div>
    </div>
  );

  const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    return (
      <div className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded space-y-4">
        <h2 className="text-xl font-bold">Register</h2>
        <div>
          <label>Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Role</label>
          <select className="w-full border p-2 rounded" value={role} onChange={e => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white p-2 rounded" onClick={() => handleRegister(email, password, role)}>Register</button>
          <button className="flex-1 bg-gray-300 p-2 rounded" onClick={() => setView('login')}>Back</button>
        </div>
      </div>
    );
  };

  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
      <div className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded space-y-4">
        <h2 className="text-xl font-bold">Login</h2>
        <div>
          <label>Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white p-2 rounded" onClick={() => handleLogin(email, password)}>Login</button>
          <button className="flex-1 bg-gray-300 p-2 rounded" onClick={() => setView('register')}>Register</button>
        </div>
      </div>
    );
  };

  /** Student dashboard: show available workshops */
  const StudentDashboard = () => (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </div>
      <h3 className="text-xl font-semibold">Available Workshops</h3>
      {workshops.length === 0 && <p>No workshops available.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {workshops.map((w) => (
          <div key={w.id} className="p-4 bg-white shadow rounded space-y-2">
            <h4 className="text-lg font-semibold">{w.title}</h4>
            <p className="text-sm text-gray-600">{w.description}</p>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => openWorkshop(w)}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );

  /** Workshop view for students and trainers */
  const WorkshopView = () => {
    const [activeModule, setActiveModule] = useState(0);
    const [activeSubstep, setActiveSubstep] = useState(0);
    const module = modules[activeModule];
    const progressKey = `${user.id}-${module.id}`;
    const highest = progress[progressKey]?.highest ?? -1;
    const handleTabClick = (index) => {
      // For students, restrict to unlocked substeps
      if (user.role === 'student' && index > highest + 1) return;
      setActiveSubstep(index);
    };
    const handleComplete = () => {
      updateStudentProgress(module.id, activeSubstep, 10);
      setActiveSubstep(activeSubstep + 1);
    };
    return (
      <div className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedWorkshop.title}</h2>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setView(user.role)}>Back</button>
        </div>
        <div className="flex space-x-2 overflow-x-auto py-2">
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(idx) || setActiveSubstep(0)}
              className={`px-3 py-1 rounded ${idx === activeModule ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {m.title}
            </button>
          ))}
        </div>
        {/* Subtabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {module.substeps.map((s, idx) => {
            const isLocked = user.role === 'student' && idx > highest + 1;
            const isCompleted = idx <= highest;
            const color = isLocked ? 'bg-gray-300' : isCompleted ? 'bg-green-500 text-white' : idx === activeSubstep ? 'bg-blue-500 text-white' : 'bg-red-500 text-white';
            return (
              <button key={s.id} disabled={isLocked} onClick={() => handleTabClick(idx)} className={`px-2 py-1 rounded text-sm ${color}`}>{s.title}</button>
            );
          })}
        </div>
        {/* Content */}
        <div className="p-4 bg-white shadow rounded min-h-[200px]">
          <h4 className="font-semibold mb-2">{module.substeps[activeSubstep].title}</h4>
          <div dangerouslySetInnerHTML={{ __html: module.substeps[activeSubstep].content || '' }} />
          {/* Complete button for students */}
          {user.role === 'student' && (
            <button className="mt-4 px-3 py-2 bg-green-600 text-white rounded" onClick={handleComplete}>Mark Complete</button>
          )}
        </div>
        {/* Trainer/admin analytics and student list */}
        {(user.role === 'trainer' || user.role === 'admin') && stats && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Workshop Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white shadow rounded">
                <h4 className="font-semibold">Average Completion</h4>
                <p className="text-3xl">{stats.average_completion_percentage}%</p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h4 className="font-semibold">Average Time Spent</h4>
                <p className="text-3xl">{stats.average_time_spent} s</p>
              </div>
              <div className="p-4 bg-white shadow rounded">
                <h4 className="font-semibold">Average Rating</h4>
                <p className="text-3xl">{stats.average_rating ?? 'N/A'}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-4">Module Stats</h3>
            <table className="min-w-full bg-white shadow rounded overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-left text-sm">
                  <th className="p-2">Module</th>
                  <th className="p-2">Avg Completion</th>
                  <th className="p-2">Avg Quiz Score</th>
                  <th className="p-2">Students</th>
                </tr>
              </thead>
              <tbody>
                {stats.modules.map((m) => (
                  <tr key={m.module_id} className="border-t">
                    <td className="p-2">{m.module_title}</td>
                    <td className="p-2">{m.avg_completion_percentage}%</td>
                    <td className="p-2">{m.avg_quiz_score_percentage ?? 'N/A'}%</td>
                    <td className="p-2">{m.enrolled_students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Feedback section for students at last module */}
        {user.role === 'student' && activeModule === modules.length - 1 && (
          <FeedbackSection onSubmit={submitFeedback} />
        )}
      </div>
    );
  };

  const FeedbackSection = ({ onSubmit }) => {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    return (
      <div className="mt-6 p-4 bg-white shadow rounded space-y-3">
        <h3 className="font-semibold">Your Feedback</h3>
        <div className="flex space-x-1 text-2xl">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={i <= stars ? 'text-yellow-400 cursor-pointer' : 'text-gray-400 cursor-pointer'} onClick={() => setStars(i)}>★</span>
          ))}
        </div>
        <textarea className="w-full border p-2 rounded" placeholder="Comments" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onSubmit(stars, comment)}>Submit Feedback</button>
      </div>
    );
  };

  /** Trainer dashboard: show workshops and optionally open a workshop to view analytics */
  const TrainerDashboard = () => (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </div>
      <h3 className="text-xl font-semibold">Your Workshops</h3>
      {workshops.length === 0 && <p>No workshops available.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {workshops.map((w) => (
          <div key={w.id} className="p-4 bg-white shadow rounded space-y-2">
            <h4 className="text-lg font-semibold">{w.title}</h4>
            <p className="text-sm text-gray-600">{w.description}</p>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openWorkshop(w)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  );

  /** Admin dashboard: list users, manage roles (simplified) */
  const AdminDashboard = () => (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </div>
      <h3 className="text-xl font-semibold">Users</h3>
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm">
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {students.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-xl font-semibold mt-6">Workshops</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {workshops.map((w) => (
          <div key={w.id} className="p-4 bg-white shadow rounded space-y-2">
            <h4 className="text-lg font-semibold">{w.title}</h4>
            <p className="text-sm text-gray-600">{w.description}</p>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openWorkshop(w)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4">
      {view === 'home' && <Home />}
      {view === 'register' && <Register />}
      {view === 'login' && <Login />}
      {view === 'student' && user && <StudentDashboard />}
      {view === 'trainer' && user && <TrainerDashboard />}
      {view === 'admin' && user && <AdminDashboard />}
      {view === 'workshop' && user && <WorkshopView />}
    </div>
  );
}