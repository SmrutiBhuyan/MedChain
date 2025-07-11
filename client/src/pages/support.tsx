import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, HelpCircle, AlertTriangle, Hospital, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const result = await response.json();
      
      toast({
        title: "Message Sent Successfully",
        description: result.message || "We'll get back to you within 24 hours",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Support & Help Center
        </h1>
        <p className="text-xl text-gray-600">
          Get assistance with MedChain services and report issues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification">Drug Verification Issue</SelectItem>
                    <SelectItem value="counterfeit">Report Counterfeit</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy Registration</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-secondary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I verify a drug?</h3>
                <p className="text-sm text-gray-600">
                  You can verify a drug by scanning its QR code or entering the batch number manually on the verification page.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">What if I find a counterfeit drug?</h3>
                <p className="text-sm text-gray-600">
                  Report immediately using the "Report Counterfeit" option in the contact form. Include all available details like batch number, pharmacy, and photos.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How do I register my pharmacy?</h3>
                <p className="text-sm text-gray-600">
                  Contact our support team with your pharmacy license and registration documents. We'll guide you through the verification process.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Is the emergency stock locator free?</h3>
                <p className="text-sm text-gray-600">
                  Yes, the emergency stock locator is completely free for all users to ensure access to essential medicines.
                </p>
              </div>
              <div className="pb-4">
                <h3 className="font-medium text-gray-900 mb-2">How secure is my data?</h3>
                <p className="text-sm text-gray-600">
                  We use industry-standard encryption and blockchain technology to ensure the highest level of data security and privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Report Counterfeit</h3>
              <p className="text-sm text-gray-600">
                Immediately report suspected counterfeit drugs
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Hospital className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Pharmacy Registration</h3>
              <p className="text-sm text-gray-600">
                Register your pharmacy with MedChain
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Headphones className="h-12 w-12 text-secondary mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Technical Support</h3>
              <p className="text-sm text-gray-600">
                Get help with technical issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-600">support@medchain.com</p>
            </div>
            <div className="text-center">
              <HelpCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Help Center</h3>
              <p className="text-sm text-gray-600">Available 24/7</p>
            </div>
            <div className="text-center">
              <Headphones className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Emergency</h3>
              <p className="text-sm text-gray-600">1-800-MEDCHAIN</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
