import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, MapPin, DollarSign, 
  Shield, Heart, TrendingUp, MessageCircle, Phone, FileText,
  ChevronDown, X, Flame, Snowflake, Sun
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.config';
import RealtimeVoiceModal from '../components/RealtimeVoiceModal';

interface Persona {
  lead_id: string;
  lead_classification?: 'hot' | 'warm' | 'cold';
  persona_summary: string;
  profile_image_url?: string;
  full_name?: string;
  age?: string;
  marital_status?: string;
  dependents?: string;
  gender?: string;
  life_stages?: string;
  occupation?: string;
  education_level?: string;
  annual_income?: string;
  employment_information?: string;
  insurance_history?: string;
  behaioral_signals?: string;
  interaction_history?: string;
  next_best_actions?: string;
  markdown?: string;
}

export default function PersonaDetailsPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'markdown'>('overview');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, message: string}>>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchPersonaDetails();
    }
  }, [leadId]);

  const fetchPersonaDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiEndpoint(API_ENDPOINTS.GET_SYNTHETIC_PERSONA(leadId || '')));
      setPersona(response.data);
    } catch (err) {
      console.error('Error fetching persona details:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMarkdown = () => {
    if (!persona) return '';

    return persona.markdown || '';
  };

  const handleVirtualChat = () => {
    setShowChat(!showChat);
    if (!showChat && chatHistory.length === 0) {
      setChatHistory([
        { role: 'assistant', message: `Hello! I'm ${persona?.full_name || 'your digital twin'}. I'm interested in learning more about your insurance products.` }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !isSendingMessage) {
      const userMessage = chatMessage;
      setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
      setChatMessage('');
      setIsSendingMessage(true);
      
      try {
        const response = await axios.post(
          getApiEndpoint(API_ENDPOINTS.CHAT_WITH_PERSONA(persona?.lead_id || '')),
          { question: userMessage },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        const assistantResponse = response.data || "I understand. Could you tell me more about that?";
        setChatHistory(prev => [...prev, { role: 'assistant', message: assistantResponse }]);
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Fallback responses if API fails
        const fallbackResponses = [
          "That's interesting! Can you tell me more about the coverage?",
          "I'd like to understand the premium structure better.",
          "How does this compare to my current policy?",
          "What are the tax benefits?",
          "Can I customize the coverage based on my needs?"
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setChatHistory(prev => [...prev, { role: 'assistant', message: randomResponse }]);
      } finally {
        setIsSendingMessage(false);
      }
    }
  };

  const handleVirtualCall = () => {
    setShowVoiceCall(true);
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{persona.full_name || 'Unknown'}</h1>
            {persona.lead_classification && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                persona.lead_classification === 'hot' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : persona.lead_classification === 'warm'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {persona.lead_classification === 'hot' && <Flame size={14} />}
                {persona.lead_classification === 'warm' && <Sun size={14} />}
                {persona.lead_classification === 'cold' && <Snowflake size={14} />}
                {persona.lead_classification.charAt(0).toUpperCase() + persona.lead_classification.slice(1)} Lead
              </span>
            )}
          </div>
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
                src={getApiEndpoint(API_ENDPOINTS.PERSONA_IMAGE_MEDIUM(persona.lead_id))}
                alt={persona.full_name || 'Person'}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.full_name || 'Person')}&background=random&size=200`;
                }}
              />
            </div>
            
            <h2 className="text-xl font-semibold mb-1">{persona.full_name || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground mb-4">{persona.occupation || 'Unknown'}</p>
            
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
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 relative"
              >
                <Phone size={18} />
                Virtual Call
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-semibold">
                  BETA
                </span>
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
                        <p><span className="text-muted-foreground">Name:</span> {persona.full_name || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Age:</span> {persona.age || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Gender:</span> {persona.gender || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Occupation:</span> {persona.occupation || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Life Stage:</span> {persona.life_stages || 'Unknown'}</p>
                        {persona.lead_classification && (
                          <p className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lead Status:</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              persona.lead_classification === 'hot'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : persona.lead_classification === 'warm'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {persona.lead_classification === 'hot' && <Flame size={10} />}
                              {persona.lead_classification === 'warm' && <Sun size={10} />}
                              {persona.lead_classification === 'cold' && <Snowflake size={10} />}
                              {persona.lead_classification.charAt(0).toUpperCase() + persona.lead_classification.slice(1)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-purple-500" />
                        Demographic Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Education:</span> {persona.education_level || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Marital Status:</span> {persona.marital_status || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Dependents:</span> {persona.dependents || 'Unknown'}</p>
                        <p><span className="text-muted-foreground">Employment:</span> {persona.employment_information || 'Unknown'}</p>
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
                        <p><span className="text-muted-foreground">Annual Income:</span> {persona.annual_income || 'Unknown'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield size={18} className="text-orange-500" />
                        Insurance Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Insurance History:</span></p>
                        <p className="ml-4 text-xs">{persona.insurance_history || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {persona.behaioral_signals && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Heart size={18} className="text-red-500" />
                      Behavioral Signals
                    </h4>
                    <div className="text-sm">
                      <p>{persona.behaioral_signals}</p>
                    </div>
                  </div>
                )}

                {(persona.interaction_history || persona.next_best_actions) && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      Engagement & Opportunities
                    </h4>
                    <div className="space-y-2 text-sm">
                      {persona.interaction_history && (
                        <div>
                          <p className="text-muted-foreground mb-1">Interaction History:</p>
                          <p className="ml-4">{persona.interaction_history}</p>
                        </div>
                      )}
                      {persona.next_best_actions && (
                        <div>
                          <p className="text-muted-foreground mb-1">Next Best Actions:</p>
                          <p className="ml-4">{persona.next_best_actions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                    p: ({children}) => <p className="mb-2 text-foreground">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                    li: ({children}) => <li className="text-foreground">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                    code: ({children}) => <code className="bg-background/50 px-1 py-0.5 rounded text-sm">{children}</code>,
                    pre: ({children}) => <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3">{children}</blockquote>,
                    table: ({children}) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">{children}</table>
                      </div>
                    ),
                    th: ({children}) => <th className="px-3 py-2 text-left text-sm font-semibold">{children}</th>,
                    td: ({children}) => <td className="px-3 py-2 text-sm">{children}</td>,
                    a: ({children, href}) => (
                      <a href={href} className="text-blue-500 hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="my-4 border-border" />
                  }}
                >
                  {persona.markdown || generateMarkdown()}
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
                  src={getApiEndpoint(API_ENDPOINTS.PERSONA_IMAGE_THUMBNAIL(persona.lead_id))}
                  alt={persona.full_name || 'Person'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.full_name || 'Person')}&background=random`;
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-sm">{persona.full_name || 'Unknown'}</p>
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
            {isSendingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                disabled={isSendingMessage || !chatMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingMessage ? '...' : 'Send'}
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
              src={getApiEndpoint(API_ENDPOINTS.PERSONA_IMAGE(persona.lead_id))}
              alt={persona.full_name || 'Person'}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.full_name || 'Person')}&background=random&size=500`;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-white text-lg font-semibold">{persona.full_name || 'Unknown'}</h3>
              <p className="text-white/80 text-sm">{persona.lead_id}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Realtime Voice Call Modal */}
      <RealtimeVoiceModal
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        persona={persona}
      />
    </div>
  );
}