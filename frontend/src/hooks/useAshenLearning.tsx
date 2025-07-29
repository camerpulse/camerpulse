import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatchHistory {
  id: string;
  patch_id: string;
  file_path: string;
  patch_type: string;
  outcome: string;
  fix_trust_score: number;
  created_at: string;
  admin_feedback?: string;
  rollback_reason?: string;
}

interface StylePattern {
  id: string;
  pattern_category: string;
  pattern_description: string;
  pattern_example: any;
  confidence_score: number;
  usage_frequency: number;
}

interface TrustMetric {
  id: string;
  fix_type: string;
  current_trust_score: number;
  total_attempts: number;
  successful_fixes: number;
  rollbacks: number;
  trend_direction: string;
}

interface PersonalPatch {
  id: string;
  pattern_name: string;
  problem_signature: string;
  solution_template: string;
  success_rate: number;
  usage_count: number;
  admin_approved: boolean;
}

interface UnstablePattern {
  id: string;
  pattern_signature: string;
  pattern_description: string;
  failure_count: number;
  rollback_count: number;
  is_permanently_blocked: boolean;
  blocked_until?: string;
}

interface LearningInsights {
  patchHistory: PatchHistory[];
  stylePatterns: StylePattern[];
  trustMetrics: TrustMetric[];
  personalPatches: PersonalPatch[];
  unstablePatterns: UnstablePattern[];
}

export const useAshenLearning = () => {
  const [insights, setInsights] = useState<LearningInsights>({
    patchHistory: [],
    stylePatterns: [],
    trustMetrics: [],
    personalPatches: [],
    unstablePatterns: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const callLearningEngine = useCallback(async (action: string, data?: any) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('ashen-learning-engine', {
        body: { action, ...data }
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error calling learning engine:', error);
      throw error;
    }
  }, []);

  const recordPatchFeedback = useCallback(async (
    patchId: string, 
    outcome: 'accepted' | 'edited' | 'rolled_back',
    adminFeedback?: string,
    responseTimeSeconds?: number,
    rollbackReason?: string
  ) => {
    return await callLearningEngine('record_patch_feedback', {
      patchId,
      outcome,
      adminFeedback,
      responseTimeSeconds,
      rollbackReason
    });
  }, [callLearningEngine]);

  const learnFromManualFix = useCallback(async (
    filePath: string,
    originalCode: string,
    fixedCode: string,
    problemDescription: string
  ) => {
    return await callLearningEngine('learn_from_manual_fix', {
      filePath,
      originalCode,
      fixedCode,
      problemDescription
    });
  }, [callLearningEngine]);

  const analyzeCodeStyle = useCallback(async (code: string, filePath: string) => {
    return await callLearningEngine('analyze_code_style', {
      code,
      filePath
    });
  }, [callLearningEngine]);

  const getLearningInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await callLearningEngine('get_learning_insights');
      setInsights(result);
      return result;
    } catch (error) {
      console.error('Error getting learning insights:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callLearningEngine]);

  const calculateTrustScores = useCallback(async () => {
    return await callLearningEngine('calculate_trust_scores');
  }, [callLearningEngine]);

  const getRecommendedPatterns = useCallback(async (problemType: string, filePath: string) => {
    return await callLearningEngine('get_recommended_patterns', {
      problemType,
      filePath
    });
  }, [callLearningEngine]);

  const blockUnstablePattern = useCallback(async (
    patternSignature: string,
    reason: string,
    permanently = false
  ) => {
    return await callLearningEngine('block_unstable_pattern', {
      patternSignature,
      reason,
      permanently
    });
  }, [callLearningEngine]);

  const resetLearningMemory = useCallback(async () => {
    const result = await callLearningEngine('reset_learning_memory');
    // Clear local state after reset
    setInsights({
      patchHistory: [],
      stylePatterns: [],
      trustMetrics: [],
      personalPatches: [],
      unstablePatterns: []
    });
    return result;
  }, [callLearningEngine]);

  return {
    insights,
    isLoading,
    recordPatchFeedback,
    learnFromManualFix,
    analyzeCodeStyle,
    getLearningInsights,
    calculateTrustScores,
    getRecommendedPatterns,
    blockUnstablePattern,
    resetLearningMemory
  };
};