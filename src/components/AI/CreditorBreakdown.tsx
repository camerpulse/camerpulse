import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Sparkles, Building2, Globe, University, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DebtCreditor {
  id: string;
  creditor_name: string;
  creditor_type: string;
  country_code: string | null;
  logo_url: string | null;
  amount_borrowed_fcfa: number;
  amount_borrowed_usd: number;
  loan_purpose: string | null;
  loan_purpose_ai_suggested: boolean;
  date_borrowed: string;
  loan_status: string;
  interest_rate: number | null;
  maturity_date: string | null;
  notes: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: string;
}

export const CreditorBreakdown = () => {
  const { user } = useAuth();
  const [creditors, setCreditors] = useState<DebtCreditor[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<DebtCreditor | null>(null);
  const [formData, setFormData] = useState({
    creditor_name: "",
    creditor_type: "country",
    country_code: "",
    amount_borrowed_fcfa: "",
    amount_borrowed_usd: "",
    loan_purpose: "",
    date_borrowed: "",
    loan_status: "active",
    interest_rate: "",
    maturity_date: "",
    notes: ""
  });

  useEffect(() => {
    fetchCreditors();
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setUserRole(data?.role || null);
  };

  const fetchCreditors = async () => {
    try {
      const { data, error } = await supabase
        .from('debt_creditors')
        .select('*')
        .order('amount_borrowed_fcfa', { ascending: false });

      if (error) throw error;
      setCreditors(data || []);
    } catch (error) {
      console.error('Error fetching creditors:', error);
      toast.error('Failed to load creditor data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const creditorData = {
        creditor_name: formData.creditor_name,
        creditor_type: formData.creditor_type,
        country_code: formData.country_code || null,
        amount_borrowed_fcfa: parseInt(formData.amount_borrowed_fcfa),
        amount_borrowed_usd: parseInt(formData.amount_borrowed_usd),
        loan_purpose: formData.loan_purpose || null,
        date_borrowed: formData.date_borrowed,
        loan_status: formData.loan_status,
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
        maturity_date: formData.maturity_date || null,
        notes: formData.notes || null
      };

      if (editingCreditor) {
        const { error } = await supabase
          .from('debt_creditors')
          .update(creditorData)
          .eq('id', editingCreditor.id);
        
        if (error) throw error;
        toast.success('Creditor updated successfully');
      } else {
        const { error } = await supabase
          .from('debt_creditors')
          .insert([creditorData]);
        
        if (error) throw error;
        toast.success('Creditor added successfully');
      }

      setDialogOpen(false);
      setEditingCreditor(null);
      resetForm();
      fetchCreditors();
    } catch (error) {
      console.error('Error saving creditor:', error);
      toast.error('Failed to save creditor');
    }
  };

  const handleEdit = (creditor: DebtCreditor) => {
    setEditingCreditor(creditor);
    setFormData({
      creditor_name: creditor.creditor_name,
      creditor_type: creditor.creditor_type,
      country_code: creditor.country_code || "",
      amount_borrowed_fcfa: creditor.amount_borrowed_fcfa.toString(),
      amount_borrowed_usd: creditor.amount_borrowed_usd.toString(),
      loan_purpose: creditor.loan_purpose || "",
      date_borrowed: creditor.date_borrowed,
      loan_status: creditor.loan_status,
      interest_rate: creditor.interest_rate?.toString() || "",
      maturity_date: creditor.maturity_date || "",
      notes: creditor.notes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this creditor?')) return;
    
    try {
      const { error } = await supabase
        .from('debt_creditors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Creditor deleted successfully');
      fetchCreditors();
    } catch (error) {
      console.error('Error deleting creditor:', error);
      toast.error('Failed to delete creditor');
    }
  };

  const suggestPurpose = async (creditorName: string, creditorType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('debt-data-scraper', {
        body: { 
          action: 'suggest_purpose',
          creditor_name: creditorName,
          creditor_type: creditorType
        }
      });

      if (error) throw error;
      
      if (data?.suggested_purpose) {
        setFormData(prev => ({
          ...prev,
          loan_purpose: data.suggested_purpose
        }));
        toast.success('AI suggested a loan purpose');
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast.error('Failed to get AI suggestion');
    }
  };

  const resetForm = () => {
    setFormData({
      creditor_name: "",
      creditor_type: "country",
      country_code: "",
      amount_borrowed_fcfa: "",
      amount_borrowed_usd: "",
      loan_purpose: "",
      date_borrowed: "",
      loan_status: "active",
      interest_rate: "",
      maturity_date: "",
      notes: ""
    });
  };

  const formatCurrency = (amount: number, currency = 'FCFA') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(1)}T FCFA`;
    } else if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return '🏛️';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getCreditorTypeIcon = (type: string) => {
    switch (type) {
      case 'country': return <Globe className="h-4 w-4" />;
      case 'multilateral': return <University className="h-4 w-4" />;
      case 'commercial': return <Building2 className="h-4 w-4" />;
      case 'private': return <CreditCard className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'restructured': return 'bg-yellow-100 text-yellow-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creditor Breakdown and Loan Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Creditor Breakdown and Loan Purpose
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed breakdown of Cameroon's debt by creditor with loan purposes and terms
          </p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCreditor(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Creditor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCreditor ? 'Edit Creditor' : 'Add New Creditor'}
                </DialogTitle>
                <DialogDescription>
                  {editingCreditor ? 'Update creditor information and loan details.' : 'Add a new creditor to the debt breakdown.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creditor_name">Creditor Name</Label>
                    <Input
                      id="creditor_name"
                      value={formData.creditor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, creditor_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditor_type">Creditor Type</Label>
                    <Select value={formData.creditor_type} onValueChange={(value) => setFormData(prev => ({ ...prev, creditor_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="multilateral">Multilateral Institution</SelectItem>
                        <SelectItem value="commercial">Commercial Bank</SelectItem>
                        <SelectItem value="private">Private Lender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.creditor_type === 'country' && (
                  <div>
                    <Label htmlFor="country_code">Country Code (ISO 2-letter)</Label>
                    <Input
                      id="country_code"
                      value={formData.country_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., CN, FR, US"
                      maxLength={2}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount_borrowed_fcfa">Amount Borrowed (FCFA)</Label>
                    <Input
                      id="amount_borrowed_fcfa"
                      type="number"
                      value={formData.amount_borrowed_fcfa}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount_borrowed_fcfa: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount_borrowed_usd">Amount Borrowed (USD)</Label>
                    <Input
                      id="amount_borrowed_usd"
                      type="number"
                      value={formData.amount_borrowed_usd}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount_borrowed_usd: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loan_purpose">Purpose of Loan</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => suggestPurpose(formData.creditor_name, formData.creditor_type)}
                      disabled={!formData.creditor_name}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    id="loan_purpose"
                    value={formData.loan_purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, loan_purpose: e.target.value }))}
                    placeholder="Describe the purpose of this loan..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_borrowed">Date Borrowed</Label>
                    <Input
                      id="date_borrowed"
                      type="date"
                      value={formData.date_borrowed}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_borrowed: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan_status">Loan Status</Label>
                    <Select value={formData.loan_status} onValueChange={(value) => setFormData(prev => ({ ...prev, loan_status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="restructured">Restructured</SelectItem>
                        <SelectItem value="defaulted">Defaulted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maturity_date">Maturity Date</Label>
                    <Input
                      id="maturity_date"
                      type="date"
                      value={formData.maturity_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, maturity_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this loan..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCreditor ? 'Update' : 'Add'} Creditor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creditor</TableHead>
                <TableHead>Amount Borrowed</TableHead>
                <TableHead className="min-w-[200px]">Purpose of Loan</TableHead>
                <TableHead>Date Borrowed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Maturity</TableHead>
                {userRole === 'admin' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditors.map((creditor) => (
                <TableRow key={creditor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getCountryFlag(creditor.country_code)}
                        </span>
                        {getCreditorTypeIcon(creditor.creditor_type)}
                      </div>
                      <div>
                        <div className="font-medium">{creditor.creditor_name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {creditor.creditor_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(creditor.amount_borrowed_fcfa)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(creditor.amount_borrowed_usd, 'USD')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm line-clamp-3">
                        {creditor.loan_purpose || 'No purpose specified'}
                      </p>
                      {creditor.loan_purpose_ai_suggested && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(creditor.date_borrowed).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(creditor.loan_status)} border-0`}>
                      {creditor.loan_status.charAt(0).toUpperCase() + creditor.loan_status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {creditor.interest_rate ? `${creditor.interest_rate}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {creditor.maturity_date ? 
                      new Date(creditor.maturity_date).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  {userRole === 'admin' && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(creditor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(creditor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {creditors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No creditor data available. {userRole === 'admin' && 'Add some creditors to get started.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};