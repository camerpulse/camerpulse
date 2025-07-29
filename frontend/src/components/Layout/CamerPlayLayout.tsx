import { ReactNode } from 'react';
import { CamerPlayHeader } from './CamerPlayHeader';
import { CamerPlayFooter } from './CamerPlayFooter';

interface CamerPlayLayoutProps {
  children: ReactNode;
}

export const CamerPlayLayout = ({ children }: CamerPlayLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CamerPlayHeader />
      
      <main className="flex-1">
        {children}
      </main>
      
      <CamerPlayFooter />
    </div>
  );
};