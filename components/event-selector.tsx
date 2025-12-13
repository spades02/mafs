"use client"
import React, { useEffect, useState } from 'react'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { UFCEvent } from '@/lib/scraping/types';
import { Command, CommandItem, CommandList } from './ui/command';

function EventSelector() {
    const [events, setEvents] = useState<UFCEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<UFCEvent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/scrape');
          const data = await response.json();
          
          console.log('API Response:', data); // Debug
          
          if (data.error) throw new Error(data.error);
          
          // The response IS the array of events
          setEvents(data);
          
          // Optionally set the first event as selected by default
          if (data.length > 0) {
            setSelectedEvent(data[0]);
          }
        } catch (err: any) {
          console.error('Fetch error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      useEffect(() => {
        fetchEvents();
      }, []);

  return (
    <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              Event
              <span className="text-[10px] text-gray-500 font-normal">(Required)</span>
            </Label>
            <Command>
            <CommandList>
              {(events || []).map((event) => (
                <CommandItem
                  key={event.url} // Use URL as unique key
                  value={event.event}
                  onSelect={() => {
                    setSelectedEvent(event);
                    // Close popover if needed
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{event.event}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.date} • {event.fights.length} fights
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
            </Command>
          </div>
  )
}

export default EventSelector