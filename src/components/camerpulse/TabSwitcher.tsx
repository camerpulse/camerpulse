import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tab { id: string; label: string; content: React.ReactNode; }
interface TabSwitcherProps { tabs: Tab[]; defaultTab?: string; className?: string; }

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, defaultTab, className }) => (
  <Tabs defaultValue={defaultTab || tabs[0]?.id} className={className}>
    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>)}
    </TabsList>
    {tabs.map(tab => <TabsContent key={tab.id} value={tab.id}>{tab.content}</TabsContent>)}
  </Tabs>
);