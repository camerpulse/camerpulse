import React from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EnhancedChatDemo = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Enhanced Chat Demo</CardTitle>
            <CardDescription>
              Experience the enhanced chat features including file sharing, voice messages, encryption, and AI support bot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Enhanced chat features will be displayed here once the OpenAI API key is configured.</p>
              <p className="text-sm text-muted-foreground mt-2">This demo includes file sharing, voice messages, encryption, and AI support bot integration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EnhancedChatDemo;