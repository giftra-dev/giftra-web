"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  Gift,
  Heart,
  ShoppingBag,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: GiftSuggestion[];
  timestamp: Date;
}

interface GiftSuggestion {
  id: string;
  name: string;
  price: string;
  description: string;
  matchScore: number;
  category: string;
}

const quickPrompts = [
  {
    icon: Gift,
    label: "Birthday gift ideas",
    prompt: "I need birthday gift ideas for my mom who loves gardening",
  },
  {
    icon: Heart,
    label: "Anniversary gifts",
    prompt: "Suggest romantic anniversary gifts under $100",
  },
  {
    icon: ShoppingBag,
    label: "Last-minute gifts",
    prompt: "I need a last-minute gift that can be delivered quickly",
  },
  {
    icon: User,
    label: "Gift for a friend",
    prompt: "Help me find a gift for my friend who just got a new job",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I&apos;m Gigi, your personal gift-giving assistant. I&apos;m here to help you find the perfect gift for any occasion. Tell me about the person you&apos;re shopping for, and I&apos;ll suggest thoughtful gift ideas tailored just for them!",
    timestamp: new Date(),
  },
];

const sampleSuggestions: GiftSuggestion[] = [
  {
    id: "1",
    name: "Premium Garden Tool Set",
    price: "$65",
    description:
      "Hand-forged stainless steel tools with ash wood handles. Perfect for serious gardeners.",
    matchScore: 95,
    category: "Gardening",
  },
  {
    id: "2",
    name: "Heirloom Seed Collection",
    price: "$45",
    description:
      "Curated collection of 20 organic, heirloom vegetable and flower seeds.",
    matchScore: 92,
    category: "Gardening",
  },
  {
    id: "3",
    name: "Smart Indoor Planter",
    price: "$89",
    description:
      "Self-watering planter with grow lights and app-controlled care reminders.",
    matchScore: 88,
    category: "Tech & Garden",
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "Based on what you&apos;ve told me about your mom&apos;s love for gardening, I&apos;ve found some wonderful gift options that I think she&apos;ll absolutely adore! Here are my top picks:",
      suggestions: sampleSuggestions,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl gradient-primary">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Gigi</h1>
            <p className="text-sm text-muted-foreground">
              Your AI Gift Assistant
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw data-icon="inline-start" />
          New Chat
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <Avatar className="size-8 shrink-0">
                  {message.role === "assistant" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="size-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-muted">
                      <User className="size-4" />
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Content */}
                <div
                  className={`flex max-w-[80%] flex-col gap-3 ${message.role === "user" ? "items-end" : ""}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content.replace(/&apos;/g, "'")}
                    </p>
                  </div>

                  {/* Gift Suggestions */}
                  {message.suggestions && (
                    <div className="w-full space-y-3">
                      {message.suggestions.map((suggestion) => (
                        <Card
                          key={suggestion.id}
                          className="overflow-hidden transition-all hover:shadow-md"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold truncate">
                                    {suggestion.name}
                                  </h4>
                                  <Badge variant="secondary">
                                    {suggestion.category}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {suggestion.description}
                                </p>
                                <div className="mt-3 flex items-center gap-4">
                                  <span className="text-lg font-bold text-primary">
                                    {suggestion.price}
                                  </span>
                                  <div className="flex items-center gap-1 text-sm text-green-600">
                                    <Heart className="size-3 fill-current" />
                                    {suggestion.matchScore}% match
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" className="shrink-0">
                                View
                                <ExternalLink data-icon="inline-end" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Actions for assistant messages */}
                  {message.role === "assistant" && !message.suggestions && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-xs">
                        <Copy className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs">
                        <ThumbsUp className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs">
                        <ThumbsDown className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="border-t border-border py-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Try asking about:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt.prompt)}
                className="gap-2"
              >
                <prompt.icon className="size-4" />
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border pt-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about the person and occasion..."
              className="min-h-[52px] max-h-32 resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-[52px] w-[52px] shrink-0"
          >
            <Send className="size-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Gigi uses AI to provide personalized gift suggestions based on your
          input.
        </p>
      </div>
    </div>
  );
}
