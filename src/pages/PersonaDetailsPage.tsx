import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, MapPin, Briefcase, DollarSign, Calendar, 
  Shield, Heart, TrendingUp, MessageCircle, Phone, FileText,
  ChevronDown, ChevronUp, X
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Persona {
  lead_id: string;
  persona_summary: string;
  personal_info: {
    name: string;
    age: number;
    gender: string;
    occupation: string;
    email?: string;
    phone?: string;
  };
  demographic_info: {
    location: string;
    education: string;
    marital_status: string;
    dependents?: number;
  };
  financial_info: {
    annual_income: number;
    savings: number;
    investments: string;
    credit_score?: number;
  };
  insurance_history: {
    current_policies: string[];
    claims_history: string[];
    premium_paid?: number;
  };
  behavioral_signals?: {
    online_activity: string;
    purchase_behavior: string;
    communication_preference: string;
  };
  engagement_opportunities?: {
    best_time_to_contact: string;
    preferred_products: string[];
    risk_tolerance: string;
  };
  photo_url?: string;
}

export default function PersonaDetailsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [persona, setPersona] = useState<Persona | null>(location.state?.persona || null);
  const [loading, setLoading] = useState(!persona);
  const [activeTab, setActiveTab] = useState<'overview' | 'markdown'>('overview');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, message: string}>>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (!persona && leadId) {
      fetchPersonaDetails();
    }
  }, [leadId]);

  const fetchPersonaDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/get_synthetic_persona/${leadId}`);
      setPersona(response.data);
    } catch (err) {
      console.error('Error fetching persona details:', err);
      
      const mockPersona: Persona = {
        lead_id: leadId || 'LEAD-1001',
        persona_summary: "Tech-savvy professional with a growing family, interested in comprehensive life insurance coverage and investment opportunities. Shows high engagement with digital channels and prefers self-service options.",
        personal_info: {
          name: 'John Smith',
          age: 35,
          gender: 'Male',
          occupation: 'Software Engineer',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567'
        },
        demographic_info: {
          location: 'San Francisco, CA',
          education: "Master's Degree",
          marital_status: 'Married',
          dependents: 2
        },
        financial_info: {
          annual_income: 150000,
          savings: 75000,
          investments: 'Stocks, 401k, Real Estate',
          credit_score: 780
        },
        insurance_history: {
          current_policies: ['Term Life - $500k', 'Health Insurance - Family Plan'],
          claims_history: ['Minor health claim - 2022 ($1,200)'],
          premium_paid: 3600
        },
        behavioral_signals: {
          online_activity: 'High - Daily website visits, mobile app user',
          purchase_behavior: 'Research-driven, compares multiple options',
          communication_preference: 'Email and mobile app notifications'
        },
        engagement_opportunities: {
          best_time_to_contact: 'Evenings (6-8 PM) and weekends',
          preferred_products: ['Whole Life Insurance', 'Investment-linked Plans', 'Child Education Plans'],
          risk_tolerance: 'Moderate - Balanced portfolio approach'
        },
        photo_url: `https://ui-avatars.com/api/?name=John+Smith&background=random&size=200`
      };
      setPersona(mockPersona);
    } finally {
      setLoading(false);
    }
  };

  const generateMarkdown = () => {
    if (!persona) return '';
    
    return `# Lead Profile: ${persona.lead_id}

## Persona Summary
${persona.persona_summary}

## Personal Information
- **Name:** ${persona.personal_info?.name || 'N/A'}
- **Age:** ${persona.personal_info?.age || 'N/A'}
- **Gender:** ${persona.personal_info?.gender || 'N/A'}
- **Occupation:** ${persona.personal_info?.occupation || 'N/A'}
${persona.personal_info?.email ? `- **Email:** ${persona.personal_info.email}` : ''}
${persona.personal_info?.phone ? `- **Phone:** ${persona.personal_info.phone}` : ''}

## Demographic Information
- **Location:** ${persona.demographic_info?.location || 'N/A'}
- **Education:** ${persona.demographic_info?.education || 'N/A'}
- **Marital Status:** ${persona.demographic_info?.marital_status || 'N/A'}
${persona.demographic_info?.dependents ? `- **Dependents:** ${persona.demographic_info.dependents}` : ''}

## Financial Information
- **Annual Income:** $${persona.financial_info?.annual_income?.toLocaleString() || '0'}
- **Savings:** $${persona.financial_info?.savings?.toLocaleString() || '0'}
- **Investments:** ${persona.financial_info?.investments || 'N/A'}
${persona.financial_info?.credit_score ? `- **Credit Score:** ${persona.financial_info.credit_score}` : ''}

## Insurance History
### Current Policies
${(persona.insurance_history?.current_policies || []).map(p => `- ${p}`).join('\n') || '- None'}

### Claims History
${(persona.insurance_history?.claims_history || []).length > 0 
  ? (persona.insurance_history?.claims_history || []).map(c => `- ${c}`).join('\n')
  : '- No claims'}

${persona.behavioral_signals ? `
## Behavioral Signals & Preferences
- **Online Activity:** ${persona.behavioral_signals.online_activity}
- **Purchase Behavior:** ${persona.behavioral_signals.purchase_behavior}
- **Communication Preference:** ${persona.behavioral_signals.communication_preference}
` : ''}

${persona.engagement_opportunities ? `
## Engagement & Opportunities
- **Best Time to Contact:** ${persona.engagement_opportunities.best_time_to_contact}
- **Risk Tolerance:** ${persona.engagement_opportunities.risk_tolerance}
### Preferred Products
${persona.engagement_opportunities.preferred_products.map(p => `- ${p}`).join('\n')}
` : ''}`;
  };

  const handleVirtualChat = () => {
    setShowChat(!showChat);
    if (!showChat && chatHistory.length === 0) {
      setChatHistory([
        { role: 'assistant', message: `Hello! I'm ${persona?.personal_info?.name || 'your digital twin'}. I'm interested in learning more about your insurance products.` }
      ]);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { role: 'user', message: chatMessage }]);
      
      setTimeout(() => {
        const responses = [
          "That's interesting! Can you tell me more about the coverage?",
          "I'd like to understand the premium structure better.",
          "How does this compare to my current policy?",
          "What are the tax benefits?",
          "Can I customize the coverage based on my needs?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatHistory(prev => [...prev, { role: 'assistant', message: randomResponse }]);
      }, 1000);
      
      setChatMessage('');
    }
  };

  const handleVirtualCall = () => {
    alert('Virtual call feature coming soon! This will simulate a voice conversation with the persona.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Persona not found</p>
        <button
          onClick={() => navigate('/personas')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Personas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/personas')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{persona.personal_info?.name || 'Unknown'}</h1>
          <span className="text-muted-foreground">{persona.lead_id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="glass border border-border rounded-xl p-6 text-center">
            <div 
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowImageModal(true)}
            >
              <img 
                src={`http://localhost:8000/persona_image_medium/${persona.lead_id}`} 
                alt={persona.personal_info?.name || 'Person'}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = persona.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.personal_info?.name || 'Person')}&background=random&size=200`;
                }}
              />
            </div>
            
            <h2 className="text-xl font-semibold mb-1">{persona.personal_info?.name || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground mb-4">{persona.personal_info?.occupation || 'N/A'}</p>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={handleVirtualChat}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Virtual Chat
              </button>
              <button
                onClick={handleVirtualCall}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Virtual Call
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="glass border border-border rounded-xl p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'markdown' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <FileText size={18} />
                Markdown View
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Persona Summary</h3>
                  <p className="text-muted-foreground">{persona.persona_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        Personal Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Age:</span> {persona.personal_info?.age || 'N/A'}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {persona.personal_info?.gender || 'N/A'}</p>
                        <p><span className="text-muted-foreground">Occupation:</span> {persona.personal_info?.occupation || 'N/A'}</p>
                        {persona.personal_info?.email && (
                          <p><span className="text-muted-foreground">Email:</span> {persona.personal_info.email}</p>
                        )}
                        {persona.personal_info?.phone && (
                          <p><span className="text-muted-foreground">Phone:</span> {persona.personal_info.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-purple-500" />
                        Demographic Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Location:</span> {persona.demographic_info?.location || 'N/A'}</p>
                        <p><span className="text-muted-foreground">Education:</span> {persona.demographic_info?.education || 'N/A'}</p>
                        <p><span className="text-muted-foreground">Marital Status:</span> {persona.demographic_info?.marital_status || 'N/A'}</p>
                        {persona.demographic_info?.dependents !== undefined && (
                          <p><span className="text-muted-foreground">Dependents:</span> {persona.demographic_info.dependents}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-500" />
                        Financial Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Annual Income:</span> ${persona.financial_info?.annual_income?.toLocaleString() || '0'}</p>
                        <p><span className="text-muted-foreground">Savings:</span> ${persona.financial_info?.savings?.toLocaleString() || '0'}</p>
                        <p><span className="text-muted-foreground">Investments:</span> {persona.financial_info?.investments || 'N/A'}</p>
                        {persona.financial_info?.credit_score && (
                          <p><span className="text-muted-foreground">Credit Score:</span> {persona.financial_info.credit_score}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield size={18} className="text-orange-500" />
                        Insurance History
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Current Policies:</p>
                          {(persona.insurance_history?.current_policies || []).map((policy, idx) => (
                            <p key={idx} className="ml-4">• {policy}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Claims History:</p>
                          {(persona.insurance_history?.claims_history || []).length > 0 ? (
                            (persona.insurance_history?.claims_history || []).map((claim, idx) => (
                              <p key={idx} className="ml-4">• {claim}</p>
                            ))
                          ) : (
                            <p className="ml-4">• No claims</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {persona.behavioral_signals && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Heart size={18} className="text-red-500" />
                      Behavioral Signals & Preferences
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Online Activity:</p>
                        <p>{persona.behavioral_signals?.online_activity || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchase Behavior:</p>
                        <p>{persona.behavioral_signals?.purchase_behavior || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Communication:</p>
                        <p>{persona.behavioral_signals?.communication_preference || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {persona.engagement_opportunities && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      Engagement & Opportunities
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Best Time to Contact:</span> {persona.engagement_opportunities?.best_time_to_contact || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Risk Tolerance:</span> {persona.engagement_opportunities?.risk_tolerance || 'N/A'}</p>
                      <div>
                        <p className="text-muted-foreground mb-1">Preferred Products:</p>
                        {(persona.engagement_opportunities?.preferred_products || []).map((product, idx) => (
                          <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                    p: ({children}) => <p className="mb-2 text-foreground">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                    li: ({children}) => <li className="text-foreground">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                  }}
                >
                  {generateMarkdown()}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 w-96 glass border border-border rounded-xl shadow-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <img 
                  src={`http://localhost:8000/persona_image_thumbnail/${persona.lead_id}`} 
                  alt={persona.personal_info?.name || 'Person'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = persona.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.personal_info?.name || 'Person')}&background=random`;
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-sm">{persona.personal_info?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">Virtual Chat</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-muted'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showImageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={`http://localhost:8000/persona_image/${persona.lead_id}`}
              alt={persona.personal_info?.name || 'Person'}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = persona.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.personal_info?.name || 'Person')}&background=random&size=500`;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-white text-lg font-semibold">{persona.personal_info?.name || 'Unknown'}</h3>
              <p className="text-white/80 text-sm">{persona.lead_id}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}