import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Plus, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDrugSchema } from "@shared/schema";
import { generateQRData } from "@/lib/qr-utils";
import { z } from "zod";

const addDrugFormSchema = insertDrugSchema.extend({
  name: z.string().min(1, "Drug name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

export default function AddDrug() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [qrData, setQrData] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/admin-login");
    return null;
  }

  const form = useForm<z.infer<typeof addDrugFormSchema>>({
    resolver: zodResolver(addDrugFormSchema),
    defaultValues: {
      name: "",
      manufacturer: "",
      batchNumber: "",
      expiryDate: "",
      category: "",
      strength: "",
      description: "",
      qrCodeUrl: null,
      isCounterfeit: false,
    },
  });

  const addDrugMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addDrugFormSchema>) => {
      const response = await apiRequest("POST", "/api/drugs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drugs"] });
      toast({
        title: "Success",
        description: "Drug added successfully to the system",
      });
      setLocation("/admin-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add drug",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof addDrugFormSchema>) => {
    // Generate QR code data
    const qrCodeData = generateQRData({
      name: data.name,
      batchNumber: data.batchNumber,
      manufacturer: data.manufacturer,
      expiryDate: data.expiryDate,
    });
    
    addDrugMutation.mutate({
      ...data,
      qrCodeUrl: qrCodeData, // Store QR data as URL for now
    });
  };

  // Watch form values to update QR data preview
  const watchedValues = form.watch();
  
  React.useEffect(() => {
    if (watchedValues.name && watchedValues.batchNumber && watchedValues.manufacturer && watchedValues.expiryDate) {
      const qrCodeData = generateQRData({
        name: watchedValues.name,
        batchNumber: watchedValues.batchNumber,
        manufacturer: watchedValues.manufacturer,
        expiryDate: watchedValues.expiryDate,
      });
      setQrData(qrCodeData);
    }
  }, [watchedValues]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin-dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Drug</h1>
        <p className="text-gray-600">
          Register a new drug in the MedChain system with blockchain verification.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drug Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., XYZ Pharmaceuticals" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MED-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pain-relief">Pain Relief</SelectItem>
                          <SelectItem value="antibiotics">Antibiotics</SelectItem>
                          <SelectItem value="vitamins">Vitamins</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength/Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the drug"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* QR Code Generation */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="mr-2 h-5 w-5 text-primary" />
                    QR Code Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        QR code will be automatically generated upon form submission with all drug details.
                      </p>
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">QR Code Preview</p>
                        <p className="text-xs text-gray-500 mt-2">Generated after submission</p>
                      </div>
                    </div>
                    <div>
                      <Label>QR Code Data</Label>
                      <Textarea
                        value={qrData}
                        readOnly
                        rows={6}
                        className="mt-1 bg-gray-100"
                        placeholder="QR code data will be automatically generated based on form inputs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin-dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-blue-700"
                  disabled={addDrugMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addDrugMutation.isPending ? "Adding..." : "Add Drug to System"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
