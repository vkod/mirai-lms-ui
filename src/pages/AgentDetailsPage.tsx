import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ArrowLeft, Activity, TrendingUp, DollarSign, RefreshCw, Clock, CheckCircle } from 'lucide-react';
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

interface Agent {
  name: string;
  version: string;
  goal: string;
  inputs: string[];
  outputs: string[];
  metrics: Record<string, number>;
}

export default function AgentDetailsPage() {
  const { agentName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState<Agent | null>(location.state?.agent || null);
  const [loading, setLoading] = useState(!agent);

  useEffect(() => {
    if (!agent && agentName) {
      fetchAgentDetails();
    }
  }, [agentName]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/agent/${agentName}`);
      setAgent(response.data);
    } catch (err) {
      console.error('Error fetching agent details:', err);
      
      const mockAgent: Agent = {
        name: decodeURIComponent(agentName || ''),
        version: "1.0",
        goal: "Create an imaginary persona based on data provided and update the digital twin with data as much as possible.",
        inputs: ["Website traffic data", "Existing Digital twin if any", "User behavior patterns", "Transaction history"],
        outputs: ["Updated/New Digital twin", "Confidence scores", "Recommendations"],
        metrics: {
          "Data processed": 100,
          "Digital twins created": 78,
          "Digital twins updated": 23,
          "Cost this month": 20000,
          "Accuracy rate": 92,
          "Processing time": 1.2
        }
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
      </div>

      <div className="glass border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-3">Goal</h2>
        <p className="text-muted-foreground">{agent.goal}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Inputs</h3>
          <div className="space-y-2">
            {agent.inputs.map((input, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">{input}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Outputs</h3>
          <div className="space-y-2">
            {agent.outputs.map((output, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm">{output}</span>
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
    </div>
  );
}