import { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { QueryPlanDisplay } from "./QueryPlanDisplay";
import { travelSystemApi } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  plan?: string;
  subQueries?: string[];
}

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your travel assistant. How can I help you plan your trip today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [threadId, setThreadId] = useState(
    `thread-${Date.now()}-${Math.random()}`,
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (
    content: string,
    sender: "user" | "assistant",
    plan?: string,
    subQueries?: string[],
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      plan,
      subQueries,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || inputValue.trim();
    if (!messageToSend) return;

    addMessage(messageToSend, "user");
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await travelSystemApi.sendMessage(
        messageToSend,
        threadId,
        false,
      );

      addMessage(
        response.message,
        "assistant",
        response.plan,
        response.sub_queries,
      );

      // If there's an interrupt, prompt user for response
      if (response.is_interrupt) {
        // Can handle interrupts here if needed
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(
        "Sorry, there was an error processing your request. Please try again.",
        "assistant",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuery = (query: string) => {
    if (isLoading) return;
    handleSendMessage(query);
  };

  const suggestedQueries = [
    "I want to visit Tokyo and Kyoto for 2 weeks. I love culture, food, and gardens.",
    "Plan a 5-day trip to Thailand with beach and culture experiences",
    "I want a romantic getaway to Paris for a week",
    "Family vacation to Singapore with kids-friendly activities",
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Travel Assistant</DrawerTitle>
              <DrawerDescription>
                Plan your trip with AI assistance
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.plan && (
                  <QueryPlanDisplay
                    plan={message.plan}
                    subQueries={message.subQueries}
                  />
                )}
                <div
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <DrawerFooter className="border-t">
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Try these suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuery(query)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {query.length > 50 ? query.substring(0, 50) + "..." : query}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your travel request..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
