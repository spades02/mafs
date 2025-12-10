// schemas.ts
import { z } from "zod";

/* ----------------------------- TAPE STUDY ----------------------------- */
export const TapeStudySchema = z.object({
  fight_id: z.string().optional(), // include if you use fight ids
  technical_advantage_master: z.string(),
  confidence_rating: z.enum(["LOW", "MEDIUM", "HIGH"]),
  primary_technical_edges: z.object({
    edges: z.array(z.string()).min(0).max(10), // freeform list items
    vulnerabilities: z.array(z.string()).optional(),
    positioning_weaknesses: z.array(z.string()).optional(),
  }).optional(),
  potential_killing_techniques: z.object({
    primary_ko_mechanism: z.string().optional(),
    primary_ko_setup_conditions: z.string().optional(),
    alternate_submission_path: z.string().optional(),
    ring_control_strategy: z.string().optional(),
  }),
  optimal_strategy_framework: z.string(),
  risk_factors: z.string(),
  durability_and_pace_snapshot: z.object({
    chin_score: z.number().min(0).max(10),
    cardio_score: z.number().min(0).max(10),
    volatility_score: z.number().min(0).max(10),
  }),
});

export type TapeStudyOutput = z.infer<typeof TapeStudySchema>;

/* --------------------------- STATS & TRENDS --------------------------- */
export const StatsTrendSchema = z.object({
  fight_id: z.string().optional(),
  statistical_edge_assessment: z.string(), // fighter name or short label
  confidence_interval: z.object({
    low_pct: z.number().min(0).max(100),
    high_pct: z.number().min(0).max(100),
  }),
  sample_size: z.number().int().nonnegative(),
  quantitative_advantages: z.array(z.object({
    description: z.string(),
    normalized_score: z.number(), // e.g., z-score or 0-1
    percentile_ranking: z.number().min(0).max(100),
    confidence_level_pct: z.number().min(0).max(100).optional(),
  })).optional(),
  performance_prediction_model: z.object({
    expected_outcome_distribution: z.array(z.object({
      fighter: z.string(),
      win_probability_pct: z.number().min(0).max(100),
    })).min(1),
    method_prediction: z.record(z.string(), z.number().min(0).max(100)), // e.g., { "KO/TKO": 40, "Submission": 30, "Decision": 30 }
    duration_projection: z.record(z.string(), z.number().min(0).max(100)), // e.g., {"R1": 10, "R2-3": 40, "Late": 50}
  }),
  statistical_risk_factors: z.string().optional(),
  durability_cardio_metrics: z.object({
    chin_score: z.number().min(0).max(10),
    cardio_score: z.number().min(0).max(10),
  }).optional(),
  finish_probability_curve: z.object({
    finish_prob_r1: z.number().min(0).max(100),
    finish_prob_r2_3: z.number().min(0).max(100),
    finish_prob_late_if5: z.number().min(0).max(100).optional(),
    decision_probability: z.number().min(0).max(100),
  }),
});

export type StatsTrendOutput = z.infer<typeof StatsTrendSchema>;

/* --------------------------- STYLE MATCHUP ---------------------------- */
export const StyleMatchupSchema = z.object({
  fight_id: z.string().optional(),
  style_matchup_assessment: z.enum(["FAVORABLE", "NEUTRAL", "UNFAVORABLE"]),
  combatant_projection: z.string(), // fighter name + short phrase
  compatibility_confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  primary_style_dynamics: z.array(z.object({
    description: z.string(),
    confidence_pct: z.number().min(0).max(100).optional()
  })).optional(),
  strategic_positioning_framework: z.object({
    range_control_strategy: z.string().optional(),
    pace_transition_model: z.string().optional(),
    durability_based_positioning: z.string().optional(),
  }).optional(),
  matchup_specific_risks: z.string().optional(),
  volatility_score: z.number().min(0).max(10),
  recommended_finish_bias: z.enum(["Early Finish Lean","Late Attrition Finish","Decision More Likely but Fragile"]).optional(),
});

export type StyleMatchupOutput = z.infer<typeof StyleMatchupSchema>;

/* ------------------------------ JUDGE AGENT --------------------------- */
/**
 * The Judge agent output is strict JSON per the spec. This schema enforces:
 * - fight predictions array
 * - confidence scores 0-100 integers
 * - explicit finish/decision probabilities
 */
