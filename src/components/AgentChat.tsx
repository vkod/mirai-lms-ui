import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader } from 'lucide-react';
import axios from 'axios';
import { getApiEndpoint } from '../config/api.config';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface AgentInput {
  name: string;
  input_desc: string;
  input_type: string;
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentInputs: AgentInput[];
  testEndpoint: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentChat({ agentName, agentInputs, testEndpoint, isOpen, onClose }: AgentChatProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValues({});
      setResponse('');
    }
  }, [isOpen]);

  const handleInputChange = (inputName: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [inputName]: value
    }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    const hasValues = Object.values(inputValues).some(val => val.trim());
    if (!hasValues) return;

    setIsLoading(true);
    setResponse('');

    try {
      // Create inputs dictionary with input names as keys
      const inputsDict: Record<string, string> = {};
      agentInputs.forEach((input) => {
        // Use the input.name as both the key for inputValues and the API payload
        if (input.name) {
          inputsDict[input.name] = inputValues[input.name] || '';
        }
      });

      console.log('Sending payload:', inputsDict); // Debug log

      // Send only the inputs dictionary directly, without agent_id
      const response = await axios.post(getApiEndpoint(testEndpoint), inputsDict);

      // Get the response and replace literal \n with actual newlines
      const responseText = response.data.response || response.data.answer || response.data.result || JSON.stringify(response.data, null, 2);
      const formattedResponse = typeof responseText === 'string' 
        ? responseText.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
        : responseText;
      setResponse(formattedResponse);
    } catch (error) {
      console.error('Error processing request:', error);
      setResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (input: AgentInput, index: number) => {
    // Always use the input.name as the key
    const fieldKey = input.name;
    const value = inputValues[fieldKey] || '';

    if (input.input_type === 'textarea') {
      return (
        <textarea
          key={`textarea-${fieldKey}-${index}`}
          value={value}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          placeholder={`Enter ${input.input_desc.toLowerCase()}`}
          className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
      );
    }

    return (
      <input
        key={`input-${fieldKey}-${index}`}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
        placeholder={`Enter ${input.input_desc.toLowerCase()}`}
        className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass border border-border rounded-xl w-full max-w-6xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                <Bot className="text-blue-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Test Agent: {agentName}</h3>
                <p className="text-xs text-muted-foreground">Test your agent with different inputs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
              <h4 className="font-semibold text-lg mb-4">Input Parameters</h4>
              <div className="space-y-4">
                {agentInputs.map((input, idx) => (
                  <div key={`input-container-${input.name || idx}`} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {input.input_desc}
                    </label>
                    {renderInputField(input, idx)}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !Object.values(inputValues).some(val => val.trim())}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Test Agent</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-1/2 p-6 overflow-y-auto">
              <h4 className="font-semibold text-lg mb-4">Agent Response</h4>
              <div className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader className="animate-spin mx-auto mb-4" size={32} />
                      <p className="text-muted-foreground">Processing your request...</p>
                    </div>
                  </div>
                ) : response ? (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="prose prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{
                          pre: ({ children }) => (
                            <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto">{children}</pre>
                          ),
                          code: ({ children }) => {
                            return (
                              <code className="bg-background/50 px-1 py-0.5 rounded text-sm">{children}</code>
                            );
                          },
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
                        {response}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Bot size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Agent response will appear here</p>
                      <p className="text-sm mt-2">Fill in the inputs and click "Test Agent" to see the response</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}