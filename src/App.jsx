import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, Bot, ChevronLeft, ChevronRight, Plus, MessageSquare, Edit2, Trash2, Check } from 'lucide-react'
import models from "./models.json"

// --- CLICK SPARK COMPONENT ---
const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  className = '',
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    t => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;

    const draw = timestamp => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

  const handleClick = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));

    sparksRef.current.push(...newSparks);
  };

  return (
    <div className={`relative w-full h-full ${className}`} onClick={handleClick}>
      <canvas ref={canvasRef} className="w-full h-full block absolute top-0 left-0 select-none pointer-events-none z-50" />
      {children}
    </div>
  );
};

function App() {
  // --- STATE MANAGEMENT ---
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [{ id: 1, title: "New Chat", messages: [] }];
  });
  
  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved)[0].id : 1;
  });

  const [messages, setMessages] = useState([]); 
  const [ipvalue, setIpvalue] = useState("");
  const [AIready, setAIready] = useState(true);
  const [isloading, setIsloading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isAgentBoxOpen, setIsAgentBoxOpen] = useState(false);
  
  // Renaming state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const messageEndRef = useRef(null);

  // --- EFFECTS ---

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAIready(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat) {
      setMessages(currentChat.messages);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (messages.length > 0 || chats.find(c => c.id === activeChatId)?.messages.length > 0) {
      const updatedChats = chats.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: messages } : chat
      );
      setChats(updatedChats);
      localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
    }
  }, [messages]);

  // --- HISTORY FUNCTIONS ---

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const updatedChats = chats.filter(chat => chat.id !== id);
    
    if (updatedChats.length === 0) {
      const newChat = { id: Date.now(), title: "New Chat", messages: [] };
      setChats([newChat]);
      setActiveChatId(newChat.id);
      setMessages([]);
    } else {
      setChats(updatedChats);
      localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
      if (id === activeChatId) {
        setActiveChatId(updatedChats[0].id);
        setMessages(updatedChats[0].messages);
      }
    }
  };

  const startRenaming = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleValue(chat.title);
  };

  const saveRename = (e) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      const updatedChats = chats.map(chat => 
        chat.id === editingChatId ? { ...chat, title: editTitleValue } : chat
      );
      setChats(updatedChats);
      localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
    }
    setEditingChatId(null);
  };

  // --- CHAT LOGIC ---

  const addMessage = (content, isUser) => {
    setMessages((prev) => {
      const newMsgs = [...prev, { content, isUser, id: Date.now() }];
      return newMsgs;
    });
  };
  
  const sendMessage = async () => {
    const message = ipvalue.trim();
    if (!AIready || !message) return;

    if (messages.length === 0) {
       setChats(prev => prev.map(chat => 
         chat.id === activeChatId && chat.title === "New Chat" 
           ? { ...chat, title: message.substring(0, 20) + "..." } 
           : chat
       ));
    }

    addMessage(message, true);
    setIpvalue("");
    setIsloading(true);

    try {
      const conversation = [
        { role: "system", content: "You are a helpful assistant." },
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: message }
      ];
      
      if (window.puter?.ai?.chat) {
        const response = await window.puter.ai.chat(
          conversation,
          { model: selectedModel }
        );
        const reply = typeof response === "string"
          ? response
          : response.message?.content || "Sorry – no reply received.";
        addMessage(reply, false);
      } else {
        addMessage("This is a demo response. Connect to Puter AI for real responses.", false);
      }
      
    } catch (err) {
      console.error("Error in sendMessage:", err);
      addMessage("Something went wrong. Please try again.", false);
    } finally {
      setIsloading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    const model = models.find((m) => m.id === newModel);
    if(messages.length > 0) {
        addMessage(`Switched to ${model.name} (${model.provider})`, false);
    }
  }

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
      className="min-h-screen bg-zinc-950 flex overflow-hidden text-slate-200 font-sans selection:bg-cyan-500/30 relative"
    >
      
      {/* --- APP CONTENT --- */}
      <div className="relative z-10 flex w-full h-full">

        {/* --- MOBILE SIDEBAR OVERLAY --- */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* --- SIDEBAR --- */}
        <div className={`
          fixed md:relative z-40 h-full
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16'} 
          transition-all duration-300 ease-in-out
          bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col
        `}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            {isSidebarOpen && (
              <h2 className="text-white font-bold tracking-wide text-sm uppercase">History</h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white hidden md:block"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {isSidebarOpen ? (
              <div className="space-y-2">
                {/* New Chat Button */}
                <button 
                  onClick={createNewChat}
                  className="w-full flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/40 rounded-xl text-white transition-all mb-4 group hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform text-cyan-400" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>

                {/* Chat List */}
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        if(window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        activeChatId === chat.id 
                          ? "bg-zinc-800/60 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                          : "hover:bg-zinc-900/50 border-transparent text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <MessageSquare size={16} className={activeChatId === chat.id ? "text-cyan-400" : "text-gray-600"} />
                      
                      {/* Rename Input or Title */}
                      {editingChatId === chat.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input 
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-black text-xs p-1 rounded text-white border border-cyan-500 focus:outline-none"
                            autoFocus
                          />
                          <button onClick={saveRename} className="p-1 hover:bg-cyan-500/20 rounded text-cyan-400"><Check size={14} /></button>
                        </div>
                      ) : (
                        <span className="text-sm truncate flex-1 font-light">{chat.title}</span>
                      )}

                      {/* Action Buttons */}
                      {editingChatId !== chat.id && (
                        <div className={`flex items-center gap-1 ${activeChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <button 
                            onClick={(e) => startRenaming(e, chat)}
                            className="p-1.5 hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-white transition"
                            title="Rename"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => deleteChat(e, chat.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 mt-4">
                <button onClick={createNewChat} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition border border-white/5 hover:border-white/30" title="New Chat">
                  <Plus size={16} className="text-white" />
                </button>
                <div className="w-8 h-[1px] bg-zinc-800"></div>
                {chats.slice(0, 5).map(chat => (
                  <button 
                    key={chat.id} 
                    onClick={() => { setIsSidebarOpen(true); setActiveChatId(chat.id); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${activeChatId === chat.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "hover:bg-zinc-800 text-gray-600"}`}
                  >
                    <MessageSquare size={16} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col relative bg-transparent w-full overflow-hidden">
          <div className="flex-1 flex flex-col items-center p-2 sm:p-4 gap-4 sm:gap-8 overflow-y-auto w-full h-full">
              {/* Mobile Header with Menu Button */}
              <div className="w-full flex items-center justify-between md:justify-center md:relative mt-2 sm:mt-0">
                  <button 
                      onClick={() => setIsSidebarOpen(true)} 
                      className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10"
                  >
                      <Menu size={20} />
                  </button>
                  
                  <h1 className="text-2xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-300 to-gray-500 bg-clip-text text-transparent text-center font-bold tracking-tighter drop-shadow-sm truncate px-2">
                  Multi-Model AI
                  </h1>

                  {/* Spacer for visual balance on mobile */}
                  <div className="w-10 md:hidden"></div>
              </div>
              
              {/* Status & Model Select */}
              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 z-10 w-full justify-center'>
              <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium tracking-wide backdrop-blur-sm ${
                  AIready ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "bg-yellow-500/10 text-yellow-200 border border-yellow-500/20"
              }`}>
                  {AIready ? "● SYSTEM ONLINE" : "○ INITIALIZING..."}
              </div>
              <div className='flex items-center gap-2 backdrop-blur-sm bg-zinc-900/50 p-1.5 rounded-lg border border-white/10 w-full sm:w-auto justify-center'>
                  <span className='text-gray-500 text-xs ml-2 uppercase font-bold whitespace-nowrap'>Model</span>
                  <select 
                  value={selectedModel} 
                  onChange={handleModelChange} 
                  disabled={!AIready}
                  className='bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer p-1 font-medium max-w-[150px]'
                  >
                  {models.map((model) => (
                      <option key={model.id} value={model.id} className='bg-zinc-900 text-white'>
                      {model.name}
                      </option>
                  ))}
                  </select>
              </div>
              </div>

              {/* --- Chat Box with Shiny Silver Border --- */}
              <div className='w-full max-w-2xl flex-1 flex flex-col bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-3 sm:p-6 shadow-2xl relative transition-all duration-500 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group'>
                  {/* Decorative glow behind box */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-blue-500/10 rounded-3xl blur-xl -z-10 opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              
              <div className='flex items-center justify-center mb-2 sm:mb-4'>
                  <span className='text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-widest'> 
                  Now Speaking With: <span className="text-white">{currentModel.name}</span>
                  </span>
              </div>
              
              {/* Messages Area */}
              <div className='flex-1 min-h-[50vh] sm:min-h-[300px] overflow-y-auto border-b border-white/5 mb-4 p-2 sm:p-4 bg-zinc-900/30 rounded-2xl scrollbar-thin scrollbar-thumb-zinc-700'>
                  {messages.length === 0 && (
                  <div className='h-full flex flex-col items-center justify-center text-zinc-600 select-none'>
                      <Bot size={48} className="mb-4 opacity-20" />
                      <p className="text-gray-400 text-center text-sm sm:text-base">Try different AI models to see how they respond!</p>
                      <span className='text-xs text-zinc-600 mt-2 block text-center'>
                      Secure connection established.
                      </span>
                  </div>
                  )}
                  
                  {messages.map((msg, index) => (
                  <div 
                      key={msg.id || index}
                      className={`p-3 m-2 rounded-2xl w-fit max-w-[90%] text-wrap shadow-sm ${
                      msg.isUser 
                          ? "bg-white text-black ml-auto text-right rounded-br-sm font-medium" 
                          : "bg-zinc-800 text-gray-200 border border-white/5 rounded-bl-sm font-light"
                      }`}
                  >
                      <div className='whitespace-pre-wrap text-sm sm:text-base leading-relaxed'>{msg.content}</div>
                  </div>
                  ))}
                  
                  {isloading && (
                  <div className='p-3 m-2 rounded-2xl max-w-xs bg-zinc-900/50 border border-white/5 animate-pulse flex items-center gap-2'>
                      <span className='text-cyan-400 text-xs uppercase tracking-wide'>Thinking</span>
                      <div className='flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-wide'>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                  </div>
                  )}
                  <div ref={messageEndRef}></div>
              </div>
              
              {/* Input Area */}
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                  <input 
                  type="text" 
                  value={ipvalue} 
                  onChange={(e) => setIpvalue(e.target.value)} 
                  onKeyUp={handleKeyPress} 
                  placeholder={AIready ? "Ask anything..." : "System busy..."}
                  disabled={!AIready || isloading}
                  // Using text-base (16px) to prevent iOS zoom on focus
                  className='flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-white/10 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-white/50 focus:bg-black/60 transition duration-300 shadow-inner'
                  />
                  <button 
                  onClick={sendMessage}
                  disabled={!AIready || isloading || !ipvalue.trim()}
                  className='px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  >
                  {isloading ? (
                      <div className='w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto'></div>
                  ) : "SEND"}
                  </button>
              </div>
              </div>
              <h6 className='text-center text-zinc-500 text-[10px] sm:text-xs tracking-widest uppercase pb-4'>© 2025 Sunnydev. All rights reserved.</h6>
          </div>
        </div>

        {/* --- AGENT BOX BUTTON --- */}
        <button
          onClick={() => setIsAgentBoxOpen(true)}
          className="fixed bottom-6 right-6 sm:top-8 sm:right-8 sm:bottom-auto px-4 sm:px-5 py-3 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-2 z-30 font-bold border-2 border-transparent hover:border-white"
          title="Agent Box"
        >
          <Bot size={20} />
          <span className="hidden sm:inline text-sm">AGENTS</span>
        </button>

        {/* Agent Box Popup */}
        {isAgentBoxOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
              
              {/* Popup Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Bot size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Agent</h2>
                </div>
                <button
                  onClick={() => setIsAgentBoxOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Popup Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-zinc-950 to-black scrollbar-thin scrollbar-thumb-zinc-700">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-2">
                  {/* General Mahoraga Card */}
                <a 
                    href="#" 
                    className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 hover:border-white/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-black overflow-hidden cursor-not-allowed"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 relative">
                      <img 
                        src="https://media1.tenor.com/m/4_UiVkvE8y4AAAAd/mahoraga-jjk.gif" 
                        alt="General Mahoraga"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-[10px] font-bold text-white border border-white/30 px-2 py-1 rounded tracking-widest uppercase">Locked</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white">General Mahoraga</h4>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Algorithm Agent </p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Under_development...</p>
                  </a>

                  {/* Poornima Oracle Card */}
                  <a 
                    href="https://sunnydev07.github.io/Poornima-Oracle/" 
                    className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 hover:border-white/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-black"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 group-hover:border-cyan-400 transition-all duration-300 shadow-lg">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm0aT7k5O09y2256AMvDppRfJq7pIeV9d0KA&s" 
                        alt="Poornima Oracle"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Poornima Oracle</h4>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">RAG Agent</p>
                  </a>

                  {/* AI-Girl Card */}
                <a 
                    href="https://019a6f62-d3a1-7947-add2-fd7c935a378b.arena.site/node" 
                    className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 hover:border-white/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-black cursor-not-allowed "
                  >
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-4 grayscale group-hover:grayscale-0 transition-all duration-900 relative">
                      <img 
                        src="https://media1.tenor.com/m/jJoFEYBZGqkAAAAd/chainsaw-man-csm.gif" 
                        alt="Makima"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-[10px] font-bold text-white border border-white/30 px-2 py-1 rounded tracking-widest uppercase">Locked</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">Makima</h4>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Empathy Engine</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Under_development...</p>
                  </a>

                  {/* AGI Card */}
                  <a 
                    href="#" 
                    className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 opacity-50 hover:opacity-100 hover:border-white/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] cursor-not-allowed "
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 mb-4 grayscale">
                      <img 
                        src="src\assets\images.jpeg" 
                        alt="AGI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-lg font-bold text-gray-400">AGI-Agent</h4>
                    <p className="text-xs text-zinc-700 mt-1 uppercase tracking-wider">Coming Soon</p>
                  </a>
                </div>
              </div>

              {/* Popup Footer */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <button
                  onClick={() => setIsAgentBoxOpen(false)}
                  className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClickSpark>
  );
}

export default App;