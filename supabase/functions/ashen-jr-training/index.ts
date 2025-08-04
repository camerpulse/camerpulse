import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JrAgent {
  id?: string;
  agent_name: string;
  agent_goal: string;
  agent_scope: any;
  personality: string;
  knowledge_sources: string[];
  training_prompt: string;
  system_prompt: string;
  public_interaction_enabled: boolean;
  feedback_loop_enabled: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, agentId, agentData, message, sessionId } = await req.json();

    console.log('Ashen Jr Training Core received request:', { action, agentId });

    switch (action) {
      case 'get_agents': {
        const { data: agents, error } = await supabase
          .from('ashen_jr_agents')
          .select(`
            *,
            ashen_jr_performance!inner(
              accuracy_score,
              feedback_score,
              interactions_count,
              metric_date
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ agents }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create_agent': {
        const agent: JrAgent = agentData;
        
        // Generate system prompt based on goal and personality
        const systemPrompt = generateSystemPrompt(agent.agent_name, agent.agent_goal, agent.personality);
        
        const { data: newAgent, error } = await supabase
          .from('ashen_jr_agents')
          .insert({
            ...agent,
            system_prompt: systemPrompt,
            status: 'training'
          })
          .select()
          .single();

        if (error) throw error;

        // Create initial training session
        await supabase
          .from('ashen_jr_training_sessions')
          .insert({
            agent_id: newAgent.id,
            training_type: 'initial',
            training_prompt: agent.training_prompt,
            training_data: {
              goal: agent.agent_goal,
              scope: agent.agent_scope,
              personality: agent.personality,
              knowledge_sources: agent.knowledge_sources
            },
            status: 'pending'
          });

        return new Response(JSON.stringify({ 
          success: true, 
          agent: newAgent,
          message: `${agent.agent_name} has been created and is ready for training.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'train_agent': {
        if (!agentId) throw new Error('Agent ID is required for training');

        // Update training session status
        const { data: session, error: sessionError } = await supabase
          .from('ashen_jr_training_sessions')
          .update({
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('agent_id', agentId)
          .eq('status', 'pending')
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Simulate training process
        const trainingResults = await simulateTraining(agentId, supabase);

        // Complete training session
        await supabase
          .from('ashen_jr_training_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            training_duration_minutes: Math.floor(Math.random() * 5) + 1,
            performance_metrics: trainingResults
          })
          .eq('id', session.id);

        // Update agent status
        await supabase
          .from('ashen_jr_agents')
          .update({
            status: 'active',
            accuracy_rating: trainingResults.accuracy_score,
            memory_size: trainingResults.knowledge_items_learned
          })
          .eq('id', agentId);

        return new Response(JSON.stringify({ 
          success: true, 
          results: trainingResults,
          message: 'Agent training completed successfully!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'interact_with_agent': {
        if (!agentId || !message) throw new Error('Agent ID and message are required');

        // Get agent data
        const { data: agent, error: agentError } = await supabase
          .from('ashen_jr_agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;

        if (agent.status !== 'active') {
          throw new Error('Agent is not active. Please train the agent first.');
        }

        // Generate response based on agent's personality and training
        const response = await generateAgentResponse(agent, message);

        // Log interaction
        const { data: interaction, error: interactionError } = await supabase
          .from('ashen_jr_interactions')
          .insert({
            agent_id: agentId,
            user_message: message,
            agent_response: response.content,
            response_accuracy: response.confidence,
            context_data: {
              personality: agent.personality,
              knowledge_sources: agent.knowledge_sources
            },
            source_channel: 'admin_panel'
          })
          .select()
          .single();

        if (interactionError) throw interactionError;

        // Update agent activity
        await supabase
          .from('ashen_jr_agents')
          .update({ last_active: new Date().toISOString() })
          .eq('id', agentId);

        return new Response(JSON.stringify({ 
          success: true, 
          response: response.content,
          confidence: response.confidence,
          interaction_id: interaction.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_agent_status': {
        const { status } = agentData;
        
        const { error } = await supabase
          .from('ashen_jr_agents')
          .update({ status })
          .eq('id', agentId);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          message: `Agent status updated to ${status}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_agent_suggestions': {
        const { data: suggestions, error } = await supabase
          .rpc('get_agent_suggestions');

        if (error) throw error;

        return new Response(JSON.stringify({ suggestions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'retrain_agent': {
        if (!agentId) throw new Error('Agent ID is required for retraining');

        // Create retraining session
        await supabase
          .from('ashen_jr_training_sessions')
          .insert({
            agent_id: agentId,
            training_type: 'retrain',
            training_prompt: 'Retrain agent with latest data and feedback',
            training_data: { retrain_reason: 'Performance improvement' },
            status: 'running',
            started_at: new Date().toISOString()
          });

        // Simulate retraining
        const retrainingResults = await simulateTraining(agentId, supabase);

        // Update agent
        await supabase
          .from('ashen_jr_agents')
          .update({
            accuracy_rating: Math.min(1.0, retrainingResults.accuracy_score + 0.1),
            last_active: new Date().toISOString()
          })
          .eq('id', agentId);

        return new Response(JSON.stringify({ 
          success: true, 
          results: retrainingResults,
          message: 'Agent retraining completed!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in ashen-jr-training function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSystemPrompt(agentName: string, goal: string, personality: string): string {
  const personalityMap: Record<string, string> = {
    professional: "You are thorough, factual, and maintain a formal tone. Always provide evidence-based analysis.",
    neutral: "You provide balanced, objective analysis without bias. Focus on facts and data.",
    youth_friendly: "You use accessible language, are encouraging, and relate to young people's concerns.",
    sarcastic: "You provide sharp, witty analysis while remaining informative. Use subtle irony when appropriate.",
    bold: "You are direct, confident, and unafraid to call out issues. Be assertive in your assessments.",
    friendly: "You are warm, approachable, and supportive while remaining informative."
  };

  const personalityTrait = personalityMap[personality] || personalityMap.professional;

  return `You are ${agentName}, a specialized civic AI agent. Your primary goal is: ${goal}

${personalityTrait}

Key responsibilities:
- Analyze civic data within your domain of expertise
- Provide insights based on available data sources
- Maintain accuracy and cite your reasoning
- Adapt your communication style to your assigned personality
- Focus on your specific civic mission

Always remember your specialized role and stay within your domain of expertise.`;
}

async function simulateTraining(agentId: string, supabase: any) {
  // Simulate training process with realistic metrics
  const baseAccuracy = 0.6 + Math.random() * 0.3; // 60-90%
  const knowledgeItems = Math.floor(Math.random() * 50) + 20; // 20-70 items
  
  // Add some knowledge items
  const knowledgeTypes = ['fact', 'pattern', 'response_template', 'context_rule'];
  
  for (let i = 0; i < Math.min(5, knowledgeItems); i++) {
    await supabase
      .from('ashen_jr_knowledge')
      .insert({
        agent_id: agentId,
        knowledge_type: knowledgeTypes[Math.floor(Math.random() * knowledgeTypes.length)],
        knowledge_data: {
          content: `Training knowledge item ${i + 1}`,
          category: 'civic_analysis',
          learned_at: new Date().toISOString()
        },
        confidence_score: 0.7 + Math.random() * 0.3
      });
  }

  return {
    accuracy_score: baseAccuracy,
    knowledge_items_learned: knowledgeItems,
    training_time_minutes: Math.floor(Math.random() * 5) + 1,
    confidence_improvement: Math.random() * 0.2 + 0.1
  };
}

async function generateAgentResponse(agent: any, message: string) {
  // Simulate AI response generation based on agent's training
  const responses = {
    professional: [
      "Based on the available data and analysis,",
      "According to our civic intelligence findings,",
      "The evidence indicates that",
      "Our systematic analysis reveals"
    ],
    youth_friendly: [
      "Hey! So here's what I found:",
      "Great question! Let me break this down:",
      "Totally understand why you're asking!",
      "Here's the deal:"
    ],
    neutral: [
      "The data shows that",
      "Analysis indicates",
      "Based on objective metrics,",
      "The facts suggest"
    ],
    sarcastic: [
      "Well, isn't this interesting...",
      "Oh, you'll love this:",
      "Here's a shocking revelation:",
      "Brace yourself for this groundbreaking insight:"
    ],
    bold: [
      "Let me be clear:",
      "The truth is",
      "Here's what's really happening:",
      "I'll give it to you straight:"
    ],
    friendly: [
      "I'm happy to help with that!",
      "That's a really good question!",
      "I'd love to share what I know:",
      "Thanks for asking!"
    ]
  };

  const personalityResponses = responses[agent.personality as keyof typeof responses] || responses.professional;
  const opener = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  
  const responseContent = `${opener} I'm ${agent.agent_name}, and my analysis of "${message}" relates to ${agent.agent_goal}. 

Based on my training in ${agent.knowledge_sources.join(', ')}, I can provide insights from my specialized civic domain. However, for a complete response, I would need to access real-time data from our civic intelligence systems.

This is a demonstration response showing how I would analyze your query using my ${agent.personality} personality and domain expertise.`;

  return {
    content: responseContent,
    confidence: 0.7 + Math.random() * 0.25
  };
}