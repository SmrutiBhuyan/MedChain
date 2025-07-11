import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Languages,
  MessageSquare,
  Navigation,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IVRCall {
  id: string;
  phoneNumber: string;
  language: string;
  purpose: 'verify' | 'availability' | 'report';
  status: 'active' | 'completed' | 'failed';
  startTime: string;
  duration: number;
  transcript: string[];
  result?: {
    drugName?: string;
    batchNumber?: string;
    verification?: 'genuine' | 'counterfeit' | 'not_found';
    availability?: Array<{
      pharmacy: string;
      stock: number;
      location: string;
    }>;
    reportId?: string;
  };
}

interface VoiceCommand {
  command: string;
  response: string;
  action?: string;
  confidence: number;
}

export default function IVRSystem() {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [currentCall, setCurrentCall] = useState<IVRCall | null>(null);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [callHistory, setCallHistory] = useState<IVRCall[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Simulate voice recognition
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening && currentCall) {
      interval = setInterval(() => {
        simulateVoiceInput();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isListening, currentCall]);

  const simulateVoiceInput = () => {
    const sampleCommands = [
      { command: "Verify drug ASP001", response: "Aspirin batch ASP001 is genuine. Manufactured by PharmaCorp.", action: "verify", confidence: 95 },
      { command: "Find Paracetamol in Mumbai", response: "Found 5 pharmacies with Paracetamol in Mumbai. Closest is Central Pharmacy with 45 units.", action: "availability", confidence: 89 },
      { command: "Report fake drug", response: "Please provide the batch number and details of the suspicious drug.", action: "report", confidence: 92 }
    ];

    const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
    setVoiceCommands(prev => [...prev, randomCommand]);
    
    if (currentCall) {
      setCurrentCall(prev => prev ? {
        ...prev,
        transcript: [...prev.transcript, `User: ${randomCommand.command}`, `System: ${randomCommand.response}`]
      } : null);
    }
  };

  const startCall = (purpose: 'verify' | 'availability' | 'report') => {
    const newCall: IVRCall = {
      id: Date.now().toString(),
      phoneNumber: "+91-1800-MEDCHAIN",
      language: selectedLanguage,
      purpose,
      status: 'active',
      startTime: new Date().toISOString(),
      duration: 0,
      transcript: [`System: Welcome to MedChain IVR. How can I help you today?`]
    };
    
    setCurrentCall(newCall);
    setVoiceCommands([]);
    setIsListening(true);
    
    toast({
      title: "Call Started",
      description: `IVR call initiated for ${purpose}`,
    });
  };

  const endCall = () => {
    if (currentCall) {
      const completedCall = {
        ...currentCall,
        status: 'completed' as const,
        duration: Math.floor((Date.now() - new Date(currentCall.startTime).getTime()) / 1000)
      };
      
      setCallHistory(prev => [completedCall, ...prev]);
      setCurrentCall(null);
      setIsListening(false);
      
      toast({
        title: "Call Ended",
        description: `Call duration: ${completedCall.duration}s`,
      });
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const getLanguageName = (code: string) => {
    const languages = {
      en: 'English',
      hi: 'हिंदी (Hindi)',
      bn: 'বাংলা (Bengali)',
      te: 'తెలుగు (Telugu)',
      ta: 'தமிழ் (Tamil)',
      mr: 'मराठी (Marathi)',
      gu: 'ગુજરાતી (Gujarati)',
      kn: 'ಕನ್ನಡ (Kannada)'
    };
    return languages[code as keyof typeof languages] || 'English';
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'verify': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'availability': return <Navigation className="h-4 w-4 text-blue-600" />;
      case 'report': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mockCallHistory: IVRCall[] = [
    {
      id: '1',
      phoneNumber: '+91-9876543210',
      language: 'hi',
      purpose: 'verify',
      status: 'completed',
      startTime: '2024-01-15T10:30:00Z',
      duration: 45,
      transcript: [
        'System: MedChain IVR में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
        'User: मैं ASP001 दवा की जांच करना चाहता हूं',
        'System: ASP001 बैच की जांच की जा रही है... यह दवा असली है।'
      ],
      result: {
        batchNumber: 'ASP001',
        verification: 'genuine'
      }
    },
    {
      id: '2',
      phoneNumber: '+91-9876543211',
      language: 'en',
      purpose: 'availability',
      status: 'completed',
      startTime: '2024-01-15T09:15:00Z',
      duration: 67,
      transcript: [
        'System: Welcome to MedChain IVR. How can I help you today?',
        'User: I need Paracetamol in Delhi',
        'System: Searching for Paracetamol in Delhi... Found 3 pharmacies with stock.'
      ],
      result: {
        drugName: 'Paracetamol',
        availability: [
          { pharmacy: 'Central Pharmacy', stock: 45, location: 'Delhi Central' },
          { pharmacy: 'Apollo Pharmacy', stock: 23, location: 'Delhi South' }
        ]
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IVR Drug Verification System
        </h1>
        <p className="text-gray-600">
          Voice-based drug verification, availability checking, and reporting system - No internet required
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startCall('verify')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verify Drug</h3>
                <p className="text-gray-600">Check drug authenticity by voice</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startCall('availability')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Check Availability</h3>
                <p className="text-gray-600">Find medicines in nearby pharmacies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startCall('report')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report Suspicious Drug</h3>
                <p className="text-gray-600">Report fake or suspicious medicines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2 h-5 w-5" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn'].map(lang => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage(lang)}
                className="justify-start"
              >
                {getLanguageName(lang)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Call */}
      {currentCall && (
        <Card className="mb-8 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-green-600" />
                Active Call - {currentCall.purpose}
              </div>
              <Badge className={getStatusColor(currentCall.status)}>
                {currentCall.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Call Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant={isListening ? 'default' : 'outline'}
                  onClick={toggleListening}
                  className="flex items-center gap-2"
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {isListening ? 'Listening...' : 'Start Listening'}
                </Button>
                
                <Button
                  variant={isPlaying ? 'default' : 'outline'}
                  onClick={togglePlayback}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isPlaying ? 'Speaking...' : 'Start Speaking'}
                </Button>
                
                <Button variant="destructive" onClick={endCall}>
                  End Call
                </Button>
              </div>

              {/* Call Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Duration</span>
                  <div className="font-medium">
                    {Math.floor((Date.now() - new Date(currentCall.startTime).getTime()) / 1000)}s
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Language</span>
                  <div className="font-medium">{getLanguageName(currentCall.language)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Purpose</span>
                  <div className="font-medium capitalize">{currentCall.purpose}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Commands</span>
                  <div className="font-medium">{voiceCommands.length}</div>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Live Transcript</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  {currentCall.transcript.map((line, idx) => (
                    <div key={idx} className="text-sm mb-1">
                      {line.startsWith('User:') ? (
                        <span className="text-blue-600">{line}</span>
                      ) : (
                        <span className="text-gray-700">{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Commands */}
              {voiceCommands.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recognized Commands</h4>
                  <div className="space-y-2">
                    {voiceCommands.map((cmd, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-900">{cmd.command}</span>
                          <Badge variant="secondary">{cmd.confidence}% confidence</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{cmd.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCallHistory.map(call => (
              <div key={call.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPurposeIcon(call.purpose)}
                    <span className="font-medium capitalize">{call.purpose}</span>
                    <span className="text-sm text-gray-600">
                      {getLanguageName(call.language)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                    <span className="text-sm text-gray-600">{call.duration}s</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <Phone className="inline h-3 w-3 mr-1" />
                  {call.phoneNumber} • {new Date(call.startTime).toLocaleString()}
                </div>

                {/* Result Summary */}
                {call.result && (
                  <div className="bg-gray-50 p-3 rounded mt-2">
                    <h5 className="font-medium text-gray-900 mb-1">Result</h5>
                    {call.result.verification && (
                      <p className="text-sm text-gray-600">
                        Verification: <span className="font-medium">{call.result.verification}</span>
                      </p>
                    )}
                    {call.result.availability && (
                      <p className="text-sm text-gray-600">
                        Found {call.result.availability.length} pharmacies with stock
                      </p>
                    )}
                    {call.result.reportId && (
                      <p className="text-sm text-gray-600">
                        Report ID: <span className="font-medium">{call.result.reportId}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verifications</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Languages className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Languages</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">52s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}