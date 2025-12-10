import { ConsistencyCheckerSchema, FinalFightSchema, JudgeAgentSchema, RiskScorerSchema, StatsTrendSchema, StyleMatchupSchema, TapeStudySchema } from '@/lib/agents/output-schemas';
import { CONSISTENCY_CHECKER_PROMPT, JUDGE_PROMPT, MARKET_ODDS_PROMPT, NEWS_WEIGHINS_PROMPT, RISK_SCORER_PROMPT, STATS_TRENDS_PROMPT, STYLE_MATCHUP_PROMPT, TAPE_STUDY_PROMPT } from '@/lib/agents/prompts';
import { generateText, generateObject, tool } from 'ai';
import { z } from 'zod';

// Example: Parallel code review with multiple specialized reviewers
async function Agents(matchup: string) {

  // Run parallel reviews
  const [tapeStudyResult, statsResult, newsResult, styleMatchupResult, marketOddsResult ] =
    await Promise.all([
      generateText({
        model: 'anthropic/claude-3.7-sonnet',
        system: TAPE_STUDY_PROMPT,
        prompt: `Analyze this fight:
      ${matchup}`,
      }),

      generateText({
        model: 'openai/gpt-5',
        system: STATS_TRENDS_PROMPT,
        prompt: `Extract meaningful statistical insights from fighter data and compute outcome tendencies using rigorous data science methods for this fight:
      ${matchup}`,
      }),

      generateText({
        model: 'google/gemini-2.5-pro',
        system: NEWS_WEIGHINS_PROMPT,
        tools:{
          serper: tool({
            description: "Fetch news about the fight or fighters involved",
            inputSchema: z.object({
              fight: z.string().describe('The fight to get the news for.'),
            })
          })
        },
        prompt: `Analyze this fight:
      ${matchup}`,
      }),

      generateText({
        model: 'anthropic/claude-3.7-sonnet',
        system: STYLE_MATCHUP_PROMPT,
        prompt: `Analyze this fight:
      ${matchup}`,
      }),

      generateText({
        model: 'openai/gpt-5',
        system: MARKET_ODDS_PROMPT,
        prompt: `Analyze this fight:
      ${matchup}`,
      }),
    ]);

  const reviews = [
    { ...tapeStudyResult },
    { ...statsResult },
    { ...newsResult },
    { ...styleMatchupResult },
    { ...marketOddsResult }
  ];

  // Aggregate results using another model instance
  const { text: judgeResult } = await generateText({
    model: 'google/gemini-2.5-pro',
    system: JUDGE_PROMPT,
    prompt: `Synthesize these diverse evidence streams using weighted Bayesian reasoning:
    ${JSON.stringify(reviews, null, 2)}`
  });


  const { text: riskScore } = await generateText({
    model: 'deepseek/deepseek-r1',
    system: RISK_SCORER_PROMPT,
    prompt: `In the context of this fight: ${matchup}, Use the following Judge Agent output:
    ${JSON.stringify(judgeResult, null, 2)}`
  });
  
  const { text: consistency } = await generateText({
    model: 'anthropic/claude-3.5-haiku',
    system: CONSISTENCY_CHECKER_PROMPT,
    prompt: `Review these fight predictions for consistency and adjust confidence scores if needed:
    ${JSON.stringify(riskScore, null, 2)}`,
  });
  
  const { object: finalOutput } = await generateObject({
    model: "gpt-5",
    system: `You are a data entry specialist and have 15 years of experience working with JSON data manipulation`,
    schema: FinalFightSchema,
    prompt: `
  Merge the following agent outputs into the *single final JSON* for THIS ONE FIGHT.
  You must follow the FinalFightSchema exactly.
  
  Fight metadata:
  ${JSON.stringify(matchup, null, 2)}
  
  Tape Study:
  ${JSON.stringify(tapeStudyResult, null, 2)}
  
  Stats & Trends:
  ${JSON.stringify(statsResult, null, 2)}
  
  News / Weigh-ins:
  ${JSON.stringify(newsResult, null, 2)}
  
  Style Matchup:
  ${JSON.stringify(styleMatchupResult, null, 2)}
  
  Market / Odds:
  ${JSON.stringify(marketOddsResult, null, 2)}
  
  Judge (Fuser):
  ${JSON.stringify(judgeResult, null, 2)}
  
  Risk / Volatility:
  ${JSON.stringify(riskScore, null, 2)}
  
  Outcome Optimizer:
  ${JSON.stringify(consistency, null, 2)}
  `,
  });
  return { finalOutput };
  
}

export default Agents;