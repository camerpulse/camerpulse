import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewItem {
  id: string;
  run_id: string;
  table_name: string;
  record_id: string;
  reason: string;
  matched_column?: string | null;
  matched_text?: string | null;
  created_at?: string;
}

export const CleanupReviewManager: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [runId, setRunId] = useState("");
  const [tableName, setTableName] = useState("");
  const [reason, setReason] = useState("");

  const [pattern, setPattern] = useState("");
  const [patternDesc, setPatternDesc] = useState("");

  const filters = useMemo(() => ({
    run_id: runId || undefined,
    table_name: tableName || undefined,
    reason: reason || undefined,
  }), [runId, tableName, reason]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cleanup-review", {
        body: { action: "list", filters, limit, offset },
      });
      if (error) throw error;
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e: any) {
      console.error("Failed to load review items", e);
      toast({
        title: "Failed to load",
        description: e?.message || "Could not load review items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const addWhitelist = async () => {
    if (!pattern.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("cleanup-review", {
        body: { action: "add_whitelist", pattern: pattern.trim(), description: patternDesc || undefined },
      });
      if (error) throw error;
      setPattern("");
      setPatternDesc("");
      toast({ title: "Whitelist added", description: "Pattern added successfully." });
    } catch (e: any) {
      console.error("Failed to add whitelist pattern", e);
      toast({ title: "Error", description: e?.message || "Failed to add whitelist.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const keepItem = async (item: ReviewItem) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("cleanup-review", {
        body: { action: "add_keep", table_name: item.table_name, record_id: item.record_id, reason: item.reason },
      });
      if (error) throw error;
      await resolveItem(item.id, false); // remove from queue after keeping
      toast({ title: "Kept ID", description: `Record ${item.record_id} kept and removed from review.` });
      setLoading(false);
    } catch (e: any) {
      console.error("Failed to keep id", e);
      toast({ title: "Error", description: e?.message || "Failed to keep ID.", variant: "destructive" });
      setLoading(false);
    }
  };
  const resolveItem = async (id: string, resetLoading = true) => {
    if (resetLoading) setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("cleanup-review", {
        body: { action: "resolve", review_item_id: id },
      });
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (resetLoading) {
        toast({ title: "Item resolved", description: "Review item removed." });
      }
    } catch (e: any) {
      console.error("Failed to resolve item", e);
      if (resetLoading) {
        toast({ title: "Error", description: e?.message || "Failed to resolve item.", variant: "destructive" });
      }
    } finally {
      if (resetLoading) setLoading(false);
    }
  };
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cleanup Review Queue</h2>
        <p className="text-muted-foreground">Admin-only tools to review and manage cleanup candidates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter review items by run, table, or reason</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Run ID" value={runId} onChange={(e) => setRunId(e.target.value)} />
          <Input placeholder="Table name" value={tableName} onChange={(e) => setTableName(e.target.value)} />
          <Input placeholder="Reason (pattern|orphan|duplicate)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button onClick={() => { setOffset(0); loadItems(); }} disabled={loading}>Apply</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Whitelist Patterns</CardTitle>
          <CardDescription>Add a pattern to exclude legitimate matches</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="SQL ILIKE pattern e.g. %testimony%" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          <Input placeholder="Description (optional)" value={patternDesc} onChange={(e) => setPatternDesc(e.target.value)} />
          <Button onClick={addWhitelist} disabled={loading || !pattern.trim()}>Add to whitelist</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Items</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${items.length} item(s) • total ${total}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.table_name}</Badge>
                    <Badge variant="secondary">{item.reason}</Badge>
                    {item.matched_column && <Badge variant="outline">{item.matched_column}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground break-all">
                    id: {item.id} • record: {item.record_id}
                  </div>
                  {item.matched_text && (
                    <div className="text-sm line-clamp-2 text-muted-foreground">{item.matched_text}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => keepItem(item)} disabled={loading}>Keep ID</Button>
                  <Button variant="destructive" onClick={() => resolveItem(item.id)} disabled={loading}>Resolve</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={loading || offset === 0}>Previous</Button>
            <Button variant="outline" onClick={() => setOffset(offset + limit)} disabled={loading || offset + limit >= total}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
