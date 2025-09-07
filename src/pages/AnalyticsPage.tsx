import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  Download,
  Calendar,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

const performanceData = [
  { month: 'Jan', students: 400, courses: 24, revenue: 4000, completion: 85 },
  { month: 'Feb', students: 300, courses: 28, revenue: 3000, completion: 82 },
  { month: 'Mar', students: 500, courses: 32, revenue: 5000, completion: 88 },
  { month: 'Apr', students: 280, courses: 35, revenue: 2780, completion: 79 },
  { month: 'May', students: 590, courses: 38, revenue: 5900, completion: 92 },
  { month: 'Jun', students: 320, courses: 42, revenue: 3200, completion: 86 },
];

const subjectData = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Science', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'History', A: 99, B: 100, fullMark: 150 },
  { subject: 'Tech', A: 85, B: 90, fullMark: 150 },
  { subject: 'Arts', A: 65, B: 85, fullMark: 150 },
];

const kpiCards = [
  { title: 'Average Completion Rate', value: '87%', change: '+5%', icon: Target, trend: 'up' },
  { title: 'Student Satisfaction', value: '4.8/5', change: '+0.3', icon: Users, trend: 'up' },
  { title: 'Course Engagement', value: '92%', change: '+8%', icon: BookOpen, trend: 'up' },
  { title: 'Revenue Growth', value: '+23%', change: '$12K', icon: DollarSign, trend: 'up' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track performance and insights</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border hover:bg-muted/50 transition-all">
            <Calendar size={20} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-sm text-green-500">{card.change}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                <card.icon size={20} className="text-accent" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Performance Overview</h2>
            <Activity size={20} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Subject Performance</h2>
            <Target size={20} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={subjectData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Previous" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Monthly Trends</h2>
          <TrendingUp size={20} className="text-muted-foreground" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Area type="monotone" dataKey="courses" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}