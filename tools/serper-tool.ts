import { tool } from "ai";
import { z } from "zod";

export const serperTool = tool({
    name: "serper_search",
    description: "Search recent fight footage, breakdowns, and commentary.",
    inputSchema: z.object({
        query: z.string().describe("The query to search for."),
    }),
    execute: async ({ query }: { query: string }) => {
      const res = await fetch("https://serper.dev/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.SERPER_API_KEY as string,
        },
        body: JSON.stringify({ q: query }),
      });
      return await res.json();
    },
  });