export const JudgePredictionItem = z.object({
  fight_id: z.string(),
  pick: z.string(), // exact fighter name expected upstream
  confidence_score: z.number().int().min(0).max(100),
  risk_flags: z.array(z.string()).optional(),
  path_to_victory: z.string(),
  integrated_finish_probability: z.object({
    ko_tko_pct: z.number().min(0).max(100),
    sub_pct: z.number().min(0).max(100),
    other_finish_pct: z.number().min(0).max(100).optional()
  }),
  decision_probability: z.number().min(0).max(100),
  volatility_score: z.number().min(0).max(100),
  chin_score: z.number().min(0).max(10).optional(),
  cardio_score: z.number().min(0).max(10).optional(),
  confidence_capped: z.boolean().optional(),
  confidence_cap_reason: z.string().optional(),
});

export const JudgeAgentSchema = z.object({
  predictions: z.array(JudgePredictionItem).min(1),
  metadata: z.object({
    generated_at: z.string().optional(),
    model: z.string().optional(),
  }).optional(),
});

export type JudgeAgentOutput = z.infer<typeof JudgeAgentSchema>;

/* ---------------------------- RISK SCORER ----------------------------- */
export const RiskVectorSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  impact_probability_pct: z.number().min(0).max(100).optional(),
  severity_rating: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  mitigation_potential: z.string().optional(),
});

export const RiskScorerSchema = z.object({
  fight_id: z.string().optional(),
  overall_risk_exposure_level: z.enum(["CRITICAL","HIGH","MEDIUM","LOW","MINIMAL"]),
  uncertainty_quantification: z.string(), // e.g., "-15%" or a short explanation
  primary_risk_vectors: z.array(RiskVectorSchema).optional(),
  contingency_action_plan: z.object({
    immediate_response_triggers: z.array(z.string()).optional(),
    strategic_adjustments: z.array(z.string()).optional(),
    information_requirements: z.array(z.string()).optional(),
  }).optional(),
  uncertainty_management_recommendations: z.string().optional(),
  quantified_risk_modifiers: z.object({
    recommended_confidence_reduction_pct: z.number().optional(), // negative or positive numeric
    volatility_adjustment_note: z.string().optional(),
  }).optional(),
});

export type RiskScorerOutput = z.infer<typeof RiskScorerSchema>;

/* ------------------------ CONSISTENCY CHECKER ------------------------- */
export const ValidationModification = z.object({
  id: z.string().optional(),
  correction: z.string(),
  reasoning: z.string().optional(),
  magnitude_pct: z.number().optional(),
});

export const ConsistencyCheckerSchema = z.object({
  prediction_quality_score: z.enum(["EXCELLENT","GOOD","FAIR","POOR"]),
  confidence_adjustment_range: z.string(), // e.g., "AVERAGE ±5 percentage points"
  validation_modifications: z.array(ValidationModification).optional(),
  internal_consistency_score_pct: z.number().min(0).max(100).optional(),
  evidence_quality_alignment: z.string().optional(),
  risk_communication_effectiveness: z.string().optional(),
  final_validation_notes: z.string().optional(),
});

export type ConsistencyCheckerOutput = z.infer<typeof ConsistencyCheckerSchema>;

export const FinalFightSchema = z.object({
  event: z.string(),
  card_summary: z.object({
    most_confident: z.string(),
    live_dogs: z.number(),
    pass_spots: z.number(),
    overall_risk: z.string(),
  }),
  fights: z.object({
      matchup: z.string(),
      pick: z.string(),
      confidence: z.number(),
      path: z.string(),
      alt_lean: z.string().nullable(),
      risk_flags: z.array(z.string()),
      volatility: z.string(),
      no_bet: z.boolean(),
      no_bet_reasons: z.array(z.string()),
      prop_predictions: z.array(
        z.object({
          prop: z.string(),
          confidence: z.number(),
          reason: z.string(),
        })
      ),
      best_outcomes: z.array(
        z.object({
          market: z.string(),
          selection: z.string(),
          model_prob: z.number(),
          market_implied: z.number(),
          edge_pts: z.number(),
          ev_percent: z.number(),
          stake_percent: z.number(),
          confidence: z.number(),
          rationale: z.string(),
        })
      ),
      __agents__: z.array(
        z.object({
          name: z.string(),
          lean: z.string(),
          probability: z.number(),
          notes: z.string(),
        })
      ),
      __consistency__: z.object({
        schema_valid: z.string(),
        logical_checks: z.array(z.string()),
      }),
      __odds_series__: z.array(z.number()),
    }),
});
