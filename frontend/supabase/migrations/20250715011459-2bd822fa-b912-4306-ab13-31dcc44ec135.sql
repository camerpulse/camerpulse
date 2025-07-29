-- Enhance local context training tables
INSERT INTO camerpulse_intelligence_config (config_key, config_type, config_value, description) VALUES
('cameroon_slang_patterns', 'local_context', '{
  "pidgin": {
    "greetings": ["how far", "how body", "wetin dey happen", "na so"],
    "agreement": ["na so", "true talk", "i agree sotay", "na correct"],
    "disagreement": ["no be so", "wey lie", "dat na wash", "fake news"],
    "emotions": {
      "anger": ["i vex", "anger don catch me", "dis thing pain me", "wetin be dis"],
      "joy": ["i happy sotay", "my heart don full", "na correct thing", "i dey smile"],
      "frustration": ["i don tire", "dis wahala too much", "na wa for dis country"],
      "hope": ["God go help us", "tings go better", "we go see change"]
    }
  },
  "french": {
    "slang": ["wesh", "genre", "franchement", "carrément", "ouais"],
    "politics": ["les politiciens", "le gouvernement", "les élections", "la corruption"],
    "emotions": {
      "anger": ["ça m''énerve", "j''en ai marre", "c''est nul"],
      "joy": ["c''est génial", "super", "formidable", "excellent"],
      "sarcasm": ["bien sûr", "évidemment", "c''est ça"]
    }
  }
}', 'Cameroon-specific slang and expressions'),

('political_figures_dynamic', 'local_context', '{
  "current_officials": {
    "president": ["paul biya", "biya", "le président"],
    "prime_minister": ["joseph dion ngute", "pm", "premier ministre"],
    "ministers": ["fame ndongo", "atanga nji", "mbarga mboa"]
  },
  "opposition": ["maurice kamto", "cabral libii", "akere muna"],
  "nicknames": {
    "paul_biya": ["le lion", "pdb", "boss", "patron"],
    "maurice_kamto": ["président élu", "le professeur"],
    "regime": ["rdpc", "beti-bulu", "système"]
  },
  "political_parties": ["rdpc", "mrc", "univers", "sdf", "undp", "cpdm"]
}', 'Dynamic political figures and nicknames'),

('regional_context', 'local_context', '{
  "regions": {
    "anglophone_crisis": {
      "keywords": ["anglophone", "separatist", "amba", "southern cameroons", "ambazonia", "ghost town"],
      "emotions": ["fear", "anger", "frustration", "hope"],
      "threat_level": "high"
    },
    "northern_security": {
      "keywords": ["boko haram", "kidnapping", "far north", "security", "military"],
      "emotions": ["fear", "anxiety", "concern"],
      "threat_level": "high"
    },
    "economic_centers": {
      "douala": ["port", "business", "economy", "trade"],
      "yaounde": ["government", "administration", "politics"]
    }
  }
}', 'Regional context and crisis awareness'),

('local_memes_culture', 'local_context', '{
  "memes": {
    "political": ["on va faire comment", "cameroun c''est cameroun", "nous sommes ensemble"],
    "social": ["tchouk", "mboko", "benskin", "champion"],
    "sarcasm_markers": ["vraiment?", "serious?", "na wa o", "comment?"]
  },
  "cultural_references": {
    "football": ["lions indomptables", "roger milla", "samuel etoo", "can 2021"],
    "music": ["makossa", "bikutsi", "coupé décalé"],
    "food": ["ndolé", "poulet dg", "koki", "achu"]
  }
}', 'Local memes and cultural references'),

('sentiment_enhancement_rules', 'local_context', '{
  "sarcasm_detection": {
    "patterns": ["évidemment", "bien sûr", "of course", "serious?", "na wa"],
    "context_clues": ["government promises", "election period", "development projects"],
    "invert_sentiment": true
  },
  "idioms": {
    "french": {
      "ça va aller": {"sentiment": "hope", "context": "difficulty"},
      "on va faire comment": {"sentiment": "resignation", "context": "helplessness"}
    },
    "pidgin": {
      "we go see": {"sentiment": "hope", "context": "future"},
      "God dey": {"sentiment": "faith", "context": "hardship"}
    }
  },
  "threat_escalation": {
    "keywords_multiplier": {
      "violence": 2.0,
      "kill": 3.0,
      "bomb": 3.0,
      "separatist": 1.5,
      "boko haram": 2.5
    }
  }
}', 'Enhanced sentiment analysis rules'),

('learning_feedback_system', 'system', '{
  "auto_learning": true,
  "feedback_sources": ["user_corrections", "context_analysis", "regional_patterns"],
  "update_frequency": "daily",
  "confidence_threshold": 0.8
}', 'AI learning and improvement system')

ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now(),
  description = EXCLUDED.description;