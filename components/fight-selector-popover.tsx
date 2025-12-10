"use client";

import React, { useEffect, useState } from 'react'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { useAnalysisStore } from '@/lib/hooks/useAnalysisStore';
import { UFCFight } from '@/lib/scraping/types';

function FightSelectorPopover({
  selectedFightIndex,
  setSelectedFightIndex,
  selectedFight,
  setSelectedFight
}: {
  selectedFightIndex: number | null;
  setSelectedFightIndex: (index: number | null) => void;
  selectedFight: UFCFight | null;
  setSelectedFight: (fight: UFCFight | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [fights, setFights] = useState<UFCFight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFightSelect = (fight: UFCFight) => {
    const index = fights.findIndex((f) => f.fight === fight.fight);
    setSelectedFightIndex(index);
    setOpen(false);
  };  

  const fetchFights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape');
      const data = await response.json();
      
      console.log('API Response:', data); // ADD THIS
      console.log('Fights array:', data.events); // ADD THIS
      
      if (data.error) throw new Error(data.error);
      setFights(data.fights);
      console.log('State updated'); // ADD THIS
    } catch (err:any) {
      console.error('Fetch error:', err); // ADD THIS
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFights();
  }, []);

    const setAnalysisRun = useAnalysisStore((s) => s.setAnalysisRun);
    const setAnalysisRunFalse = () =>{
        setAnalysisRun(false);
      }

  return (
    <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              Matchup
              <span className="text-[10px] text-gray-500 font-normal">(Required)</span>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-slate-950/60 border-foreground/30 text-foreground hover:text-foreground hover:bg-slate-900/60 hover:border-cyan-400/60 focus:border-cyan-400 transition-all h-12 rounded-xl shadow-lg hover:shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-400/50"
                >
                {selectedFightIndex !== null && fights[selectedFightIndex]
                  ? fights[selectedFightIndex].fight
                  : "Search fighters..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-0 bg-slate-900 border-foreground/20 shadow-2xl">
              <Command>
  <CommandInput placeholder="Search fighters..." />

  <CommandList>
    {fights?.map((fight) => (
      <CommandItem
        key={fight.fight}
        value={fight.fight}
        onSelect={() => handleFightSelect(fight)}
      >
        {fight.fight}
      </CommandItem>
    ))}
  </CommandList>
</Command>

              </PopoverContent>
            </Popover>
          </div>
  )
}

export default FightSelectorPopover