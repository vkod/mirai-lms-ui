import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  History,
  Calendar,
  Upload,
  X,
  Send,
  Activity,
  Search,
  Trash2
} from 'lucide-react';
import { qaService } from '../services/qaService';
import type {
  QASession,
  SessionStatus,
  CreateSessionRequest,
  SSEEventData
} from '../types/qa.types';
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
  occupation?: string;
  annual_income?: string;
}

interface LocalQuestionSession extends QASession {
  targetPersonas: Persona[];
  imageUrl?: string;
}

export default function QAPage() {

  // Q&A states
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [questionSessions, setQuestionSessions] = useState<LocalQuestionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LocalQuestionSession | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [question, setQuestion] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const sseUnsubscribeRefs = useRef<Map<string, () => void>>(new Map());
  const historyPageSize = 10;

  useEffect(() => {
    fetchPersonas();
    loadSessions();

    return () => {
      sseUnsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      sseUnsubscribeRefs.current.clear();
    };
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await axios.get(getApiEndpoint(API_ENDPOINTS.GET_SYNTHETIC_PERSONAS));
      setPersonas(response.data);
    } catch (err) {
      console.error('Error fetching personas:', err);
      // Use mock data as fallback
      const mockData: Persona[] = Array.from({ length: 50 }, (_, i) => ({
        lead_id: `LEAD-${1000 + i}`,
        lead_classification: (['hot', 'warm', 'cold'] as const)[i % 3],
        persona_summary: `Professional individual interested in insurance products`,
        full_name: `Person ${i + 1}`,
        age: `${25 + (i % 40)}`,
        occupation: ['Engineer', 'Doctor', 'Business Owner', 'Teacher', 'Consultant'][i % 5],
        annual_income: `$${50 + (i * 2)}k`,
      }));
      setPersonas(mockData);
    }
  };

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    try {
      const response = await qaService.listSessions(
        undefined,
        { page: 1, page_size: 100, sort_by: 'created_at', sort_order: 'desc' }
      );

      const sessions: LocalQuestionSession[] = response.sessions.map(session => ({
        ...session,
        targetPersonas: personas.filter(p =>
          session.responses?.some(r => r.persona.lead_id === p.lead_id) || []
        ),
        imageUrl: session.image_url
      }));

      setQuestionSessions(sessions);

      // Subscribe to active sessions
      sessions.forEach(session => {
        if (session.status === 'pending' || session.status === 'in_progress') {
          subscribeToSessionUpdates(session.session_id);
        }
      });
    } catch (error) {
      console.error('Failed to load sessions:', error);
      const savedSessions = localStorage.getItem('questionSessions');
      if (savedSessions) {
        setQuestionSessions(JSON.parse(savedSessions));
      }
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const subscribeToSessionUpdates = (sessionId: string) => {
    const existingUnsubscribe = sseUnsubscribeRefs.current.get(sessionId);
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    const unsubscribe = qaService.subscribeToSession(
      sessionId,
      (data: SSEEventData) => {
        setQuestionSessions(prev => prev.map(session => {
          if (session.session_id === sessionId) {
            const updatedSession = { ...session };

            if (data.new_response) {
              const persona = personas.find(p => p.lead_id === data.new_response!.persona.lead_id);
              if (persona && !updatedSession.targetPersonas.some(p => p.lead_id === persona.lead_id)) {
                updatedSession.targetPersonas.push(persona);
              }
              updatedSession.responses = [...updatedSession.responses, data.new_response];
              updatedSession.total_responded = updatedSession.responses.length;
            }

            if (data.progress) {
              updatedSession.total_responded = data.progress.total_responded;
              updatedSession.status = 'in_progress';
            }

            if (data.summary) {
              updatedSession.summary = data.summary;
            }

            if (data.status) {
              updatedSession.status = data.status;
              if (data.status === 'completed') {
                updatedSession.completed_at = new Date().toISOString();
              }
            }

            return updatedSession;
          }
          return session;
        }));
      },
      (error) => {
        console.error(`SSE error for session ${sessionId}:`, error);
        setSessionError(`Lost connection to session ${sessionId}. Retrying...`);
        setTimeout(() => {
          subscribeToSessionUpdates(sessionId);
        }, 5000);
      },
      () => {
        sseUnsubscribeRefs.current.delete(sessionId);
      }
    );

    sseUnsubscribeRefs.current.set(sessionId, unsubscribe);
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (selectedPersonas.size === 0) {
      alert('Please select at least one persona');
      return;
    }

    setIsSubmitting(true);
    setSessionError(null);

    const selectedPersonasList = personas.filter(p => selectedPersonas.has(p.lead_id));

    try {
      const request: CreateSessionRequest = {
        question,
        prospect_ids: Array.from(selectedPersonas)
      };

      if (uploadedFile) {
        const imageData = await qaService.convertImageToBase64(uploadedFile);
        request.image_base64 = imageData.base64;
        request.image_mime_type = imageData.mimeType;
      }

      const response = await qaService.createSession(request);

      const newSession: LocalQuestionSession = {
        session_id: response.session_id,
        question,
        imageUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
        targetPersonas: selectedPersonasList,
        status: response.status,
        created_at: response.created_at,
        responses: [],
        total_expected: response.total_prospects,
        total_responded: 0
      };

      setQuestionSessions(prev => [newSession, ...prev]);
      subscribeToSessionUpdates(response.session_id);

      setShowQuestionModal(false);
      setQuestion('');
      setUploadedFile(null);
      setSelectedPersonas(new Set());
    } catch (error) {
      console.error('Failed to submit question:', error);
      setSessionError('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      await qaService.cancelSession(sessionId);
      setQuestionSessions(prev => prev.map(session => {
        if (session.session_id === sessionId) {
          return { ...session, status: 'failed' as SessionStatus };
        }
        return session;
      }));
      const unsubscribe = sseUnsubscribeRefs.current.get(sessionId);
      if (unsubscribe) {
        unsubscribe();
        sseUnsubscribeRefs.current.delete(sessionId);
      }
    } catch (error) {
      console.error('Failed to cancel session:', error);
      setSessionError('Failed to cancel session. Please try again.');
    }
  };

  const deleteSession = async (sessionId: string) => {
    setIsDeleting(true);
    try {
      await qaService.deleteSession(sessionId);
      setQuestionSessions(prev => prev.filter(session => session.session_id !== sessionId));
      const unsubscribe = sseUnsubscribeRefs.current.get(sessionId);
      if (unsubscribe) {
        unsubscribe();
        sseUnsubscribeRefs.current.delete(sessionId);
      }
      setShowDeleteConfirm(null);
      if (selectedSession?.session_id === sessionId) {
        setShowSessionDetail(false);
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setSessionError('Failed to delete session. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const viewSessionDetail = async (session: LocalQuestionSession) => {
    try {
      const details = await qaService.getSessionDetail(session.session_id);
      const updatedSession: LocalQuestionSession = {
        ...details,
        targetPersonas: session.targetPersonas,
        imageUrl: details.image_url
      };
      setSelectedSession(updatedSession);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
      setSelectedSession(session);
    }
    setShowSessionDetail(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
    } else {
      alert('Please upload an image file');
    }
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
      session.question.toLowerCase().includes(historySearchTerm.toLowerCase())
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

  const stats = {
    totalQASessions: questionSessions.length,
    activeQASessions: getActiveSessionsCount(),
    completedQASessions: getCompletedSessions().length,
    totalQAResponses: questionSessions.reduce((acc, s) => acc + s.total_responded, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Q&A Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions and gather insights from your virtual prospect twins
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFullHistory(true)}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <History size={18} />
            View History
          </button>
          <button
            onClick={() => setShowQuestionModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-lg"
          >
            <MessageSquare size={18} />
            Ask Question
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <MessageSquare className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalQASessions}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Sessions</span>
            <Activity className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.activeQASessions}</p>
          <p className="text-xs text-green-500 mt-1">In progress</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completed</span>
            <CheckCircle className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.completedQASessions}</p>
          <p className="text-xs text-muted-foreground mt-1">With insights</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Responses</span>
            <Users className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalQAResponses}</p>
          <p className="text-xs text-muted-foreground mt-1">From all sessions</p>
        </motion.div>
      </div>

      {/* Active Sessions */}
      {getActiveSessions().length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-blue-500 animate-pulse" />
            Active Sessions ({getActiveSessions().length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getActiveSessions().map((session) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 glass rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => viewSessionDetail(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {session.status === 'pending' && (
                        <Clock size={16} className="text-yellow-500" />
                      )}
                      {session.status === 'in_progress' && (
                        <div className="relative">
                          <AlertCircle size={16} className="text-blue-500 animate-pulse" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {session.status === 'pending' && 'Pending'}
                        {session.status === 'in_progress' && `In Progress (${session.total_responded}/${session.total_expected})`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">{session.question}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {session.total_expected} prospects
                      </span>
                      {session.status === 'in_progress' && (
                        <div className="flex items-center gap-1">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${(session.total_responded / session.total_expected) * 100}%` }}
                            />
                          </div>
                          <span>{Math.round((session.total_responded / session.total_expected) * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(session.session_id);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                      title="Delete session"
                    >
                      <Trash2 size={18} />
                    </button>
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed Sessions */}
      {getCompletedSessions().length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Recently Completed
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getCompletedSessions().slice(0, 6).map((session) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 glass rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => viewSessionDetail(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1 mb-2">{session.question}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {session.total_expected} prospects
                      </span>
                      <span>
                        {new Date(session.completed_at!).toLocaleDateString()}
                      </span>
                      <span className="text-green-600">
                        ✓ Completed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(session.session_id);
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                      title="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewSessionDetail(session);
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {questionSessions.length === 0 && (
        <div className="text-center py-12 glass rounded-lg border border-border">
          <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No Q&A sessions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Ask your first question to get insights from your prospects</p>
          <button
            onClick={() => setShowQuestionModal(true)}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Ask First Question
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
              className="bg-background glass border border-border rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Ask Your Prospects
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get insights from multiple personas simultaneously
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
                  <label className="block text-sm font-medium mb-2">Select Prospects</label>
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                    {personas.map((persona) => (
                      <label
                        key={persona.lead_id}
                        className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPersonas.has(persona.lead_id)}
                          onChange={(e) => {
                            const newSelection = new Set(selectedPersonas);
                            if (e.target.checked) {
                              newSelection.add(persona.lead_id);
                            } else {
                              newSelection.delete(persona.lead_id);
                            }
                            setSelectedPersonas(newSelection);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{persona.full_name || persona.lead_id}</span>
                        {persona.lead_classification && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            persona.lead_classification === 'hot' ? 'bg-red-100 text-red-700' :
                            persona.lead_classification === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {persona.lead_classification}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPersonas.size} prospect{selectedPersonas.size !== 1 ? 's' : ''} selected
                  </p>
                </div>

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
                    disabled={isSubmitting || !question.trim() || selectedPersonas.size === 0}
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
                      ? `${selectedSession.total_responded} responses received`
                      : selectedSession.status === 'in_progress'
                      ? `${selectedSession.total_responded} of ${selectedSession.total_expected} responses received`
                      : selectedSession.status === 'failed'
                      ? 'Session cancelled or failed'
                      : 'Waiting for responses...'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(selectedSession.session_id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                    title="Delete session"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowSessionDetail(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
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
                  <span>Asked: {new Date(selectedSession.created_at).toLocaleString()}</span>
                  {selectedSession.completed_at && (
                    <span>Completed: {new Date(selectedSession.completed_at).toLocaleString()}</span>
                  )}
                  {selectedSession.status === 'in_progress' && (
                    <button
                      onClick={() => cancelSession(selectedSession.session_id)}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <XCircle size={12} />
                      Cancel Session
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Section */}
              {selectedSession.summary && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={20} className="text-blue-500" />
                    <h3 className="font-semibold">Summary Analysis</h3>
                  </div>
                  <p className="text-sm whitespace-pre-line mb-3">
                    {typeof selectedSession.summary === 'string'
                      ? selectedSession.summary
                      : selectedSession.summary.summary_text}
                  </p>
                  {typeof selectedSession.summary !== 'string' && selectedSession.summary.key_insights && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Key Insights</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {selectedSession.summary.key_insights.map((insight, index) => (
                          <li key={index} className="text-muted-foreground">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Responses */}
              {selectedSession.responses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Individual Responses</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedSession.responses.map((item, index) => (
                      <motion.div
                        key={`${item.persona.lead_id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.persona.full_name || `Prospect ${item.persona.lead_id}`}</span>
                              {item.persona.lead_classification && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.persona.lead_classification === 'hot' ? 'bg-red-100 text-red-700' :
                                  item.persona.lead_classification === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {item.persona.lead_classification}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(item.answered_at).toLocaleTimeString()}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Waiting for {selectedSession.total_expected - selectedSession.total_responded} more responses...
                      </p>
                    </div>
                    <button
                      onClick={() => cancelSession(selectedSession.session_id)}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
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
                    placeholder="Search questions..."
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
                        key={session.session_id}
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
                                {session.total_expected} prospects
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.completed_at && (
                                  <>
                                    {Math.round(
                                      (new Date(session.completed_at).getTime() - new Date(session.created_at).getTime()) / 60000
                                    )} min to complete
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(session.session_id);
                              }}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                              title="Delete session"
                            >
                              <Trash2 size={18} />
                            </button>
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

      {/* Error Toast */}
      <AnimatePresence>
        {sessionError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md z-50"
          >
            <AlertCircle size={20} />
            <span className="text-sm">{sessionError}</span>
            <button
              onClick={() => setSessionError(null)}
              className="ml-2 hover:opacity-80"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background glass border border-border rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Q&A Session</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm mb-6">
                Are you sure you want to delete this Q&A session? All responses and insights will be permanently removed.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteSession(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Session
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}