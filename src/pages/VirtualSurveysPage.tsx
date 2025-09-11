import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ChartBar, 
  Send, 
  Users, 
  Filter,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  targetAudience: number;
  responses: number;
  responseRate: number;
  createdAt: string;
  endDate: string;
  questionCount: number;
  lastActivity: string;
}

const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'Product Feedback Survey',
    description: 'Gathering feedback on our new AI-powered features',
    status: 'active',
    targetAudience: 2500,
    responses: 1823,
    responseRate: 72.9,
    createdAt: '2024-01-10',
    endDate: '2024-01-25',
    questionCount: 12,
    lastActivity: '2 hours ago'
  },
  {
    id: '2',
    title: 'Campaign Material Review',
    description: 'Testing new marketing visuals with target demographics',
    status: 'active',
    targetAudience: 1500,
    responses: 892,
    responseRate: 59.5,
    createdAt: '2024-01-08',
    endDate: '2024-01-20',
    questionCount: 8,
    lastActivity: '5 minutes ago'
  },
  {
    id: '3',
    title: 'Customer Satisfaction Q1',
    description: 'Quarterly satisfaction and NPS survey',
    status: 'completed',
    targetAudience: 5000,
    responses: 4215,
    responseRate: 84.3,
    createdAt: '2023-12-15',
    endDate: '2024-01-05',
    questionCount: 15,
    lastActivity: '3 days ago'
  },
  {
    id: '4',
    title: 'Feature Priority Assessment',
    description: 'Understanding which features matter most to our users',
    status: 'draft',
    targetAudience: 3000,
    responses: 0,
    responseRate: 0,
    createdAt: '2024-01-12',
    endDate: '2024-01-30',
    questionCount: 10,
    lastActivity: 'Not started'
  }
];

export default function VirtualSurveysPage() {
  const navigate = useNavigate();
  const [surveys] = useState<Survey[]>(mockSurveys);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Survey['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'draft':
        return <AlertCircle size={14} />;
      case 'paused':
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalSurveys: surveys.length,
    activeSurveys: surveys.filter(s => s.status === 'active').length,
    totalResponses: surveys.reduce((acc, s) => acc + s.responses, 0),
    avgResponseRate: surveys.filter(s => s.status !== 'draft').reduce((acc, s) => acc + s.responseRate, 0) / surveys.filter(s => s.status !== 'draft').length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Virtual Surveys
          </h1>
          <p className="text-muted-foreground mt-1">
            Collect insights from your virtual lead twins at scale
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/surveys/create')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          Create Survey
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Surveys</span>
            <ChartBar className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalSurveys}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Surveys</span>
            <Send className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.activeSurveys}</p>
          <p className="text-xs text-green-500 mt-1">Currently running</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Responses</span>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalResponses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">From all surveys</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Response Rate</span>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.avgResponseRate.toFixed(1)}%</p>
          <p className="text-xs text-orange-500 mt-1">↑ 5% from last month</p>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 outline-none transition-all focus:bg-muted focus:ring-2 focus:ring-accent"
          />
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'draft', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                filterStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSurveys.map((survey, index) => (
          <motion.div
            key={survey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl border border-border overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                    {survey.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {survey.description}
                  </p>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)}`}>
                  {getStatusIcon(survey.status)}
                  {survey.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {survey.lastActivity}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <span className="text-sm font-medium">{survey.responseRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${survey.responseRate}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{survey.responses.toLocaleString()} responses</span>
                  <span>{survey.targetAudience.toLocaleString()} targeted</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-sm font-medium">{survey.questionCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{new Date(survey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="text-sm font-medium">{new Date(survey.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => navigate(`/surveys/${survey.id}/results`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Eye size={16} />
                  View Results
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Copy size={16} className="text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 size={16} className="text-destructive" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}