import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Image,
  FileText,
  Star,
  MessageSquare,
  CheckSquare,
  Circle,
  Square,
  Users,
  Target,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Upload,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type QuestionType = 'text' | 'single' | 'multiple' | 'rating' | 'image';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
  imageUrl?: string;
}

interface FilterCriteria {
  ageRange: [number, number];
  interests: string[];
  location: string[];
  industry: string[];
  jobTitle: string[];
  companySize: string[];
}

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<number>(0);
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    ageRange: [18, 65],
    interests: [],
    location: [],
    industry: [],
    jobTitle: [],
    companySize: []
  });

  const interestOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Entertainment', 'Sports', 'Travel', 'Food', 'Fashion'];
  const locationOptions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'];
  const industryOptions = ['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Government'];

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'single' || type === 'multiple' ? ['', ''] : undefined,
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, { options: [...question.options, ''] });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const getQuestionIcon = (type: QuestionType) => {
    switch (type) {
      case 'text': return <MessageSquare size={16} />;
      case 'single': return <Circle size={16} />;
      case 'multiple': return <CheckSquare size={16} />;
      case 'rating': return <Star size={16} />;
      case 'image': return <Image size={16} />;
    }
  };

  const getQuestionTypeName = (type: QuestionType) => {
    switch (type) {
      case 'text': return 'Text Answer';
      case 'single': return 'Single Choice';
      case 'multiple': return 'Multiple Choice';
      case 'rating': return 'Rating';
      case 'image': return 'Image Feedback';
    }
  };

  const calculateAudience = () => {
    let baseAudience = 10000;
    
    if (filters.ageRange[0] > 18 || filters.ageRange[1] < 65) {
      baseAudience *= 0.7;
    }
    if (filters.interests.length > 0) {
      baseAudience *= (0.8 - filters.interests.length * 0.05);
    }
    if (filters.location.length > 0) {
      baseAudience *= (0.9 - filters.location.length * 0.1);
    }
    if (filters.industry.length > 0) {
      baseAudience *= (0.85 - filters.industry.length * 0.05);
    }
    
    setSelectedAudience(Math.floor(baseAudience));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
              Create New Survey
            </h1>
            <p className="text-muted-foreground mt-1">
              Design your survey and select your target audience
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Save size={20} />
            Save Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <Send size={20} />
            Launch Survey
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-border"
          >
            <h2 className="text-lg font-semibold mb-4">Survey Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Survey Title</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="Enter survey title..."
                  className="w-full px-4 py-2 rounded-lg bg-muted/50 outline-none transition-all focus:bg-muted focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  placeholder="Describe your survey purpose..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-muted/50 outline-none transition-all focus:bg-muted focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted/50 outline-none transition-all focus:bg-muted focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Time</label>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-sm">{Math.max(1, questions.length * 0.5).toFixed(1)} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Survey Questions</h2>
              <span className="text-sm text-muted-foreground">{questions.length} questions</span>
            </div>

            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-4 p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-1 cursor-move">
                      <GripVertical size={16} className="text-muted-foreground" />
                    </button>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs">
                          {getQuestionIcon(question.type)}
                          {getQuestionTypeName(question.type)}
                        </span>
                        <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                      </div>
                      
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                        placeholder="Enter your question..."
                        className="w-full px-3 py-2 rounded-lg bg-background/50 outline-none transition-all focus:bg-background focus:ring-2 focus:ring-accent"
                      />

                      {question.type === 'image' && (
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <Upload size={16} />
                            Upload Image
                          </button>
                          <span className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</span>
                        </div>
                      )}

                      {(question.type === 'single' || question.type === 'multiple') && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              {question.type === 'single' ? <Circle size={16} className="text-muted-foreground" /> : <Square size={16} className="text-muted-foreground" />}
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-background/50 outline-none transition-all focus:bg-background focus:ring-2 focus:ring-accent text-sm"
                              />
                              {question.options && question.options.length > 2 && (
                                <button
                                  onClick={() => deleteOption(question.id, optIndex)}
                                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                                >
                                  <X size={14} className="text-destructive" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(question.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
                          >
                            <Plus size={14} />
                            Add Option
                          </button>
                        </div>
                      )}

                      {question.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={24} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => addQuestion('text')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <MessageSquare size={16} />
                Text
              </button>
              <button
                onClick={() => addQuestion('single')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Circle size={16} />
                Single Choice
              </button>
              <button
                onClick={() => addQuestion('multiple')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <CheckSquare size={16} />
                Multiple Choice
              </button>
              <button
                onClick={() => addQuestion('rating')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Star size={16} />
                Rating
              </button>
              <button
                onClick={() => addQuestion('image')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Image size={16} />
                Image Feedback
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Target Audience</h2>
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  calculateAudience();
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-accent/20">
                <div>
                  <p className="text-2xl font-bold">{selectedAudience.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Lead twins selected</p>
                </div>
                <Target className="text-accent" size={24} />
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Age Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={filters.ageRange[0]}
                          onChange={(e) => setFilters({ ...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]] })}
                          className="w-20 px-2 py-1 rounded bg-muted/50 text-center"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          value={filters.ageRange[1]}
                          onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
                          className="w-20 px-2 py-1 rounded bg-muted/50 text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {interestOptions.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => {
                              const newInterests = filters.interests.includes(interest)
                                ? filters.interests.filter(i => i !== interest)
                                : [...filters.interests, interest];
                              setFilters({ ...filters, interests: newInterests });
                            }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              filters.interests.includes(interest)
                                ? 'bg-accent text-white'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <div className="flex flex-wrap gap-2">
                        {locationOptions.map((location) => (
                          <button
                            key={location}
                            onClick={() => {
                              const newLocations = filters.location.includes(location)
                                ? filters.location.filter(l => l !== location)
                                : [...filters.location, location];
                              setFilters({ ...filters, location: newLocations });
                            }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              filters.location.includes(location)
                                ? 'bg-accent text-white'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <div className="flex flex-wrap gap-2">
                        {industryOptions.map((industry) => (
                          <button
                            key={industry}
                            onClick={() => {
                              const newIndustries = filters.industry.includes(industry)
                                ? filters.industry.filter(i => i !== industry)
                                : [...filters.industry, industry];
                              setFilters({ ...filters, industry: newIndustries });
                            }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              filters.industry.includes(industry)
                                ? 'bg-accent text-white'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={calculateAudience}
                      className="w-full py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 border border-border"
          >
            <h2 className="text-lg font-semibold mb-4">Survey Preview</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-muted-foreground" />
                <span>{questions.length} Questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>~{Math.max(1, questions.length * 0.5).toFixed(1)} min to complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-muted-foreground" />
                <span>{selectedAudience.toLocaleString()} Recipients</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{endDate ? `Ends ${new Date(endDate).toLocaleDateString()}` : 'No end date set'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}