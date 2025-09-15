import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowLeft, Activity, TrendingUp, DollarSign, RefreshCw, Clock, CheckCircle, MessageCircle, Database, ChevronDown, ChevronUp, User, FileJson } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import { getApiEndpoint } from '../config/api.config';
import AgentChat from '../components/AgentChat';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AgentInput {
  name: string;
  input_desc: string;
  input_type: string;
  sample_data?: string[];
}

interface AgentOutput {
  name: string;
  output_desc: string;
  output_type: 'markdown' | 'textarea' | 'image' | 'image_id' | 'label';
}

interface TestDataRow {
  id: string;
  personaSummary: string;
  data: string;
  persona: string;
}

interface Agent {
  name: string;
  version: string;
  goal: string;
  markdown?: string;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  metrics: Record<string, number>;
  endpoint_for_testing: string;
  testData?: TestDataRow[];
}

export default function AgentDetailsPage() {
  const { agentName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState<Agent | null>(location.state?.agent || null);
  const [loading, setLoading] = useState(!agent);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const generateTestData = (): TestDataRow[] => {
    return [
      {
        id: "TEST-001",
        personaSummary: "High-income professional seeking comprehensive insurance coverage",
        data: JSON.stringify({
          "website_behavior": {
            "pages_visited": ["life-insurance/premium", "investment-planning", "retirement-calculator"],
            "time_spent": "45 minutes",
            "downloads": ["Premium Life Insurance Guide PDF", "Investment Portfolio Checklist"]
          },
          "demographic_data": {
            "age": 45,
            "income": "$250,000",
            "occupation": "Senior Executive",
            "location": "New York, NY",
            "marital_status": "Married",
            "dependents": 2
          },
          "engagement_history": {
            "email_opens": 12,
            "link_clicks": 8,
            "form_submissions": 3,
            "calculator_usage": ["retirement", "life_coverage"]
          }
        }, null, 2),
        persona: JSON.stringify({
          "name": "Robert Chen",
          "profile": "Established professional focused on wealth preservation and family security",
          "insurance_needs": {
            "primary": "Premium life insurance with investment component",
            "secondary": ["Disability insurance", "Umbrella policy"],
            "coverage_amount": "$2,000,000"
          },
          "behavioral_traits": {
            "decision_making": "Research-driven, seeks expert advice",
            "communication_preference": "Email and scheduled calls",
            "buying_timeline": "2-3 months"
          },
          "recommendations": [
            "Schedule consultation with senior advisor",
            "Provide detailed comparison of premium products",
            "Include estate planning resources"
          ]
        }, null, 2)
      },
      {
        id: "TEST-002",
        personaSummary: "Young family prioritizing financial protection for dependents",
        data: JSON.stringify({
          "website_behavior": {
            "pages_visited": ["term-life-insurance", "child-education-planning", "mortgage-calculator"],
            "time_spent": "25 minutes",
            "downloads": ["Term Life Basics Guide"]
          },
          "demographic_data": {
            "age": 32,
            "income": "$85,000",
            "occupation": "Software Developer",
            "location": "Austin, TX",
            "marital_status": "Married",
            "dependents": 2,
            "recent_life_events": ["New mortgage", "Second child born"]
          },
          "engagement_history": {
            "email_opens": 8,
            "link_clicks": 5,
            "calculator_usage": ["term_life_coverage", "monthly_budget"]
          }
        }, null, 2),
        persona: JSON.stringify({
          "name": "Sarah Martinez",
          "profile": "Young parent seeking affordable protection for growing family",
          "insurance_needs": {
            "primary": "20-year term life insurance",
            "coverage_amount": "$750,000",
            "budget": "$50-75/month"
          },
          "behavioral_traits": {
            "decision_making": "Price-conscious, values simplicity",
            "communication_preference": "Text messages and online chat",
            "buying_timeline": "1-2 weeks"
          },
          "recommendations": [
            "Offer online instant quote tool",
            "Highlight affordable term options",
            "Provide family protection calculator"
          ]
        }, null, 2)
      },
      {
        id: "TEST-003",
        personaSummary: "Pre-retiree exploring retirement income and healthcare options",
        data: JSON.stringify({
          "website_behavior": {
            "pages_visited": ["medicare-supplements", "annuities", "retirement-income-planning"],
            "time_spent": "55 minutes",
            "downloads": ["Medicare Guide 2024", "Retirement Income Strategies"]
          },
          "demographic_data": {
            "age": 58,
            "income": "$120,000",
            "occupation": "HR Director",
            "location": "Phoenix, AZ",
            "retirement_timeline": "5 years",
            "401k_balance": "$450,000"
          }
        }, null, 2),
        persona: JSON.stringify({
          "name": "Michael Thompson",
          "profile": "Planning transition from employer coverage to retirement",
          "insurance_needs": {
            "primary": "Medicare supplement plans",
            "secondary": "Fixed annuity for guaranteed income",
            "long_term_care": "Considering hybrid LTC policy"
          },
          "recommendations": [
            "Schedule retirement planning consultation",
            "Provide Medicare timeline and options",
            "Discuss income gap analysis"
          ]
        }, null, 2)
      }
    ];
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!agent && agentName) {
      fetchAgentDetails();
    } else if (agent && !agent.testData) {
      // Add test data to existing agent if it doesn't have it
      setAgent({
        ...agent,
        testData: generateTestData()
      });
    }
  }, [agentName]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiEndpoint(`/agent/${agentName}`));
      // Add test data if not present in API response
      const agentData = response.data;
      if (!agentData.testData) {
        agentData.testData = generateTestData();
      }
      setAgent(agentData);
    } catch (err) {
      console.error('Error fetching agent details:', err);
      
      const mockAgent: Agent = {
        name: decodeURIComponent(agentName || ''),
        version: "1.0",
        goal: "Create an imaginary persona based on data provided and update the digital twin with data as much as possible.",
        markdown: `## Overview
This agent creates and maintains digital twins for personalization and targeting purposes.

### Key Features
- **Real-time Processing**: Processes user data in real-time to update digital twins
- **Multi-source Integration**: Combines data from website traffic, behavior patterns, and transaction history
- **Confidence Scoring**: Provides confidence metrics for each persona attribute

### How It Works
1. **Data Collection**: Gathers data from multiple sources
2. **Pattern Recognition**: Identifies behavioral patterns and preferences
3. **Twin Generation**: Creates or updates the digital twin profile
4. **Validation**: Applies confidence scoring to ensure accuracy

### Best Practices
- Ensure data quality before processing
- Review confidence scores for critical decisions
- Regular updates maintain twin accuracy

### API Usage
\`\`\`json
{
  "website_traffic": "user activity data",
  "existing_twin": "previous twin data if available",
  "user_behavior": "behavioral patterns",
  "transaction_history": "purchase history"
}
\`\`\`

### Performance Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Accuracy | > 90% | 92% |
| Processing Time | < 2s | 1.2s |
| Success Rate | > 95% | 97% |
`,
        inputs: [
          { name: "website_traffic", input_desc: "Website traffic data", input_type: "textarea" },
          { name: "existing_twin", input_desc: "Existing Digital twin if any", input_type: "textarea" },
          { name: "user_behavior", input_desc: "User behavior patterns", input_type: "textarea" },
          { name: "transaction_history", input_desc: "Transaction history", input_type: "textarea" }
        ],
        outputs: [
          { name: "digital_twin", output_desc: "Updated/New Digital twin", output_type: "markdown" },
          { name: "confidence_scores", output_desc: "Confidence scores", output_type: "textarea" },
          { name: "recommendations", output_desc: "Recommendations", output_type: "markdown" }
        ],
        metrics: {
          "Data processed": 100,
          "Digital twins created": 78,
          "Digital twins updated": 23,
          "Cost this month": 20000,
          "Accuracy rate": 92,
          "Processing time": 1.2
        },
        endpoint_for_testing: "/test_digital_twin_agent",
        testData: generateTestData()
      };
      setAgent(mockAgent);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Processed',
        data: [65, 59, 80, 81, 56, 55, 70],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
      {
        label: 'Created',
        data: [28, 48, 40, 19, 46, 27, 45],
        fill: true,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgb(168, 85, 247)',
        tension: 0.4,
      }
    ],
  };

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cost ($)',
        data: [12000, 19000, 15000, 18000, 22000, 20000],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  const formatMetricValue = (key: string, value: number) => {
    if (key.toLowerCase().includes('cost')) {
      return `$${value.toLocaleString()}`;
    }
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('accuracy')) {
      return `${value}%`;
    }
    if (key.toLowerCase().includes('time')) {
      return `${value}s`;
    }
    return value.toLocaleString();
  };

  const getMetricIcon = (key: string) => {
    if (key.toLowerCase().includes('cost')) return DollarSign;
    if (key.toLowerCase().includes('created')) return TrendingUp;
    if (key.toLowerCase().includes('updated')) return RefreshCw;
    if (key.toLowerCase().includes('time')) return Clock;
    if (key.toLowerCase().includes('accuracy')) return CheckCircle;
    return Activity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Agent not found</p>
        <button
          onClick={() => navigate('/agents')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/agents')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              <Bot className="text-blue-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <span className="text-muted-foreground">Version {agent.version}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <MessageCircle size={20} />
          <span>Test Agent</span>
        </button>
      </div>

      <div className="glass border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">Goal</h2>
        <div className="prose prose-invert max-w-none text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            components={{
              pre: ({ children }) => (
                <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto">{children}</pre>
              ),
              code: ({ children }) => (
                <code className="bg-background/50 px-1 py-0.5 rounded text-sm">{children}</code>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1">{children}</ol>
              ),
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
              p: ({ children }) => <p className="mb-3">{children}</p>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3">{children}</blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-sm font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-sm">{children}</td>
              )
            }}
          >
            {agent.goal}
          </ReactMarkdown>
        </div>
      </div>

      {agent.markdown && (
        <div className="glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Documentation</h2>
          <div className="prose prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                pre: ({ children }) => (
                  <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto">{children}</pre>
                ),
                code: ({ children }) => (
                  <code className="bg-background/50 px-1 py-0.5 rounded text-sm">{children}</code>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1">{children}</ol>
                ),
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-3">{children}</p>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3">{children}</blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left text-sm font-semibold">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-sm">{children}</td>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-blue-500 hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-4 border-border" />
              }}
            >
              {agent.markdown}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Inputs</h3>
          <div className="space-y-2">
            {agent.inputs.map((input, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">{input.input_desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Outputs</h3>
          <div className="space-y-3">
            {agent.outputs.map((output, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{output.output_desc}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                      {output.output_type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(agent.metrics).map(([key, value]) => {
            const Icon = getMetricIcon(key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{key}</span>
                </div>
                <p className="text-xl font-bold">{formatMetricValue(key, value)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Cost Trend</h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {agent.testData && agent.testData.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database className="text-blue-500" size={20} />
              <h2 className="text-lg font-semibold">Optimization Test Data</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Click on a row to expand and view full data
            </div>
          </div>
          
          <div className="space-y-2">
            {agent.testData.map((test, index) => (
              <div key={test.id} className="border border-border rounded-lg overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => toggleRowExpansion(test.id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="text-xs text-muted-foreground">Test ID</span>
                        <p className="font-mono text-sm">{test.id}</p>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs text-muted-foreground">Persona Summary</span>
                        <p className="text-sm line-clamp-1">{test.personaSummary}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedRows.has(test.id) ? (
                        <ChevronUp className="text-muted-foreground" size={20} />
                      ) : (
                        <ChevronDown className="text-muted-foreground" size={20} />
                      )}
                    </div>
                  </div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedRows.has(test.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-6 space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <FileJson className="text-blue-500" size={18} />
                            <h4 className="font-semibold text-sm">Input Data</h4>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                              {test.data}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <User className="text-purple-500" size={18} />
                            <h4 className="font-semibold text-sm">Generated Persona</h4>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                              {test.persona}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Showing {agent.testData.length} test scenarios
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Score:</span>
              <span className="text-lg font-bold text-green-500">98%</span>
            </div>
          </div>
        </div>
      )}

      <AgentChat
        agentId={agent.name}
        agentName={agent.name}
        agentInputs={agent.inputs}
        agentOutputs={agent.outputs}
        testEndpoint={agent.endpoint_for_testing}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}