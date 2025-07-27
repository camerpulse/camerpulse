import React from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedChatInterface } from "./EnhancedChatInterface";

const EnhancedChatDemo = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Chat Demo</CardTitle>
              <CardDescription>
                Experience the enhanced chat features including file sharing, voice messages, encryption, and AI support bot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Features Available:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 🔒 End-to-end encrypted messaging</li>
                    <li>• 🎤 Voice messages with transcription</li>
                    <li>• 📎 File sharing and uploads</li>
                    <li>• 🤖 AI support bot integration</li>
                    <li>• 🔊 Text-to-speech for bot responses</li>
                    <li>• 💬 Real-time chat interface</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">How to Use:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Type messages in the input field</li>
                    <li>• Click the microphone to record voice messages</li>
                    <li>• Use the paperclip to attach files</li>
                    <li>• Click "Play" on bot responses to hear them</li>
                    <li>• All user messages are encrypted</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedChatInterface className="mx-auto max-w-4xl" />
        </div>
      </div>
    </AppLayout>
  );
};

export default EnhancedChatDemo;