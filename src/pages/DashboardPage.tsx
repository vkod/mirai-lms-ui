import { motion } from 'framer-motion';
import {
  Users,
  Bot,
  TrendingUp,
  Zap,
  Activity,
  Clock,
  Target,
  Brain,
  MessageSquare,
  Sparkles,
  Shield,
  ChevronRight,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const stats = [
  { name: 'Active Agents', value: '24', change: '+8', icon: Bot, color: 'from-blue-500 to-cyan-500', status: 'active' },
  { name: 'Prospect Twins', value: '1,847', change: '+124', icon: Users, color: 'from-purple-500 to-pink-500', status: 'growing' },
  { name: 'Conversations', value: '3,456', change: '+432', icon: MessageSquare, color: 'from-green-500 to-emerald-500', status: 'active' },
  { name: 'Success Rate', value: '94.2%', change: '+2.1%', icon: Target, color: 'from-orange-500 to-red-500', status: 'optimal' },
];

const agentPerformanceData = [
  { time: '00:00', engagements: 120, conversions: 45, twins: 89 },
  { time: '04:00', engagements: 98, conversions: 32, twins: 76 },
  { time: '08:00', engagements: 186, conversions: 78, twins: 145 },
  { time: '12:00', engagements: 245, conversions: 112, twins: 198 },
  { time: '16:00', engagements: 289, conversions: 134, twins: 234 },
  { time: '20:00', engagements: 198, conversions: 89, twins: 156 },
  { time: '23:59', engagements: 145, conversions: 67, twins: 112 },
];

const prospectTwins = [
  { id: 1, name: 'Sarah Chen', role: 'Tech Lead', company: 'TechCorp', engagement: 89, status: 'active', lastActive: '2 mins ago', avatar: '👩‍💻' },
  { id: 2, name: 'Marcus Johnson', role: 'Product Manager', company: 'InnovateCo', engagement: 76, status: 'training', lastActive: '15 mins ago', avatar: '👨‍💼' },
  { id: 3, name: 'Emily Rodriguez', role: 'Designer', company: 'Creative Studios', engagement: 92, status: 'active', lastActive: '1 min ago', avatar: '👩‍🎨' },
  { id: 4, name: 'David Kim', role: 'Data Scientist', company: 'DataFlow', engagement: 84, status: 'active', lastActive: '5 mins ago', avatar: '👨‍🔬' },
  { id: 5, name: 'Lisa Wang', role: 'Marketing Director', company: 'Growth Inc', engagement: 78, status: 'paused', lastActive: '1 hour ago', avatar: '👩‍📊' },
];

const activeAgents = [
  { id: 1, name: 'Sales Navigator', type: 'Outreach', status: 'running', tasks: 234, completed: 189, accuracy: 96, icon: Zap },
  { id: 2, name: 'Content Creator', type: 'Creative', status: 'running', tasks: 145, completed: 132, accuracy: 91, icon: Sparkles },
  { id: 3, name: 'Data Analyzer', type: 'Analytics', status: 'training', tasks: 89, completed: 67, accuracy: 88, icon: Brain },
  { id: 4, name: 'Support Assistant', type: 'Support', status: 'running', tasks: 567, completed: 543, accuracy: 94, icon: Shield },
];

const agentCapabilities = [
  { subject: 'Communication', A: 95, B: 80, fullMark: 100 },
  { subject: 'Analysis', A: 88, B: 75, fullMark: 100 },
  { subject: 'Learning', A: 92, B: 85, fullMark: 100 },
  { subject: 'Creativity', A: 78, B: 90, fullMark: 100 },
  { subject: 'Efficiency', A: 94, B: 82, fullMark: 100 },
  { subject: 'Accuracy', A: 96, B: 88, fullMark: 100 },
];

const conversationMetrics = [
  { day: 'Mon', initiated: 120, successful: 98, failed: 22 },
  { day: 'Tue', initiated: 132, successful: 112, failed: 20 },
  { day: 'Wed', initiated: 101, successful: 89, failed: 12 },
  { day: 'Thu', initiated: 134, successful: 118, failed: 16 },
  { day: 'Fri', initiated: 156, successful: 142, failed: 14 },
  { day: 'Sat', initiated: 189, successful: 167, failed: 22 },
  { day: 'Sun', initiated: 145, successful: 128, failed: 17 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            AI Agent Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Monitor your agents and prospect twins in real-time</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>Last updated: just now</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6 gradient-border hover:shadow-lg hover:shadow-accent/10 transition-all relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                stat.status === 'active' ? 'bg-green-500/20 text-green-400' :
                stat.status === 'growing' ? 'bg-blue-500/20 text-blue-400' :
                stat.status === 'optimal' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {stat.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {stat.change} today
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center animate-pulse`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} />
                Prospect Twins
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Digital replicas engaging with targets</p>
            </div>
            <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {prospectTwins.map((twin) => (
              <div key={twin.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{twin.avatar}</div>
                  <div>
                    <p className="font-medium">{twin.name}</p>
                    <p className="text-sm text-muted-foreground">{twin.role} at {twin.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{twin.engagement}% engaged</p>
                    <p className="text-xs text-muted-foreground">{twin.lastActive}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    twin.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    twin.status === 'training' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {twin.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain size={20} />
              Agent Capabilities
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={agentCapabilities}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#374151" />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Baseline" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot size={20} />
              Active Agents
            </h2>
            <span className="text-sm text-muted-foreground">4 running</span>
          </div>
          <div className="space-y-3">
            {activeAgents.map((agent) => (
              <div key={agent.id} className="p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <agent.icon size={18} className="text-blue-400" />
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {agent.type}
                    </span>
                  </div>
                  <button className={`p-1 rounded-lg hover:bg-background/80 transition-colors ${
                    agent.status === 'running' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {agent.status === 'running' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {agent.completed}/{agent.tasks} tasks
                  </span>
                  <span className="text-green-400">
                    {agent.accuracy}% accuracy
                  </span>
                </div>
                <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${(agent.completed / agent.tasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} />
              Agent Performance
            </h2>
            <span className="text-sm text-muted-foreground">Last 24 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="engagements" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="twins" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare size={20} />
            Conversation Metrics
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Initiated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Failed</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={conversationMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="initiated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="successful" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}