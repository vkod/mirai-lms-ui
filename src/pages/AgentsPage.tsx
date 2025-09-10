import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, Activity, DollarSign, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiEndpoint } from '../config/api.config';

interface AgentMetrics {
  "Data processed"?: number;
  "Digital twins created"?: number;
  "Digital twins updated"?: number;
  "Cost this month"?: number;
  [key: string]: number | undefined;
}

interface AgentInput {
  name: string;
  input_desc: string;
  input_type: string;
}

interface Agent {
  name: string;
  version: string;
  goal: string;
  inputs: AgentInput[];
  outputs: string[];
  metrics: AgentMetrics;
  endpoint_for_testing: string;
}

const metricIcons: Record<string, any> = {
  "Data processed": Activity,
  "Digital twins created": TrendingUp,
  "Digital twins updated": RefreshCw,
  "Cost this month": DollarSign,
};

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiEndpoint('/agent_list'));
      setAgents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to load agents. Please ensure the backend is running.');
      
      const mockData: Agent[] = [
        {
          name: "Digital Twin Agent",
          version: "1.0",
          goal: "Create an imaginary persona based on data provided and update the digital twin with data as much as possible.",
          inputs: [
            { name: "website_traffic", input_desc: "Website traffic data", input_type: "textarea" },
            { name: "existing_twin", input_desc: "Existing Digital twin if any", input_type: "textarea" }
          ],
          outputs: ["Updated/New Digital twin"],
          metrics: {
            "Data processed": 100,
            "Digital twins created": 78,
            "Digital twins updated": 23,
            "Cost this month": 20000
          },
          endpoint_for_testing: "/test_digital_twin_agent"
        },
        {
          name: "Lead Scoring Agent",
          version: "2.1",
          goal: "Analyze and score leads based on multiple factors to prioritize sales efforts.",
          inputs: [
            { name: "lead_info", input_desc: "Lead information", input_type: "textarea" },
            { name: "historical_data", input_desc: "Historical data", input_type: "textarea" },
            { name: "behavioral_signals", input_desc: "Behavioral signals", input_type: "textarea" }
          ],
          outputs: ["Lead score", "Recommendations"],
          metrics: {
            "Leads analyzed": 450,
            "High-value leads identified": 89,
            "Conversion rate": 23,
            "Cost this month": 15000
          },
          endpoint_for_testing: "/test_lead_scoring_agent"
        },
        {
          name: "Customer Engagement Agent",
          version: "1.5",
          goal: "Engage with customers through personalized communications and track interactions.",
          inputs: [
            { name: "customer_profile", input_desc: "Customer profile", input_type: "textarea" },
            { name: "interaction_history", input_desc: "Interaction history", input_type: "textarea" },
            { name: "preferences", input_desc: "Preferences", input_type: "textarea" }
          ],
          outputs: ["Engagement plan", "Communication logs"],
          metrics: {
            "Customers engaged": 320,
            "Messages sent": 1250,
            "Response rate": 67,
            "Cost this month": 8000
          },
          endpoint_for_testing: "/test_customer_engagement_agent"
        }
      ];
      setAgents(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agent: Agent) => {
    navigate(`/agents/${encodeURIComponent(agent.name)}`, { state: { agent } });
  };

  const formatMetricValue = (key: string, value: number) => {
    if (key.toLowerCase().includes('cost')) {
      return `$${value.toLocaleString()}`;
    }
    if (key.toLowerCase().includes('rate')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            AI Agent Dojo
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your AI agents
          </p>
        </div>
        <button
          onClick={fetchAgents}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleAgentClick(agent)}
            className="glass border border-border rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                  <Bot className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <span className="text-sm text-muted-foreground">v{agent.version}</span>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-blue-500 transition-colors" size={20} />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.goal}
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Inputs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.inputs.slice(0, 2).map((input, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded">
                      {input.input_desc}
                    </span>
                  ))}
                  {agent.inputs.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                      +{agent.inputs.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(agent.metrics).slice(0, 4).map(([key, value]) => {
                  const Icon = metricIcons[key] || Activity;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{key}</p>
                        <p className="text-sm font-semibold">
                          {value !== undefined ? formatMetricValue(key, value) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}