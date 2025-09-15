import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronRight, RefreshCw, Flame, Snowflake, Sun, MessageSquare, Upload, X, CheckSquare, Square, Users, Clock, CheckCircle, AlertCircle, Eye, Send, ChevronUp, History, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.config';

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

interface QuestionSession {
  id: string;
  question: string;
  imageUrl?: string;
  targetPersonas: Persona[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  responses: {
    persona: Persona;
    answer: string;
    answeredAt: Date;
  }[];
  summary?: string;
  totalExpected: number;
  totalResponded: number;
}

export default function PersonasPage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    ageGroup: '',
    incomeRange: '',
  });
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionSessions, setQuestionSessions] = useState<QuestionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<QuestionSession | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [showQuestionsDashboard, setShowQuestionsDashboard] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const pollIntervalRef = useRef<number | null>(null);
  const historyPageSize = 10;

  const itemsPerPage = 30;

  useEffect(() => {
    // Load saved question sessions from localStorage
    const savedSessions = localStorage.getItem('questionSessions');
    if (savedSessions) {
      setQuestionSessions(JSON.parse(savedSessions));
    }

    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Save question sessions to localStorage whenever they change
    localStorage.setItem('questionSessions', JSON.stringify(questionSessions));
  }, [questionSessions]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          getApiEndpoint(API_ENDPOINTS.GET_SYNTHETIC_PERSONAS),
          { signal: abortController.signal }
        );
        
        if (!abortController.signal.aborted) {
          setPersonas(response.data);
          setFilteredPersonas(response.data);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('Error fetching personas:', err);
          
          // Only set mock data if the request wasn't aborted
          if (!abortController.signal.aborted) {
            const mockData: Persona[] = Array.from({ length: 50 }, (_, i) => ({
              lead_id: `LEAD-${1000 + i}`,
              lead_classification: (['hot', 'warm', 'cold'] as const)[i % 3],
              persona_summary: `Professional ${['working', 'retired', 'self-employed'][i % 3]} individual interested in ${['life insurance', 'health insurance', 'investment plans'][i % 3]}`,
              full_name: `Person ${i + 1}`,
              age: `${25 + (i % 40)}`,
              gender: i % 2 === 0 ? 'Male' : 'Female',
              occupation: ['Engineer', 'Doctor', 'Business Owner', 'Teacher', 'Consultant'][i % 5],
              marital_status: ['Single', 'Married', 'Divorced'][i % 3],
              education_level: ['Bachelor', 'Master', 'PhD', 'High School'][i % 4],
              annual_income: `$${50 + (i * 2)}k`,
              profile_image_url: `https://ui-avatars.com/api/?name=Person+${i + 1}&background=random`,
            }));
            
            setPersonas(mockData);
            setFilteredPersonas(mockData);
          }
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchPersonas();
    
    // Cleanup function to abort the request if component unmounts
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, personas]);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiEndpoint(API_ENDPOINTS.GET_SYNTHETIC_PERSONAS));
      setPersonas(response.data);
      setFilteredPersonas(response.data);
    } catch (err) {
      console.error('Error fetching personas:', err);
      
      const mockData: Persona[] = Array.from({ length: 50 }, (_, i) => ({
        lead_id: `LEAD-${1000 + i}`,
        lead_classification: (['hot', 'warm', 'cold'] as const)[i % 3],
        persona_summary: `Professional ${['working', 'retired', 'self-employed'][i % 3]} individual interested in ${['life insurance', 'health insurance', 'investment plans'][i % 3]}`,
        full_name: `Person ${i + 1}`,
        age: `${25 + (i % 40)}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        occupation: ['Engineer', 'Doctor', 'Business Owner', 'Teacher', 'Consultant'][i % 5],
        marital_status: ['Single', 'Married', 'Divorced'][i % 3],
        education_level: ['Bachelor', 'Master', 'PhD', 'High School'][i % 4],
        annual_income: `$${50 + (i * 2)}k`,
        profile_image_url: `https://ui-avatars.com/api/?name=Person+${i + 1}&background=random`,
      }));
      
      setPersonas(mockData);
      setFilteredPersonas(mockData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...personas];

    if (searchTerm) {
      filtered = filtered.filter(persona =>
        persona.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.lead_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.persona_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.ageGroup) {
      filtered = filtered.filter(persona => {
        const age = parseInt(persona.age || '0');
        switch (filters.ageGroup) {
          case '25-35': return age >= 25 && age <= 35;
          case '36-50': return age >= 36 && age <= 50;
          case '51+': return age >= 51;
          default: return true;
        }
      });
    }

    if (filters.incomeRange) {
      filtered = filtered.filter(persona => {
        const incomeStr = persona.annual_income?.toLowerCase() || '';
        if (incomeStr.includes('unknown') || incomeStr === '') {
          return filters.incomeRange === '';
        }

        // Try to extract numeric value from income string
        const incomeMatch = incomeStr.match(/\d+/);
        const income = incomeMatch ? parseInt(incomeMatch[0]) * 1000 : 0;

        switch (filters.incomeRange) {
          case '<50k': return income < 50000;
          case '50k-100k': return income >= 50000 && income < 100000;
          case '100k-200k': return income >= 100000 && income < 200000;
          case '>200k': return income >= 200000;
          default: return true;
        }
      });
    }

    setFilteredPersonas(filtered);
    setCurrentPage(1);
  };

  const handlePersonaClick = (persona: Persona, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.checkbox-cell')) {
      return;
    }
    navigate(`/personas/${persona.lead_id}`, { state: { persona } });
  };

  const togglePersonaSelection = (leadId: string) => {
    const newSelection = new Set(selectedPersonas);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedPersonas(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedPersonas.size === paginatedPersonas.length) {
      setSelectedPersonas(new Set());
    } else {
      const allIds = new Set(paginatedPersonas.map(p => p.lead_id));
      setSelectedPersonas(allIds);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    setIsSubmitting(true);

    const selectedPersonasList = personas.filter(p => selectedPersonas.has(p.lead_id));

    // Create new question session
    const newSession: QuestionSession = {
      id: `QS-${Date.now()}`,
      question,
      imageUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
      targetPersonas: selectedPersonasList,
      status: 'pending',
      createdAt: new Date(),
      responses: [],
      totalExpected: selectedPersonasList.length,
      totalResponded: 0
    };

    // Add to sessions list
    setQuestionSessions(prev => [newSession, ...prev]);

    // Close modal and show success feedback
    setShowQuestionModal(false);
    setIsSubmitting(false);
    setQuestion('');
    setUploadedFile(null);
    setSelectedPersonas(new Set());

    // Show the questions dashboard
    setShowQuestionsDashboard(true);

    // Simulate async responses coming in
    simulateAsyncResponses(newSession.id, selectedPersonasList);
  };

  const simulateAsyncResponses = (sessionId: string, targetPersonas: Persona[]) => {
    let respondedCount = 0;
    const totalCount = targetPersonas.length;

    const responseInterval = window.setInterval(() => {
      if (respondedCount >= totalCount) {
        window.clearInterval(responseInterval);

        // Generate summary when all responses are in
        setQuestionSessions(prev => prev.map(session => {
          if (session.id === sessionId) {
            const hotLeadsCount = session.responses.filter(r =>
              r.persona.lead_classification === 'hot'
            ).length;

            return {
              ...session,
              status: 'completed',
              completedAt: new Date(),
              summary: `Based on responses from ${session.totalResponded} prospects:

• Most respondents emphasized the importance of personalized insurance solutions
• Common concerns include coverage adequacy and premium affordability
• ${Math.round(hotLeadsCount / session.totalResponded * 100)}% are actively seeking insurance solutions
• Key decision factors: financial security, family protection, and investment opportunities`
            };
          }
          return session;
        }));
        return;
      }

      // Add a new response
      const persona = targetPersonas[respondedCount];
      const response = {
        persona,
        answer: `As a ${persona.occupation || 'professional'} aged ${persona.age || 'N/A'}, my perspective on this is based on my ${persona.education_level || 'educational'} background and ${persona.marital_status || 'personal'} situation. Given my annual income of ${persona.annual_income || 'undisclosed'}, I believe that insurance planning should align with individual needs and circumstances. ${persona.persona_summary}`,
        answeredAt: new Date()
      };

      setQuestionSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: 'in_progress' as const,
            responses: [...session.responses, response],
            totalResponded: session.responses.length + 1
          };
        }
        return session;
      }));

      respondedCount++;
    }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds
  };

  const getActiveSessionsCount = () => {
    return questionSessions.filter(s => s.status === 'in_progress' || s.status === 'pending').length;
  };

  const getActiveSessions = () => {
    return questionSessions.filter(s => s.status === 'in_progress' || s.status === 'pending');
  };

  const getCompletedSessions = () => {
    return questionSessions.filter(s => s.status === 'completed');
  };

  const getFilteredHistorySessions = () => {
    const completed = getCompletedSessions();
    if (!historySearchTerm) return completed;

    return completed.filter(session =>
      session.question.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      session.targetPersonas.some(p =>
        p.full_name?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        p.lead_id.toLowerCase().includes(historySearchTerm.toLowerCase())
      )
    );
  };

  const getPaginatedHistorySessions = () => {
    const filtered = getFilteredHistorySessions();
    const startIndex = (historyPage - 1) * historyPageSize;
    const endIndex = startIndex + historyPageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalHistoryPages = () => {
    return Math.ceil(getFilteredHistorySessions().length / historyPageSize);
  };

  const viewSessionDetail = (session: QuestionSession) => {
    setSelectedSession(session);
    setShowSessionDetail(true);
  };

  const paginatedPersonas = filteredPersonas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);

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
            Prospect Digital Twins
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and explore digital twins of your insurance prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPersonas.size > 0 && (
            <button
              onClick={() => setShowQuestionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-lg"
            >
              <MessageSquare size={18} />
              Ask Question ({selectedPersonas.size} selected)
            </button>
          )}
          <button
            onClick={() => setShowQuestionsDashboard(!showQuestionsDashboard)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center gap-2 relative"
          >
            <Clock size={18} />
            Q&A History
            {getActiveSessionsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {getActiveSessionsCount()}
              </span>
            )}
          </button>
          <button
            onClick={fetchPersonas}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Questions Dashboard */}
      <AnimatePresence>
        {showQuestionsDashboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border border-border rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-500" />
                Q&A Activity Center
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullHistory(true)}
                  className="px-3 py-1 text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-1"
                >
                  <History size={16} />
                  View Full History
                </button>
                <button
                  onClick={() => setShowQuestionsDashboard(false)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <ChevronUp size={20} />
                </button>
              </div>
            </div>

            {questionSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No question sessions yet. Select prospects and ask them a question to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Sessions */}
                {getActiveSessions().length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <AlertCircle size={14} className="text-blue-500 animate-pulse" />
                      Active Sessions ({getActiveSessions().length})
                    </h4>
                    <div className="space-y-2">
                      {getActiveSessions().map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => viewSessionDetail(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {session.status === 'pending' && (
                            <Clock size={16} className="text-yellow-500" />
                          )}
                          {session.status === 'in_progress' && (
                            <div className="relative">
                              <AlertCircle size={16} className="text-blue-500 animate-pulse" />
                            </div>
                          )}
                          {session.status === 'completed' && (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                          <span className="text-sm font-medium">
                            {session.status === 'pending' && 'Pending'}
                            {session.status === 'in_progress' && `In Progress (${session.totalResponded}/${session.totalExpected})`}
                            {session.status === 'completed' && 'Completed'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2 mb-2">{session.question}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {session.totalExpected} prospects
                          </span>
                          {session.status === 'completed' && (
                            <span className="text-green-600 dark:text-green-400">
                              ✓ All responded
                            </span>
                          )}
                          {session.status === 'in_progress' && (
                            <div className="flex items-center gap-1">
                              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${(session.totalResponded / session.totalExpected) * 100}%` }}
                                />
                              </div>
                              <span>{Math.round((session.totalResponded / session.totalExpected) * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewSessionDetail(session);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Completed Sessions */}
                {getCompletedSessions().length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        Recently Completed
                      </h4>
                      {getCompletedSessions().length > 5 && (
                        <button
                          onClick={() => setShowFullHistory(true)}
                          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          View all {getCompletedSessions().length}
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {getCompletedSessions().slice(0, 5).map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => viewSessionDetail(session)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm line-clamp-1 mb-1">{session.question}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {session.totalExpected} prospects
                                </span>
                                <span>
                                  {new Date(session.completedAt!).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Eye size={16} className="text-muted-foreground hover:text-primary mt-0.5" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search by name, ID, occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg outline-none focus:bg-muted focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {filterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass border border-border rounded-lg p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age Group</label>
              <select
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Ages</option>
                <option value="25-35">25-35</option>
                <option value="36-50">36-50</option>
                <option value="51+">51+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Income Range</label>
              <select
                value={filters.incomeRange}
                onChange={(e) => setFilters({ ...filters, incomeRange: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Income</option>
                <option value="<50k">Under $50k</option>
                <option value="50k-100k">$50k - $100k</option>
                <option value="100k-200k">$100k - $200k</option>
                <option value=">200k">Over $200k</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {paginatedPersonas.length} of {filteredPersonas.length} personas
      </div>

      <div className="overflow-x-auto glass border border-border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-3 py-3 text-center">
                <button
                  onClick={toggleAllSelection}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {selectedPersonas.size === paginatedPersonas.length && paginatedPersonas.length > 0 ? (
                    <CheckSquare size={18} className="text-blue-500" />
                  ) : (
                    <Square size={18} className="text-muted-foreground" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Summary</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Classification</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Age</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Annual Income</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedPersonas.map((persona, index) => (
              <motion.tr
                key={persona.lead_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={(e) => handlePersonaClick(persona, e)}
              >
                <td className="px-3 py-3 text-center checkbox-cell">
                  <button
                    onClick={() => togglePersonaSelection(persona.lead_id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    {selectedPersonas.has(persona.lead_id) ? (
                      <CheckSquare size={18} className="text-blue-500" />
                    ) : (
                      <Square size={18} className="text-muted-foreground" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-md">
                  <span className="line-clamp-2" title={persona.persona_summary}>
                    {persona.persona_summary}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {persona.lead_classification && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      persona.lead_classification === 'hot'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : persona.lead_classification === 'warm'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {persona.lead_classification === 'hot' && <Flame size={10} />}
                      {persona.lead_classification === 'warm' && <Sun size={10} />}
                      {persona.lead_classification === 'cold' && <Snowflake size={10} />}
                      {persona.lead_classification}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                    {persona.age || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium">
                  {persona.annual_income || 'Unknown'}
                </td>
                <td className="px-4 py-3 text-center">
                  <ChevronRight className="inline-block text-muted-foreground hover:text-blue-500 transition-colors" size={18} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {paginatedPersonas.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No personas found matching your criteria
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background glass border border-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Ask Your Prospects
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPersonas.size} prospect{selectedPersonas.size > 1 ? 's' : ''} selected
                  </p>
                </div>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question for the selected prospects..."
                    className="w-full min-h-[120px] px-4 py-3 bg-muted/50 rounded-lg outline-none focus:bg-muted focus:ring-2 focus:ring-accent resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Attach Image (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <Upload size={18} />
                      {uploadedFile ? uploadedFile.name : 'Choose an image'}
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>✓ {uploadedFile.name}</span>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowQuestionModal(false)}
                    className="px-6 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuestion}
                    disabled={isSubmitting || !question.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Question
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {showSessionDetail && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSessionDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background glass border border-border rounded-xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Q&A Session Details
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSession.status === 'completed'
                      ? `${selectedSession.totalResponded} responses received`
                      : selectedSession.status === 'in_progress'
                      ? `${selectedSession.totalResponded} of ${selectedSession.totalExpected} responses received`
                      : 'Waiting for responses...'}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionDetail(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Question Section */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare size={18} className="text-purple-500" />
                  Question Asked
                </h3>
                <p className="text-sm mb-3">{selectedSession.question}</p>
                {selectedSession.imageUrl && (
                  <img
                    src={selectedSession.imageUrl}
                    alt="Attached image"
                    className="max-w-xs rounded-lg border border-border"
                  />
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Asked: {new Date(selectedSession.createdAt).toLocaleString()}</span>
                  {selectedSession.completedAt && (
                    <span>Completed: {new Date(selectedSession.completedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Target Prospects */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  Target Prospects ({selectedSession.targetPersonas.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.targetPersonas.map((persona) => (
                    <div
                      key={persona.lead_id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-xs"
                    >
                      <img
                        src={persona.profile_image_url || `https://ui-avatars.com/api/?name=${persona.full_name}&background=random`}
                        alt={persona.full_name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{persona.full_name || persona.lead_id}</span>
                      {selectedSession.responses.some(r => r.persona.lead_id === persona.lead_id) && (
                        <CheckCircle size={12} className="text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Section (if available) */}
              {selectedSession.summary && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={20} className="text-blue-500" />
                    <h3 className="font-semibold">Summary Analysis</h3>
                  </div>
                  <p className="text-sm whitespace-pre-line">{selectedSession.summary}</p>
                </div>
              )}

              {/* Individual Responses */}
              {selectedSession.responses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Individual Responses</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedSession.responses.map((item, index) => (
                      <motion.div
                        key={item.persona.lead_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.persona.profile_image_url || `https://ui-avatars.com/api/?name=${item.persona.full_name}&background=random`}
                            alt={item.persona.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.persona.full_name || `Prospect ${item.persona.lead_id}`}</span>
                              {item.persona.lead_classification && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  item.persona.lead_classification === 'hot'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : item.persona.lead_classification === 'warm'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {item.persona.lead_classification === 'hot' && <Flame size={10} />}
                                  {item.persona.lead_classification === 'warm' && <Sun size={10} />}
                                  {item.persona.lead_classification === 'cold' && <Snowflake size={10} />}
                                  {item.persona.lead_classification}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(item.answeredAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.status === 'in_progress' && (
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Waiting for {selectedSession.totalExpected - selectedSession.totalResponded} more responses...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSessionDetail(false)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full History Modal */}
      <AnimatePresence>
        {showFullHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background glass border border-border rounded-xl p-6 max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Q&A History
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getCompletedSessions().length} completed session{getCompletedSessions().length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowFullHistory(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search questions or prospects..."
                    value={historySearchTerm}
                    onChange={(e) => {
                      setHistorySearchTerm(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg outline-none focus:bg-muted focus:ring-2 focus:ring-accent"
                  />
                </div>
                <button className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
                  <Calendar size={18} />
                  Date Range
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto mb-4">
                {getPaginatedHistorySessions().length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {historySearchTerm ? 'No sessions found matching your search.' : 'No completed sessions yet.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getPaginatedHistorySessions().map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          viewSessionDetail(session);
                          setShowFullHistory(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">{session.question}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {session.totalExpected} prospects
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.completedAt && (
                                  <>
                                    {Math.round(
                                      (new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()) / 60000
                                    )} min to complete
                                  </>
                                )}
                              </span>
                            </div>
                            {/* Preview of prospect classifications */}
                            <div className="flex items-center gap-2 mt-2">
                              {['hot', 'warm', 'cold'].map(classification => {
                                const count = session.targetPersonas.filter(
                                  p => p.lead_classification === classification
                                ).length;
                                if (count === 0) return null;
                                return (
                                  <span
                                    key={classification}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      classification === 'hot'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : classification === 'warm'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}
                                  >
                                    {count} {classification}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewSessionDetail(session);
                              setShowFullHistory(false);
                            }}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {getTotalHistoryPages() > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    disabled={historyPage === 1}
                    className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {historyPage} of {getTotalHistoryPages()}
                  </span>
                  <button
                    onClick={() => setHistoryPage(Math.min(getTotalHistoryPages(), historyPage + 1))}
                    disabled={historyPage === getTotalHistoryPages()}
                    className="px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}