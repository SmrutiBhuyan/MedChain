import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, MessageSquare, Search, MapPin, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your MedChain AI Assistant. I can help you with drug verification, finding medicines, and answering questions about our platform. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Is batch #MED-2024-001 safe?",
        "Find paracetamol near Mumbai",
        "How do I verify a drug?",
        "What should I do if I find a counterfeit drug?",
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (message: string): { content: string; suggestions?: string[] } => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("batch") || lowerMessage.includes("verify")) {
      return {
        content: "I can help you verify drug batches! To verify a drug, you can:\n\n1. Use our QR code scanner on the Verify Drug page\n2. Enter the batch number manually\n3. Check the verification results for authenticity\n\nWould you like me to guide you through the verification process?",
        suggestions: ["Yes, guide me through verification", "What makes a drug authentic?", "How do I scan QR codes?"],
      };
    }
    
    if (lowerMessage.includes("find") || lowerMessage.includes("medicine") || lowerMessage.includes("pharmacy")) {
      return {
        content: "I can help you find medicines! Use our Emergency Stock Locator to:\n\n1. Search by drug name and city\n2. View real-time stock availability\n3. Get directions to nearby pharmacies\n4. Check contact information\n\nWhat medicine are you looking for and in which city?",
        suggestions: ["Search for paracetamol", "Find nearest pharmacy", "How does stock tracking work?"],
      };
    }
    
    if (lowerMessage.includes("counterfeit") || lowerMessage.includes("fake")) {
      return {
        content: "⚠️ If you suspect a counterfeit drug:\n\n1. Do NOT use the medication\n2. Report it immediately through our Support page\n3. Keep the packaging and receipt\n4. Contact the pharmacy where you bought it\n5. Report to local health authorities\n\nYour safety is our top priority. Would you like me to help you report a counterfeit drug?",
        suggestions: ["Report counterfeit drug", "What are signs of counterfeit drugs?", "Contact support"],
      };
    }
    
    if (lowerMessage.includes("how") || lowerMessage.includes("help")) {
      return {
        content: "I'm here to help! Here's what I can assist you with:\n\n🔍 Drug Verification - Check if medicines are authentic\n🗺️ Medicine Locator - Find drugs in nearby pharmacies\n🚨 Report Issues - Help with counterfeit or suspicious drugs\n📚 Platform Guide - Learn how to use MedChain\n\nWhat would you like to know more about?",
        suggestions: ["Learn about drug verification", "How to use the platform", "Emergency procedures"],
      };
    }
    
    return {
      content: "I understand you're asking about healthcare supply chain management. While I'm still learning, I can help you with:\n\n• Drug verification and authenticity checks\n• Finding medicines in nearby pharmacies\n• Understanding our safety protocols\n• Reporting suspicious or counterfeit drugs\n\nCould you please be more specific about what you need help with?",
      suggestions: ["Verify a drug", "Find medicines", "Report an issue", "Learn about MedChain"],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        </div>
        <p className="text-xl text-gray-600">
          Get instant help with drug verification, medicine location, and platform guidance
        </p>
        <Badge className="mt-2 bg-yellow-100 text-yellow-800">
          Beta Feature
        </Badge>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === "user" 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "user" 
                    ? "bg-primary text-white order-1 ml-2" 
                    : "bg-gray-200 text-gray-600 order-2 mr-2"
                }`}>
                  {message.type === "user" ? "U" : <Bot className="h-4 w-4" />}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("How do I verify a drug?")}>
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Drug Verification</h3>
            <p className="text-sm text-gray-600">Learn how to verify medicines</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("Find medicines near me")}>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Find Medicines</h3>
            <p className="text-sm text-gray-600">Locate nearby pharmacies</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("I found a counterfeit drug")}>
          <CardContent className="p-4 text-center">
            <HelpCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Report Issue</h3>
            <p className="text-sm text-gray-600">Report suspicious drugs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
