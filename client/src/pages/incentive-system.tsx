import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Gift, 
  Trophy, 
  Star, 
  TrendingUp, 
  Wallet, 
  Shield,
  Users,
  Target,
  Award,
  Coins,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  type: 'verification' | 'report' | 'referral' | 'streak' | 'milestone';
  title: string;
  description: string;
  points: number;
  cashback: number;
  requirements: string[];
  icon: string;
  isActive: boolean;
  participants: number;
  completionRate: number;
}

interface UserReward {
  id: string;
  rewardId: string;
  rewardTitle: string;
  type: string;
  points: number;
  cashback: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  earnedDate: string;
  paidDate?: string;
  transactionId?: string;
  evidence?: string;
}

interface UserStats {
  totalPoints: number;
  totalCashback: number;
  pendingCashback: number;
  currentStreak: number;
  totalVerifications: number;
  totalReports: number;
  rank: number;
  level: string;
  nextLevelPoints: number;
}

export default function IncentiveSystem() {
  const [selectedTab, setSelectedTab] = useState<'rewards' | 'history' | 'leaderboard'>('rewards');
  const [upiId, setUpiId] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const mockUserStats: UserStats = {
    totalPoints: 1250,
    totalCashback: 425.50,
    pendingCashback: 125.00,
    currentStreak: 7,
    totalVerifications: 34,
    totalReports: 3,
    rank: 42,
    level: 'Silver',
    nextLevelPoints: 1500
  };

  const mockRewards: Reward[] = [
    {
      id: '1',
      type: 'verification',
      title: 'Drug Verification Bonus',
      description: 'Earn cashback for each successful drug verification',
      points: 10,
      cashback: 5,
      requirements: ['Valid drug verification', 'Batch number must exist', 'GPS location required'],
      icon: '🔍',
      isActive: true,
      participants: 1247,
      completionRate: 85
    },
    {
      id: '2',
      type: 'report',
      title: 'Counterfeit Reporter',
      description: 'Report suspicious drugs and earn rewards for valid reports',
      points: 50,
      cashback: 25,
      requirements: ['Detailed report submission', 'Photo evidence', 'Location details', 'Investigation verification'],
      icon: '🚨',
      isActive: true,
      participants: 89,
      completionRate: 92
    },
    {
      id: '3',
      type: 'streak',
      title: 'Verification Streak',
      description: 'Maintain daily verification activity for bonus rewards',
      points: 100,
      cashback: 50,
      requirements: ['7 consecutive days', 'Minimum 2 verifications per day', 'No counterfeit reports'],
      icon: '🔥',
      isActive: true,
      participants: 234,
      completionRate: 67
    },
    {
      id: '4',
      type: 'referral',
      title: 'Referral Bonus',
      description: 'Invite friends to join MedChain and earn rewards',
      points: 200,
      cashback: 100,
      requirements: ['Friend registers using your code', 'Friend completes 5 verifications', 'Friend maintains 3-day streak'],
      icon: '👥',
      isActive: true,
      participants: 156,
      completionRate: 78
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Century Club',
      description: 'Complete 100 successful verifications',
      points: 500,
      cashback: 250,
      requirements: ['100 successful verifications', 'Account age > 30 days', 'No violations'],
      icon: '🏆',
      isActive: true,
      participants: 23,
      completionRate: 100
    }
  ];

  const mockUserRewards: UserReward[] = [
    {
      id: '1',
      rewardId: '1',
      rewardTitle: 'Drug Verification Bonus',
      type: 'verification',
      points: 10,
      cashback: 5,
      status: 'paid',
      earnedDate: '2024-01-15T10:30:00Z',
      paidDate: '2024-01-15T18:00:00Z',
      transactionId: 'UPI_TXN_123456789',
      evidence: 'Verified ASP001 - genuine drug'
    },
    {
      id: '2',
      rewardId: '2',
      rewardTitle: 'Counterfeit Reporter',
      type: 'report',
      points: 50,
      cashback: 25,
      status: 'approved',
      earnedDate: '2024-01-14T15:20:00Z',
      evidence: 'Reported suspicious batch FAKE001'
    },
    {
      id: '3',
      rewardId: '3',
      rewardTitle: 'Verification Streak',
      type: 'streak',
      points: 100,
      cashback: 50,
      status: 'pending',
      earnedDate: '2024-01-13T09:15:00Z',
      evidence: '7-day verification streak completed'
    }
  ];

  const mockLeaderboard = [
    { rank: 1, name: 'Dr. Amit Sharma', points: 3250, cashback: 1125, verifications: 98, reports: 12 },
    { rank: 2, name: 'Priya Patel', points: 2890, cashback: 945, verifications: 87, reports: 8 },
    { rank: 3, name: 'Rajesh Kumar', points: 2654, cashback: 823, verifications: 76, reports: 15 },
    { rank: 4, name: 'Sneha Reddy', points: 2341, cashback: 712, verifications: 65, reports: 6 },
    { rank: 5, name: 'Vikram Singh', points: 2156, cashback: 678, verifications: 59, reports: 9 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'verification': return <Shield className="h-4 w-4" />;
      case 'report': return <Trophy className="h-4 w-4" />;
      case 'streak': return <Target className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'milestone': return <Award className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return 'text-orange-600';
      case 'Silver': return 'text-gray-600';
      case 'Gold': return 'text-yellow-600';
      case 'Platinum': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleWithdraw = () => {
    if (!upiId) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID to withdraw cashback",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `₹${mockUserStats.pendingCashback} will be transferred to ${upiId}`,
    });
  };

  const claimReward = (rewardId: string) => {
    toast({
      title: "Reward Claimed",
      description: "Your reward has been added to pending cashback",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Incentive & Rewards System
        </h1>
        <p className="text-gray-600">
          Earn cashback and rewards for verifying drugs, reporting counterfeits, and maintaining safety standards
        </p>
      </div>

      {/* User Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Points</p>
                <p className="text-2xl font-bold text-blue-900">{mockUserStats.totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Cashback</p>
                <p className="text-2xl font-bold text-green-900">₹{mockUserStats.totalCashback}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Current Rank</p>
                <p className="text-2xl font-bold text-purple-900">#{mockUserStats.rank}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Level</p>
                <p className={`text-2xl font-bold ${getLevelColor(mockUserStats.level)}`}>
                  {mockUserStats.level}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Cashback & Withdrawal */}
      <Card className="mb-8 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center text-green-800">
            <Wallet className="mr-2 h-5 w-5" />
            Pending Cashback: ₹{mockUserStats.pendingCashback}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter UPI ID (e.g., user@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <Button onClick={handleWithdraw} className="bg-green-600 hover:bg-green-700">
              Withdraw ₹{mockUserStats.pendingCashback}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Minimum withdrawal: ₹50 • Processing time: 24-48 hours
          </p>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <Button
          variant={selectedTab === 'rewards' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('rewards')}
        >
          Available Rewards
        </Button>
        <Button
          variant={selectedTab === 'history' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('history')}
        >
          Reward History
        </Button>
        <Button
          variant={selectedTab === 'leaderboard' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('leaderboard')}
        >
          Leaderboard
        </Button>
      </div>

      {/* Available Rewards */}
      {selectedTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockRewards.map(reward => (
            <Card key={reward.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                  </div>
                  <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Reward Value */}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{reward.points}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{reward.cashback}</div>
                        <div className="text-xs text-gray-600">Cashback</div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => claimReward(reward.id)}>
                      Claim
                    </Button>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {reward.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Participants</span>
                      <div className="font-medium">{reward.participants}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate</span>
                      <div className="font-medium">{reward.completionRate}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reward History */}
      {selectedTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Reward History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reward</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Cashback</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Earned Date</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUserRewards.map(reward => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reward.rewardTitle}</div>
                          <div className="text-sm text-gray-600">{reward.evidence}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(reward.type)}
                          <span className="capitalize">{reward.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-blue-600" />
                          {reward.points}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-green-600" />
                          ₹{reward.cashback}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(reward.status)}>
                          {reward.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(reward.earnedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reward.transactionId ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {reward.transactionId}
                            </code>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {selectedTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Cashback</TableHead>
                    <TableHead>Verifications</TableHead>
                    <TableHead>Reports</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeaderboard.map(user => (
                    <TableRow key={user.rank}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.rank <= 3 && <Trophy className="h-4 w-4 text-yellow-600" />}
                          <span className="font-medium">#{user.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-blue-600" />
                          {user.points}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-green-600" />
                          ₹{user.cashback}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-purple-600" />
                          {user.verifications}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-red-600" />
                          {user.reports}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}