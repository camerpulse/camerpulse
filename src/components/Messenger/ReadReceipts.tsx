import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { cn } from '@/lib/utils';

interface ReadReceiptsProps {
  messageId: string;
  senderId: string;
  currentUserId: string;
  participantCount: number;
  className?: string;
}

export const ReadReceipts: React.FC<ReadReceiptsProps> = ({
  messageId,
  senderId,
  currentUserId,
  participantCount,
  className
}) => {
  const { getMessageReadCount, isMessageReadBy } = useReadReceipts([messageId]);

  // Only show read receipts for own messages
  if (senderId !== currentUserId) {
    return null;
  }

  const readCount = getMessageReadCount(messageId);
  const isReadByCurrentUser = isMessageReadBy(messageId, currentUserId);
  
  // Calculate how many others have read it (excluding sender)
  const othersReadCount = readCount - (isReadByCurrentUser ? 1 : 0);
  const totalOthers = participantCount - 1; // Exclude sender

  const getReceiptState = () => {
    if (othersReadCount === 0) {
      return 'sent'; // Just sent, no reads yet
    } else if (othersReadCount < totalOthers) {
      return 'partial'; // Some have read
    } else {
      return 'all'; // All have read
    }
  };

  const receiptState = getReceiptState();

  const getIconColor = () => {
    switch (receiptState) {
      case 'sent':
        return 'text-muted-foreground';
      case 'partial':
        return 'text-blue-500';
      case 'all':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTooltipText = () => {
    switch (receiptState) {
      case 'sent':
        return 'Sent';
      case 'partial':
        return `Read by ${othersReadCount} of ${totalOthers}`;
      case 'all':
        return 'Read by all';
      default:
        return 'Sent';
    }
  };

  return (
    <div 
      className={cn("flex items-center", className)}
      title={getTooltipText()}
    >
      {receiptState === 'sent' ? (
        <Check className={cn("w-3 h-3", getIconColor())} />
      ) : (
        <CheckCheck className={cn("w-3 h-3", getIconColor())} />
      )}
      {othersReadCount > 0 && (
        <span className={cn("text-xs ml-1", getIconColor())}>
          {othersReadCount}
        </span>
      )}
    </div>
  );
};