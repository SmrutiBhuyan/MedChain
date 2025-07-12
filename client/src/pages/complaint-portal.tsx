import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, CheckCircle, FileText, Building, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const complaintSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  drugName: z.string().min(1, "Drug name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  pharmacyName: z.string().optional(),
  pharmacyAddress: z.string().optional(),
  pharmacyContact: z.string().optional(),
  complaintType: z.string().min(1, "Complaint type is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  reporterName: z.string().min(1, "Your name is required"),
  reporterEmail: z.string().email("Valid email is required"),
  reporterPhone: z.string().optional(),
  incidentDate: z.string().min(1, "Incident date is required"),
  evidenceDescription: z.string().optional(),
  urgencyLevel: z.string().min(1, "Urgency level is required"),
});

type ComplaintData = z.infer<typeof complaintSchema>;

const COMPLAINT_TYPES = [
  "Counterfeit Drug Detection",
  "Packaging Tampering",
  "Suspected Quality Issues",
  "Expired Product Sold",
  "Incorrect Labeling",
  "Adverse Drug Reaction",
  "Fraudulent Pharmacy",
  "Supply Chain Violation",
  "Other Safety Concern"
];

const URGENCY_LEVELS = [
  { value: "critical", label: "Critical - Immediate Action Required" },
  { value: "high", label: "High - Within 24 Hours" },
  { value: "medium", label: "Medium - Within 3 Days" },
  { value: "low", label: "Low - Within 1 Week" }
];

export default function ComplaintPortal() {
  const [location] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Parse URL parameters for auto-filling
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const autoFillData = {
    batchNumber: urlParams.get('batchNumber') || '',
    drugName: urlParams.get('drugName') || '',
    manufacturer: urlParams.get('manufacturer') || '',
    pharmacyName: urlParams.get('pharmacyName') || '',
    pharmacyAddress: urlParams.get('pharmacyAddress') || '',
    pharmacyContact: urlParams.get('pharmacyContact') || '',
    complaintType: urlParams.get('complaintType') || 'Counterfeit Drug Detection',
    urgencyLevel: urlParams.get('urgencyLevel') || 'critical',
  };

  const form = useForm<ComplaintData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      batchNumber: autoFillData.batchNumber,
      drugName: autoFillData.drugName,
      manufacturer: autoFillData.manufacturer,
      pharmacyName: autoFillData.pharmacyName,
      pharmacyAddress: autoFillData.pharmacyAddress,
      pharmacyContact: autoFillData.pharmacyContact,
      complaintType: autoFillData.complaintType,
      description: autoFillData.batchNumber ? `URGENT: Counterfeit drug detected with batch number ${autoFillData.batchNumber}. This medicine failed verification and poses serious health risks.` : '',
      reporterName: "",
      reporterEmail: "",
      reporterPhone: "",
      incidentDate: new Date().toISOString().split('T')[0],
      evidenceDescription: "",
      urgencyLevel: autoFillData.urgencyLevel,
    },
  });

  const complaintMutation = useMutation({
    mutationFn: async (data: ComplaintData) => {
      const response = await apiRequest("POST", "/api/complaints", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      toast({
        title: "Complaint Submitted Successfully",
        description: `Your complaint has been registered with ID: ${data.complaintId}. We will investigate immediately.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComplaintData) => {
    complaintMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="mr-2 h-6 w-6" />
              Complaint Submitted Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700">
            <p className="mb-4">
              Thank you for reporting this critical safety issue. Your complaint has been registered and our investigation team has been notified.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Immediate investigation will be launched within 2 hours</li>
                <li>Affected batch will be flagged in our system</li>
                <li>Relevant authorities will be notified</li>
                <li>You will receive updates via email</li>
                <li>If urgent, our team may contact you directly</li>
              </ul>
            </div>
            <div className="text-sm text-green-600">
              <p><strong>Emergency Contact:</strong> +91-1800-XXX-XXXX (24/7 Hotline)</p>
              <p><strong>Email:</strong> complaints@medchain.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-600 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Drug Safety Complaint Portal
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-4">
          Report counterfeit drugs and safety concerns to protect public health
        </p>
        {autoFillData.batchNumber && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-semibold">
                Counterfeit Drug Auto-Detected: Batch {autoFillData.batchNumber}
              </span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              This form has been pre-filled with the detected counterfeit information. Please review and submit.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Drug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Drug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  {...form.register("batchNumber")}
                  className="mt-1"
                  placeholder="Enter batch number"
                />
                {form.formState.errors.batchNumber && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.batchNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="drugName">Drug Name *</Label>
                <Input
                  id="drugName"
                  {...form.register("drugName")}
                  className="mt-1"
                  placeholder="Enter drug name"
                />
                {form.formState.errors.drugName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.drugName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                {...form.register("manufacturer")}
                className="mt-1"
                placeholder="Enter manufacturer name"
              />
              {form.formState.errors.manufacturer && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.manufacturer.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-green-600" />
              Pharmacy/Source Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pharmacyName">Pharmacy Name</Label>
              <Input
                id="pharmacyName"
                {...form.register("pharmacyName")}
                className="mt-1"
                placeholder="Enter pharmacy name"
              />
            </div>
            <div>
              <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
              <Input
                id="pharmacyAddress"
                {...form.register("pharmacyAddress")}
                className="mt-1"
                placeholder="Enter pharmacy address"
              />
            </div>
            <div>
              <Label htmlFor="pharmacyContact">Pharmacy Contact</Label>
              <Input
                id="pharmacyContact"
                {...form.register("pharmacyContact")}
                className="mt-1"
                placeholder="Enter pharmacy contact number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Complaint Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complaintType">Complaint Type *</Label>
                <Select onValueChange={(value) => form.setValue("complaintType", value)} defaultValue={form.getValues("complaintType")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select complaint type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.complaintType && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.complaintType.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                <Select onValueChange={(value) => form.setValue("urgencyLevel", value)} defaultValue={form.getValues("urgencyLevel")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.urgencyLevel && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.urgencyLevel.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                className="mt-1"
                rows={4}
                placeholder="Provide detailed description of the issue, including symptoms, observations, and concerns"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="incidentDate">Date of Incident *</Label>
              <Input
                id="incidentDate"
                type="date"
                {...form.register("incidentDate")}
                className="mt-1"
              />
              {form.formState.errors.incidentDate && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.incidentDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="evidenceDescription">Evidence Description</Label>
              <Textarea
                id="evidenceDescription"
                {...form.register("evidenceDescription")}
                className="mt-1"
                rows={3}
                placeholder="Describe any evidence you have (photos, packaging, receipts, etc.)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-purple-600" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reporterName">Your Name *</Label>
                <Input
                  id="reporterName"
                  {...form.register("reporterName")}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
                {form.formState.errors.reporterName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.reporterName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="reporterEmail">Email Address *</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  {...form.register("reporterEmail")}
                  className="mt-1"
                  placeholder="Enter your email address"
                />
                {form.formState.errors.reporterEmail && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.reporterEmail.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="reporterPhone">Phone Number</Label>
              <Input
                id="reporterPhone"
                {...form.register("reporterPhone")}
                className="mt-1"
                placeholder="Enter your phone number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            disabled={complaintMutation.isPending}
          >
            {complaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
          </Button>
          <p className="text-sm text-gray-600 mt-4">
            By submitting this complaint, you acknowledge that the information provided is accurate and you may be contacted for follow-up.
          </p>
        </div>
      </form>
    </div>
  );
}