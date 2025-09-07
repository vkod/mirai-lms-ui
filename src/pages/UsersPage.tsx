import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active', joined: '2024-01-15', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Instructor', status: 'Active', joined: '2024-02-20', avatar: 'JS' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', status: 'Inactive', joined: '2024-03-10', avatar: 'MJ' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Admin', status: 'Active', joined: '2024-01-05', avatar: 'SW' },
  { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Student', status: 'Active', joined: '2024-04-12', avatar: 'TB' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor user accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
          <UserPlus size={20} />
          Add User
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-10 px-4 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-all">
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-all"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-muted-foreground" />
                      <span className="text-sm">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {user.joined}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 rounded-lg hover:bg-muted transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}