import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader, DollarSign, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { getApiEndpoint } from '../config/api.config';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface AgentInput {
  name: string;
  input_desc: string;
  input_type: string;
}

interface AgentOutput {
  name: string;
  output_desc: string;
  output_type: 'markdown' | 'textarea' | 'image' | 'image_id' | 'label';
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentInputs: AgentInput[];
  agentOutputs?: AgentOutput[];
  testEndpoint: string;
  isOpen: boolean;
  onClose: () => void;
}

// Component to handle image output with API call
function ImageOutput({ value, outputDesc, isImageId = false }: { value: string; outputDesc: string; isImageId?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ImageOutput received value:', value, 'isImageId:', isImageId); // Debug log
    if (value) {
      // Check if value is already a URL and not an image ID
      if (!isImageId && typeof value === 'string' && value.startsWith('http')) {
        console.log('Value is already a URL:', value); // Debug log
        setImageUrl(value);
      } else {
        // Make API call to get the image (either it's an ID or isImageId is true)
        console.log('Fetching image from API for:', value); // Debug log
        setIsLoadingImage(true);
        setImageError(null);
        
        const imageEndpoint = `/persona_image/${value}`;
        console.log('Image API endpoint:', getApiEndpoint(imageEndpoint)); // Debug log
        
        axios.get(getApiEndpoint(imageEndpoint), { responseType: 'blob' })
          .then(response => {
            const url = URL.createObjectURL(response.data);
            setImageUrl(url);
          })
          .catch(error => {
            console.error('Error fetching image:', error);
            setImageError('Failed to load image');
          })
          .finally(() => {
            setIsLoadingImage(false);
          });
      }
    }
  }, [value]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (isLoadingImage) {
    return (
      <div className="mt-2 flex items-center justify-center p-8 bg-background/30 rounded-lg">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="mt-2 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <ImageIcon size={20} className="text-red-500" />
        <span className="text-sm text-red-500">{imageError}</span>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="mt-2">
        <img 
          src={imageUrl} 
          alt={outputDesc}
          className="max-w-full rounded-lg"
          onError={() => setImageError('Failed to display image')}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 p-3 bg-background/30 rounded-lg">
      <ImageIcon size={20} className="text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

export default function AgentChat({ agentName, agentInputs, agentOutputs, testEndpoint, isOpen, onClose }: AgentChatProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [executionCost, setExecutionCost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValues({});
      setResponse(null);
      setExecutionCost(null);
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
    setResponse(null);
    setExecutionCost(null);

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

      console.log('API Response:', response.data); // Debug log
      console.log('Agent Outputs Config:', agentOutputs); // Debug log

      // Extract execution cost if present
      if (response.data.execution_cost !== undefined) {
        setExecutionCost(response.data.execution_cost);
      }
      
      // Handle structured response - the API is returning an object with multiple fields
      // This includes cases like {"generated_image": "uuid", "execution_cost": 0.0005}
      setResponse(response.data);
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
                  <div className="space-y-4">
                    {/* Render response based on output type */}
                    {typeof response === 'string' ? (
                      // Simple string response (backward compatibility)
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
                      // Structured response with multiple outputs
                      <div className="space-y-4">
                        {Object.entries(response).map(([key, value]) => {
                          if (key === 'execution_cost') return null; // Handle separately
                          
                          // Find the output config from the array by matching the name
                          const outputConfig = agentOutputs?.find(output => output.name === key);
                          const outputType = outputConfig?.output_type || 'markdown';
                          const outputDesc = outputConfig?.output_desc || key;
                          
                          console.log(`Rendering output: ${key}, type: ${outputType}, value:`, value); // Debug log
                          
                          return (
                            <div key={key} className="bg-muted rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold">{outputDesc}</span>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-background/50">
                                  {outputType}
                                </span>
                              </div>
                              
                              {(outputType === 'image' || outputType === 'image_id') ? (
                                <ImageOutput 
                                  value={value as string} 
                                  outputDesc={outputDesc}
                                  isImageId={outputType === 'image_id'}
                                />
                              ) : outputType === 'textarea' ? (
                                <div className="bg-background/30 rounded-lg p-3 mt-2">
                                  <pre className="text-sm whitespace-pre-wrap break-words">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value as string}
                                  </pre>
                                </div>
                              ) : outputType === 'label' ? (
                                // Simple label display (for execution_cost, etc.)
                                <div className="text-sm mt-2">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                </div>
                              ) : (
                                // markdown (default)
                                <div className="prose prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 mt-2">
                                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value as string}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Display execution cost if available */}
                    {executionCost !== null && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <DollarSign size={16} className="text-green-500" />
                        <span className="text-sm">
                          <span className="font-semibold">Execution Cost:</span> ${executionCost.toFixed(8)}
                        </span>
                      </div>
                    )}
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