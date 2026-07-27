'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/AdminNav';
import { Users, ShieldCheck, User as UserIcon, Loader2, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firebaseUid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-white">Registered Users ({users.length})</h2>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Firebase UID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Role Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-emerald-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No registered users found. Users will appear automatically upon login.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{user.name}</span>
                      </td>

                      <td className="p-4 text-slate-300">
                        {user.email}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {user.firebaseUid}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                            user.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleRole(user._id, user.role)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
                        >
                          Make {user.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
