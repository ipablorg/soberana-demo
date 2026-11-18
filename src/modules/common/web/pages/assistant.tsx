import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Building2, Globe, Coins } from "@/shared/components/animated-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { LanguageToggle } from "@/shared/components/common/LanguageToggle";
import SoberanaLogoLight from "@/shared/assets/soberana_logos/SOBERANA By Loopay negro 1.png";
import SoberanaLogoDark from "@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png";

type MessageType = 'bot' | 'user' | 'options';
type UseCaseType = 'digitalTreasury' | 'crossborder' | 'crypto' | null;

interface Message {
  id: string;
  type: MessageType;
  content: string;
  options?: Array<{ label: string; value: string; icon?: any }>;
}

interface FormData {
  useCase: UseCaseType;
  companyName: string;
  avgCollectionTicket: string;
  avgDispersionTicket: string;
  monthlyTransactions: string;
  collectionCurrency: string;
  dispersionCurrency: string;
  avgDailyMonetization: string;
  industry: string;
  monthlyVolume: string;
  needsApi: string;
  timeline: string;
  email: string;
  phone: string;
}

export default function Assistant() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(t`e.g., Acme Corp`);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    useCase: null,
    companyName: '',
    avgCollectionTicket: '',
    avgDispersionTicket: '',
    monthlyTransactions: '',
    collectionCurrency: '',
    dispersionCurrency: '',
    avgDailyMonetization: '',
    industry: '',
    monthlyVolume: '',
    needsApi: '',
    timeline: '',
    email: '',
    phone: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = useCallback((content: string, delay: number = 400) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(m => m.content === content && m.type === 'bot')) {
          setIsTyping(false);
          return prev;
        }
        setIsTyping(false);
        return [...prev, {
          id: `bot-${Date.now()}-${Math.random()}`,
          type: 'bot',
          content,
        }];
      });
    }, delay);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content,
    }]);
  }, []);

  const addOptionsMessage = useCallback((options: Array<{ label: string; value: string; icon?: any }>) => {
    setMessages(prev => {
      // Remove existing options before adding new ones
      const withoutOptions = prev.filter(m => m.type !== 'options');
      return [...withoutOptions, {
        id: `options-${Date.now()}`,
        type: 'options',
        content: '',
        options,
      }];
    });
  }, []);

  const addUseCaseOptions = useCallback(() => {
    addBotMessage(t`What would you like to do with Loopay?`);
    setTimeout(() => {
      addOptionsMessage([
        {
          label: t`Digital Treasury - Manage multi-currency accounts and liquidity`,
          value: 'digitalTreasury',
          icon: Building2,
        },
        {
          label: t`Cross-border Payments - Send and receive international payments`,
          value: 'crossborder',
          icon: Globe,
        },
        {
          label: t`Crypto Operations - Buy, sell, and manage cryptocurrencies`,
          value: 'crypto',
          icon: Coins,
        },
      ]);
    }, 600);
  }, [t, addBotMessage, addOptionsMessage]);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only run once on mount
    if (!isInitialized) {
      setIsInitialized(true);
      addBotMessage(t`Hi! I'm your Loopay assistant. I'm here to help you get started with the perfect financial solution for your business.`, 500);
      setTimeout(() => {
        addUseCaseOptions();
      }, 1200);
    }
  }, [isInitialized, t, addBotMessage, addUseCaseOptions]);

  const handleUseCaseSelection = (useCase: UseCaseType) => {
    if (!useCase) return;
    
    const selectedOption = messages.find(m => m.type === 'options')?.options?.find(o => o.value === useCase);
    if (selectedOption) {
      addUserMessage(selectedOption.label);
    }
    
    setFormData(prev => ({ ...prev, useCase }));
    
    // Remove options message
    setMessages(prev => prev.filter(m => m.type !== 'options'));
    
    addBotMessage(t`Perfect! Let me ask you a few questions to better understand your needs.`, 400);
    
    setTimeout(() => {
      startQuestionnaire(useCase);
    }, 900);
  };

  const startQuestionnaire = (useCase: UseCaseType) => {
    setCurrentStep(1);
    askNextQuestion(useCase, 1);
  };

  const askNextQuestion = (useCase: UseCaseType, step: number) => {
    if (!useCase) return;

    let question = '';
    let placeholder = '';

    // Company name is always first
    if (step === 1) {
      question = t`What's your company name?`;
      placeholder = t`e.g., Acme Corp`;
    } else if (useCase === 'digitalTreasury') {
      if (step === 2) {
        question = t`What's your average collection ticket size?`;
        placeholder = t`e.g., $5,000`;
      } else if (step === 3) {
        question = t`What's your average dispersion ticket size?`;
        placeholder = t`e.g., $3,000`;
      } else if (step === 4) {
        question = t`How many transactions do you process monthly?`;
        placeholder = t`e.g., 500`;
      } else {
        askAdditionalQuestions(step - 4);
        return;
      }
    } else if (useCase === 'crossborder') {
      if (step === 2) {
        question = t`Which currency do you collect in?`;
        placeholder = t`e.g., USD`;
      } else if (step === 3) {
        question = t`Which currency do you disperse in?`;
        placeholder = t`e.g., BRL`;
      } else if (step === 4) {
        question = t`What's your average collection ticket size?`;
        placeholder = t`e.g., $5,000`;
      } else if (step === 5) {
        question = t`How many transactions do you process monthly?`;
        placeholder = t`e.g., 500`;
      } else {
        askAdditionalQuestions(step - 5);
        return;
      }
    } else if (useCase === 'crypto') {
      if (step === 2) {
        question = t`What's your average daily monetization volume?`;
        placeholder = t`e.g., $10,000`;
      } else {
        askAdditionalQuestions(step - 2);
        return;
      }
    }

    setCurrentPlaceholder(placeholder);
    addBotMessage(question, 300);
  };

  const askAdditionalQuestions = (additionalStep: number) => {
    if (additionalStep === 1) {
      addBotMessage(t`What industry are you in?`, 300);
      setTimeout(() => {
        addOptionsMessage([
          { label: t`Fintech`, value: 'fintech' },
          { label: t`E-commerce`, value: 'ecommerce' },
          { label: t`Retail`, value: 'retail' },
          { label: t`Remittances`, value: 'remittances' },
          { label: t`Corporate / Enterprise`, value: 'corporate' },
          { label: t`Marketplace`, value: 'marketplace' },
          { label: t`Other`, value: 'other' },
        ]);
      }, 700);
    } else if (additionalStep === 2) {
      addBotMessage(t`What's your estimated monthly transaction volume?`, 300);
      setTimeout(() => {
        addOptionsMessage([
          { label: t`Less than $1M`, value: 'lessThan1M' },
          { label: t`Between $1M - $10M`, value: 'between1M10M' },
          { label: t`Between $10M - $50M`, value: 'between10M50M' },
          { label: t`More than $50M`, value: 'moreThan50M' },
        ]);
      }, 700);
    } else if (additionalStep === 3) {
      addBotMessage(t`When would you like to start using Loopay?`, 300);
      setTimeout(() => {
        addOptionsMessage([
          { label: t`Immediately`, value: 'immediate' },
          { label: t`In 1 month`, value: 'oneMonth' },
          { label: t`In 3 months`, value: 'threeMonths' },
          { label: t`In 6 months or more`, value: 'sixMonths' },
        ]);
      }, 700);
    } else if (additionalStep === 4) {
      setCurrentPlaceholder(t`your.email@company.com`);
      addBotMessage(t`Finally, what's your business email?`, 300);
    } else if (additionalStep === 5) {
      finishOnboarding();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    addUserMessage(currentInput);
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Store the answer
    const step = currentStep;
    if (step === 1) {
      setFormData(prev => ({ ...prev, companyName: currentInput }));
    } else if (formData.useCase === 'digitalTreasury') {
      if (step === 2) setFormData(prev => ({ ...prev, avgCollectionTicket: currentInput }));
      else if (step === 3) setFormData(prev => ({ ...prev, avgDispersionTicket: currentInput }));
      else if (step === 4) setFormData(prev => ({ ...prev, monthlyTransactions: currentInput }));
      else if (step === 8) setFormData(prev => ({ ...prev, email: currentInput }));
    } else if (formData.useCase === 'crossborder') {
      if (step === 2) setFormData(prev => ({ ...prev, collectionCurrency: currentInput }));
      else if (step === 3) setFormData(prev => ({ ...prev, dispersionCurrency: currentInput }));
      else if (step === 4) setFormData(prev => ({ ...prev, avgCollectionTicket: currentInput }));
      else if (step === 5) setFormData(prev => ({ ...prev, monthlyTransactions: currentInput }));
      else if (step === 9) setFormData(prev => ({ ...prev, email: currentInput }));
    } else if (formData.useCase === 'crypto') {
      if (step === 2) setFormData(prev => ({ ...prev, avgDailyMonetization: currentInput }));
      else if (step === 6) setFormData(prev => ({ ...prev, email: currentInput }));
    }
    
    setCurrentInput('');
    
    setTimeout(() => {
      askNextQuestion(formData.useCase, nextStep);
    }, 300);
  };

  const handleOptionSelection = (value: string, label: string) => {
    addUserMessage(label);
    
    // Remove options message
    setMessages(prev => prev.filter(m => m.type !== 'options'));
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Store the answer
    const useCase = formData.useCase;
    const step = currentStep;
    
    if (useCase === 'digitalTreasury') {
      if (step === 5) setFormData(prev => ({ ...prev, industry: value }));
      else if (step === 6) setFormData(prev => ({ ...prev, monthlyVolume: value }));
      else if (step === 7) setFormData(prev => ({ ...prev, timeline: value }));
    } else if (useCase === 'crossborder') {
      if (step === 6) setFormData(prev => ({ ...prev, industry: value }));
      else if (step === 7) setFormData(prev => ({ ...prev, monthlyVolume: value }));
      else if (step === 8) setFormData(prev => ({ ...prev, timeline: value }));
    } else if (useCase === 'crypto') {
      if (step === 3) setFormData(prev => ({ ...prev, industry: value }));
      else if (step === 4) setFormData(prev => ({ ...prev, monthlyVolume: value }));
      else if (step === 5) setFormData(prev => ({ ...prev, timeline: value }));
    }
    
    setTimeout(() => {
      if (useCase === 'digitalTreasury') {
        askAdditionalQuestions(step - 3);
      } else if (useCase === 'crossborder') {
        askAdditionalQuestions(step - 4);
      } else if (useCase === 'crypto') {
        askAdditionalQuestions(step - 1);
      }
    }, 300);
  };

  const finishOnboarding = () => {
    addBotMessage(t`Thank you! I have all the information I need.`, 400);
    setTimeout(() => {
      addBotMessage(t`I'm processing your information and preparing a customized solution for you...`, 400);
    }, 900);
    setTimeout(() => {
      addBotMessage(t`Our team will contact you shortly to discuss the best options for your business. Welcome to Loopay! 🚀`, 400);
    }, 1500);
    
    // Redirect after completion
    setTimeout(() => {
      navigate('/');
    }, 3500);
  };

  const showInput = currentStep > 0 && !messages.some(m => m.type === 'options');

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" size={16} />
              </Button>
              <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
              <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
            </div>
            <LanguageToggle />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-6 px-6">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-primary-foreground"><Trans>Move</Trans></span>{" "}
              <span className="text-primary-foreground"><Trans>Change</Trans></span>{" "}
              <span className="text-foreground"><Trans>Control</Trans></span>
            </h1>
            <p className="text-lg text-muted-foreground">
              <Trans>Let's find the perfect solution for your business</Trans>
            </p>
          </motion.div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border border-border/50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" size={16} />
                        </div>
                        <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                    
                    {message.type === 'options' && message.options && (
                      <div className="w-full space-y-2">
                        {message.options.map((option, index) => (
                          <motion.div
                            key={option.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-3 h-auto py-4 text-left hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => {
                                if (formData.useCase === null) {
                                  handleUseCaseSelection(option.value as UseCaseType);
                                } else {
                                  handleOptionSelection(option.value, option.label);
                                }
                              }}
                            >
                              {option.icon && <option.icon className="w-5 h-5" />}
                              <span>{option.label}</span>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" size={16} />
                    </div>
                    <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {showInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-border p-4"
              >
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder={currentPlaceholder}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="icon" disabled={!currentInput.trim()}>
                    <Send className="w-4 h-4" size={16} />
                  </Button>
                </form>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

