"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Cat, SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
import { Pathcontext } from "../context/filecontext";
const Chat = () => {
    const [files, setfiles] = useState()
    const {filePath, setFilePath} = useContext(Pathcontext)
    const fetchfiles = async() => {
       
          try {
            const res = await fetch("http://localhost:4000/getfiles", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paths: filePath }),
            });
            const data = await res.json();
            console.log(data);
            setfiles(data);
            
          } catch (error) {
            console.error("Error fetching fles", error);
            alert("Failed to fetch insights. Check console for details.");
          } 
    }
    useEffect(() => {
        fetchfiles()
        
    }, []);
   
      const apiKey = "AIzaSyBNTGpOORFly1qJUdAOm6IuoVQz29__UXM";
      const genAI = new GoogleGenerativeAI(apiKey);
     
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        systemInstruction: "these are the files in the project : " +JSON.stringify(files)+"give answers with respect to this code only ",
      });
      
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };
      
      async function run(text) {
        const chatSession = model.startChat({
          generationConfig,
          history: [
          ],
        });
      
        const result = await chatSession.sendMessage(text);
        console.log(result.response.text());
        return result.response.text();
      }
      
    
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getGeminiResponse = async (messageText) => {
    // Simulate API call delay
  let x=await run(messageText)
    
    return x;
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;
    
    const userMessage = { text: messageText, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      // This would use the actual Gemini API in production
      const response = await getGeminiResponse(messageText);
      
      setMessages((prev) => [
        ...prev,
        { text: response, isUser: false }
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        { 
          text: "Sorry, there was an error processing your request. Please try again.",
          isUser: false 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  // ChatMessage component inline
  const ChatMessage = ({ messageText, isUser }) => {
    return (
      <div
        className={cn(
          "flex w-full mb-4 animate-fade-in",
          isUser ? "justify-end" : "justify-start"
        )}
        style={{ animationDelay: "0.1s" }}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {isUser ? (
            <p className="text-sm md:text-base">{messageText}</p>
          ) : (
            <div className="prose prose-sm md:prose-base max-w-none text-black">
              <ReactMarkdown>{messageText}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">project chat</h1>
          <div className="ml-2 px-2 py-1 bg-secondary rounded-full text-xs font-medium">
            AI
          </div>
        </div>
        
       
      </header>

      { (
        <>
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 pt-4 pb-2"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <div className="text-2xl"><Cat /></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to Project Chat</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Ask anything to get started. Try asking about your project 
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg w-full">
                  {["Tell me about project", "What can i help you with?"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-left p-3 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  messageText={msg.text} 
                  isUser={msg.isUser} 
                />
              ))
            )}
            
            {loading && (
              <div className="flex w-full mb-4 justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground flex">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle delay-300"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-subtle delay-500"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form
            onSubmit={handleFormSubmit}
            className="flex items-end gap-2 bg-background p-4 border-t border-border"
          >
            <div className="relative w-full">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm md:text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[56px] max-h-[200px] resize-none pr-12"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity",
                  (loading || !message.trim()) && "opacity-50 cursor-not-allowed"
                )}
                disabled={loading || !message.trim()}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;
