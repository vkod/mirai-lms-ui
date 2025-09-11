import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  Users,
  Clock,
  Star,
  ChartBar,
  PieChart,
  FileSpreadsheet,
  FileText,
  Share2,
  RefreshCw,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ResponseData {
  questionId: string;
  question: string;
  type: 'text' | 'single' | 'multiple' | 'rating' | 'image';
  responses: {
    value: string | number;
    count: number;
    percentage: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }[];
  averageRating?: number;
  insights?: string[];
}

const mockResponseData: ResponseData[] = [
  {
    questionId: '1',
    question: 'How satisfied are you with our AI-powered features?',
    type: 'rating',
    averageRating: 4.3,
    responses: [
      { value: 5, count: 892, percentage: 48.9 },
      { value: 4, count: 567, percentage: 31.1 },
      { value: 3, count: 234, percentage: 12.8 },
      { value: 2, count: 89, percentage: 4.9 },
      { value: 1, count: 41, percentage: 2.3 }
    ],
    insights: [
      '80% of users rated 4 or 5 stars',
      'Highest satisfaction among tech industry users',
      'Room for improvement with enterprise customers'
    ]
  },
  {
    questionId: '2',
    question: 'Which features do you use most frequently?',
    type: 'multiple',
    responses: [
      { value: 'AI Chatbot', count: 1456, percentage: 79.8 },
      { value: 'Analytics Dashboard', count: 1234, percentage: 67.7 },
      { value: 'Automated Reports', count: 987, percentage: 54.1 },
      { value: 'Lead Scoring', count: 876, percentage: 48.0 },
      { value: 'Email Automation', count: 654, percentage: 35.9 }
    ],
    insights: [
      'AI Chatbot is the most popular feature',
      'Strong adoption of analytics tools',
      'Email automation has growth potential'
    ]
  },
  {
    questionId: '3',
    question: 'What improvements would you like to see?',
    type: 'text',
    responses: [
      { value: 'Better mobile experience', count: 234, percentage: 25.6, sentiment: 'neutral' },
      { value: 'More integrations', count: 189, percentage: 20.7, sentiment: 'neutral' },
      { value: 'Faster performance', count: 156, percentage: 17.1, sentiment: 'negative' },
      { value: 'Advanced analytics', count: 134, percentage: 14.7, sentiment: 'positive' },
      { value: 'Lower pricing', count: 98, percentage: 10.7, sentiment: 'negative' }
    ],
    insights: [
      'Mobile optimization is top priority',
      'Users want broader ecosystem integration',
      'Performance improvements needed for enterprise scale'
    ]
  },
  {
    questionId: '4',
    question: 'Would you recommend our platform to others?',
    type: 'single',
    responses: [
      { value: 'Definitely', count: 987, percentage: 54.1 },
      { value: 'Probably', count: 543, percentage: 29.8 },
      { value: 'Not sure', count: 198, percentage: 10.9 },
      { value: 'Probably not', count: 67, percentage: 3.7 },
      { value: 'Definitely not', count: 28, percentage: 1.5 }
    ],
    insights: [
      'NPS score of 52 (Excellent)',
      '83.9% positive recommendation rate',
      'Strong word-of-mouth potential'
    ]
  }
];

