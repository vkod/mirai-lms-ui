import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users,
  Bot,
  TrendingUp,
  Activity,
  Clock,
  Brain,
  Shield,
  ChevronRight,
  Phone,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  TrendingDown,
  Flame,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const stats = [
  { name: 'Active Digital Twins', value: '2,847', change: '+324', trend: 'up', icon: Users, color: 'from-purple-500 to-pink-500', status: 'growing', subtitle: '89% engagement rate' },
  { name: 'Intelligence Sessions', value: '456', change: '+67', trend: 'up', icon: ClipboardList, color: 'from-blue-500 to-cyan-500', status: 'active', subtitle: '23 active now' },
  { name: 'Voice Conversations', value: '1,234', change: '+189', trend: 'up', icon: Phone, color: 'from-green-500 to-emerald-500', status: 'active', subtitle: 'Avg duration: 4.5 min' },
  { name: 'AI Agent Performance', value: '96.2%', change: '+3.1%', trend: 'up', icon: Bot, color: 'from-orange-500 to-red-500', status: 'optimal', subtitle: 'Above target' },
];

const leadClassificationData = [
  { name: 'Hot Leads', value: 847, percentage: 30, color: '#ef4444' },
  { name: 'Warm Leads', value: 1234, percentage: 43, color: '#f59e0b' },
  { name: 'Cold Leads', value: 766, percentage: 27, color: '#3b82f6' },
];

const agentMetrics = [
  { id: 1, name: 'Digital Twin Generator', type: 'Persona Creation', status: 'running', processed: 2847, successRate: 96, cost: '$234', efficiency: 98, icon: Users, trend: 'up' },
  { id: 2, name: 'Intelligence Extractor', type: 'Data Analysis', status: 'running', processed: 456, successRate: 94, cost: '$189', efficiency: 92, icon: Brain, trend: 'up' },
  { id: 3, name: 'Voice Synthesizer', type: 'Communication', status: 'running', processed: 1234, successRate: 91, cost: '$567', efficiency: 89, icon: Phone, trend: 'stable' },
  { id: 4, name: 'Insight Aggregator', type: 'Analytics', status: 'optimizing', processed: 3456, successRate: 93, cost: '$412', efficiency: 95, icon: BarChart3, trend: 'up' },
];

const systemHealth = [
  { metric: 'Twin Generation', current: 95, target: 90, status: 'optimal' },
  { metric: 'Session Processing', current: 88, target: 85, status: 'good' },
  { metric: 'Voice Quality', current: 92, target: 90, status: 'optimal' },
  { metric: 'Data Accuracy', current: 96, target: 95, status: 'optimal' },
  { metric: 'Response Time', current: 94, target: 90, status: 'optimal' },
  { metric: 'System Load', current: 78, target: 80, status: 'good' },
];

const weeklyActivityData = [
  { day: 'Mon', twins: 234, sessions: 45, calls: 98, insights: 567 },
  { day: 'Tue', twins: 256, sessions: 52, calls: 112, insights: 623 },
  { day: 'Wed', twins: 189, sessions: 38, calls: 89, insights: 489 },
  { day: 'Thu', twins: 278, sessions: 61, calls: 118, insights: 712 },
  { day: 'Fri', twins: 312, sessions: 73, calls: 142, insights: 845 },
  { day: 'Sat', twins: 345, sessions: 89, calls: 167, insights: 923 },
  { day: 'Sun', twins: 298, sessions: 67, calls: 128, insights: 756 },
];

const realtimeMetrics = [
  { label: 'Active Twins', value: 847, change: 23, status: 'increasing' },
  { label: 'Live Sessions', value: 23, change: 5, status: 'stable' },
  { label: 'Ongoing Calls', value: 12, change: -2, status: 'decreasing' },
  { label: 'Processing Queue', value: 45, change: 8, status: 'increasing' },
];

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showAlerts, setShowAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Real-time insights from your AI-powered prospect ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity size={16} className="text-green-500 animate-pulse" />
            <span>Live</span>
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      {showAlerts && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium">System Intelligence Update</p>
                <p className="text-xs text-muted-foreground mt-0.5">23 new hot leads identified • Voice AI optimization complete • 156 twins updated with latest insights</p>
              </div>
            </div>
            <button onClick={() => setShowAlerts(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

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
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-500' :
                  stat.trend === 'down' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp size={14} /> :
                   stat.trend === 'down' ? <ArrowDown size={14} /> :
                   <Minus size={14} />}
                  {stat.change} today
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              Lead Classification
            </h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Manage
              <ChevronRight size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={leadClassificationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {leadClassificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {leadClassificationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.value}</span>
                  <span className="text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              Weekly Activity Overview
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Twins</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Sessions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Calls</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Insights</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyActivityData}>
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
              <Bar dataKey="twins" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="calls" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="insights" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-green-500" />
              Real-time Activity
            </h2>
          </div>
          <div className="space-y-4">
            {realtimeMetrics.map((metric, index) => (
              <div key={index} className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{metric.value}</span>
                    <span className={`text-xs flex items-center gap-0.5 ${
                      metric.status === 'increasing' ? 'text-green-500' :
                      metric.status === 'decreasing' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {metric.status === 'increasing' ? <ArrowUp size={12} /> :
                       metric.status === 'decreasing' ? <ArrowDown size={12} /> :
                       <Minus size={12} />}
                      {Math.abs(metric.change)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metric.status === 'increasing' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      metric.status === 'decreasing' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      'bg-gradient-to-r from-yellow-500 to-amber-500'
                    }`}
                    style={{ width: `${(metric.value / (metric.value + 100)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot size={20} />
              Agent Ecosystem Health
            </h2>
            <span className="text-sm text-green-400 flex items-center gap-1">
              <CheckCircle2 size={14} />
              All Systems Operational
            </span>
          </div>
          <div className="space-y-3">
            {agentMetrics.map((agent) => (
              <div key={agent.id} className="p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <agent.icon size={18} className="text-blue-400" />
                    <span className="font-medium">{agent.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      agent.status === 'running' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'optimizing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {agent.trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> :
                     agent.trend === 'down' ? <TrendingDown size={14} className="text-red-500" /> :
                     <Minus size={14} className="text-yellow-500" />}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-muted-foreground">Processed</span>
                    <p className="font-medium">{agent.processed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success</span>
                    <p className="font-medium text-green-400">{agent.successRate}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost</span>
                    <p className="font-medium">{agent.cost}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Efficiency</span>
                    <p className="font-medium text-blue-400">{agent.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield size={20} />
              System Health Metrics
            </h2>
          </div>
          <div className="space-y-3">
            {systemHealth.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.current}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                      item.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.status === 'optimal' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      item.status === 'good' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      item.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${item.current}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Target: {item.target}%</span>
                  <span>{item.current >= item.target ? '+' : ''}{item.current - item.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}