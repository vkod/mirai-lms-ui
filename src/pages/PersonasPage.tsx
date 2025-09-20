import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, RefreshCw, Flame, Snowflake, Sun } from 'lucide-react';
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
    classification: ''
  });

  const itemsPerPage = 30;

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPersonasData = async () => {
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

    fetchPersonasData();

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

    if (filters.classification) {
      filtered = filtered.filter(persona => persona.lead_classification === filters.classification);
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

  const handlePersonaClick = (persona: Persona) => {
    navigate(`/personas/${persona.lead_id}`, { state: { persona } });
  };

  const paginatedPersonas = filteredPersonas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage);

  const getClassificationStats = () => {
    const hot = personas.filter(p => p.lead_classification === 'hot').length;
    const warm = personas.filter(p => p.lead_classification === 'warm').length;
    const cold = personas.filter(p => p.lead_classification === 'cold').length;
    return { hot, warm, cold };
  };

  const stats = getClassificationStats();

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
            Lead Digital Twins
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore and interact with digital twins of your insurance leads
          </p>
        </div>
        <button
          onClick={fetchPersonas}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Hot Leads</span>
            <Flame className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.hot}</p>
          <p className="text-xs text-red-500 mt-1">High priority prospects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Warm Leads</span>
            <Sun className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.warm}</p>
          <p className="text-xs text-yellow-500 mt-1">Engaged prospects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Cold Leads</span>
            <Snowflake className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.cold}</p>
          <p className="text-xs text-blue-500 mt-1">Need nurturing</p>
        </motion.div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Classification</label>
              <select
                value={filters.classification}
                onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Classifications</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
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
              <th className="px-4 py-3 text-left text-sm font-semibold">Persona</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Summary</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Classification</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Age</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Occupation</th>
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
                onClick={() => handlePersonaClick(persona)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getApiEndpoint(API_ENDPOINTS.PERSONA_IMAGE_THUMBNAIL(persona.lead_id))}
                      alt={persona.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.full_name || persona.lead_id)}&background=random`;
                      }}
                    />
                    <div>
                      <p className="font-medium">{persona.full_name || persona.lead_id}</p>
                      <p className="text-xs text-muted-foreground">{persona.lead_id}</p>
                    </div>
                  </div>
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
                <td className="px-4 py-3 text-center text-sm">
                  {persona.occupation || 'Unknown'}
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
    </div>
  );
}