export default function SurveyResultsPage() {
  const navigate = useNavigate();
  const { } = useParams();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'insights'>('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const surveyStats = {
    totalResponses: 1823,
    responseRate: 72.9,
    avgCompletionTime: '4.2 min',
    lastResponse: '2 hours ago',
    completionRate: 94.3,
    dropOffRate: 5.7
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'neutral': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp size={14} className="text-green-500" />;
      case 'negative': return <ThumbsDown size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/surveys')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Survey Results
            </h1>
            <p className="text-muted-foreground mt-1">
              Product Feedback Survey - Live Results
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Share2 size={20} />
            Share
          </motion.button>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <Download size={20} />
              Export
              <ChevronDown size={16} />
            </motion.button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 glass rounded-lg border border-border overflow-hidden z-10">
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-left">
                  <FileSpreadsheet size={16} />
                  Export as CSV
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-left">
                  <FileText size={16} />
                  Export as PDF
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-left">
                  <ChartBar size={16} />
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Responses</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{surveyStats.totalResponses.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">↑ 12% today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Response Rate</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold">{surveyStats.responseRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Target: 70%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Avg Time</span>
            <Clock size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{surveyStats.avgCompletionTime}</p>
          <p className="text-xs text-muted-foreground mt-1">Est: 5 min</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Completion</span>
            <ChartBar size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold">{surveyStats.completionRate}%</p>
          <p className="text-xs text-green-500 mt-1">↑ 3% vs avg</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Drop-off</span>
            <PieChart size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold">{surveyStats.dropOffRate}%</p>
          <p className="text-xs text-green-500 mt-1">↓ 2% vs avg</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Last Response</span>
            <Clock size={16} className="text-cyan-500" />
          </div>
          <p className="text-sm font-medium">{surveyStats.lastResponse}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </motion.div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setSelectedView('overview')}
          className={`px-4 py-2 relative transition-colors ${
            selectedView === 'overview' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
          {selectedView === 'overview' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
            />
          )}
        </button>
        <button
          onClick={() => setSelectedView('detailed')}
          className={`px-4 py-2 relative transition-colors ${
            selectedView === 'detailed' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Detailed Responses
          {selectedView === 'detailed' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
            />
          )}
        </button>
        <button
          onClick={() => setSelectedView('insights')}
          className={`px-4 py-2 relative transition-colors flex items-center gap-2 ${
            selectedView === 'insights' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Insights
          <Zap size={14} className="text-yellow-500" />
          {selectedView === 'insights' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
            />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockResponseData.map((question, index) => (
          <motion.div
            key={question.questionId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6 border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Q{index + 1}: {question.question}</h3>
                <p className="text-sm text-muted-foreground">
                  {question.responses.reduce((acc, r) => acc + r.count, 0)} responses
                </p>
              </div>
              <div className="flex items-center gap-2">
                {question.type === 'rating' && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{question.averageRating}</span>
                  </div>
                )}
              </div>
            </div>

            {question.type === 'rating' && (
              <div className="space-y-2">
                {question.responses.map((response) => (
                  <div key={response.value} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Number(response.value) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${response.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {response.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {(question.type === 'single' || question.type === 'multiple') && (
              <div className="space-y-2">
                {question.responses.map((response, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm flex-1 truncate">{response.value}</span>
                    <div className="w-32">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${response.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + idx * 0.05 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {response.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <div className="space-y-2">
                {question.responses.map((response, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(response.sentiment)}
                      <span className="text-sm">{response.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{response.count} mentions</span>
                      <span className={`text-xs font-medium ${getSentimentColor(response.sentiment)}`}>
                        {response.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question.insights && selectedView === 'overview' && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="text-sm font-medium">AI Insights</span>
                </div>
                <ul className="space-y-1">
                  {question.insights.map((insight, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {selectedView === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold">AI-Generated Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h3 className="font-medium text-green-500 mb-2">Strengths</h3>
              <ul className="space-y-1 text-sm">
                <li>• High user satisfaction with AI features (4.3/5)</li>
                <li>• Strong adoption of core features (&gt;70%)</li>
                <li>• Excellent NPS score of 52</li>
                <li>• Low drop-off rate indicates good survey design</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h3 className="font-medium text-yellow-500 mb-2">Opportunities</h3>
              <ul className="space-y-1 text-sm">
                <li>• Mobile experience needs improvement (26% mentions)</li>
                <li>• Integration ecosystem expansion requested</li>
                <li>• Email automation feature underutilized</li>
                <li>• Performance optimization for enterprise scale</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h3 className="font-medium text-blue-500 mb-2">Recommendations</h3>
              <ul className="space-y-1 text-sm">
                <li>• Prioritize mobile app development Q2 2024</li>
                <li>• Launch integration marketplace</li>
                <li>• Create email automation tutorials</li>
                <li>• Implement performance monitoring</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h3 className="font-medium text-purple-500 mb-2">Segment Analysis</h3>
              <ul className="space-y-1 text-sm">
                <li>• Tech industry: Highest satisfaction (4.6/5)</li>
                <li>• Enterprise: Focus on performance & security</li>
                <li>• SMBs: Price sensitivity, need simpler features</li>
                <li>• Startups: Want more integrations & automation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}