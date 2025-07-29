import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface RankedChoiceOption {
  id: string;
  text: string;
  rank?: number;
}

interface RankedChoiceVotingProps {
  options: string[];
  onVoteSubmit: (rankings: number[]) => void;
  allowPartialRanking?: boolean;
  disabled?: boolean;
}

export const RankedChoiceVoting: React.FC<RankedChoiceVotingProps> = ({
  options,
  onVoteSubmit,
  allowPartialRanking = false,
  disabled = false
}) => {
  const [rankedOptions, setRankedOptions] = useState<RankedChoiceOption[]>(
    options.map((text, index) => ({ id: index.toString(), text }))
  );
  const [unrankedOptions, setUnrankedOptions] = useState<RankedChoiceOption[]>([]);

  React.useEffect(() => {
    setRankedOptions(options.map((text, index) => ({ id: index.toString(), text })));
  }, [options]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      if (source.droppableId === 'ranked') {
        const items = Array.from(rankedOptions);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
        setRankedOptions(items);
      } else {
        const items = Array.from(unrankedOptions);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
        setUnrankedOptions(items);
      }
    } else {
      // Moving between lists
      if (source.droppableId === 'ranked' && destination.droppableId === 'unranked') {
        const sourceItems = Array.from(rankedOptions);
        const destItems = Array.from(unrankedOptions);
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);
        setRankedOptions(sourceItems);
        setUnrankedOptions(destItems);
      } else if (source.droppableId === 'unranked' && destination.droppableId === 'ranked') {
        const sourceItems = Array.from(unrankedOptions);
        const destItems = Array.from(rankedOptions);
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);
        setUnrankedOptions(sourceItems);
        setRankedOptions(destItems);
      }
    }
  };

  const handleSubmit = () => {
    const rankings = new Array(options.length).fill(0);
    rankedOptions.forEach((option, index) => {
      rankings[parseInt(option.id)] = index + 1;
    });
    onVoteSubmit(rankings);
  };

  const canSubmit = allowPartialRanking || rankedOptions.length === options.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          {allowPartialRanking 
            ? "Drag options to rank them in order of preference. You can leave some unranked."
            : "Drag all options to rank them in order of preference (1st choice at top)."
          }
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ranked Options */}
          <div>
            <h3 className="font-semibold mb-3">Your Rankings</h3>
            <Droppable droppableId="ranked">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  {rankedOptions.map((option, index) => (
                    <Draggable
                      key={option.id}
                      draggableId={option.id}
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-2 cursor-move transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Badge variant="secondary" className="shrink-0">
                                #{index + 1}
                              </Badge>
                              <span className="flex-1">{option.text}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {rankedOptions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Drag options here to rank them
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Unranked Options */}
          {allowPartialRanking && (
            <div>
              <h3 className="font-semibold mb-3">Available Options</h3>
              <Droppable droppableId="unranked">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    {unrankedOptions.map((option, index) => (
                      <Draggable
                        key={option.id}
                        draggableId={option.id}
                        index={index}
                        isDragDisabled={disabled}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-2 cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="flex-1">{option.text}</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {unrankedOptions.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        Unranked options will appear here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </DragDropContext>

      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          size="lg"
        >
          Submit Rankings
        </Button>
      </div>
    </div>
  );
};