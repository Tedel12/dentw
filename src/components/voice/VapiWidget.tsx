"use client";

import { vapi } from "@/lib/vapi";
import { APP_NAME } from "@/lib/brand";
import { VAPI_ASSISTANT_OVERRIDES } from "@/lib/vapi-prompt";
import { useUser } from "@clerk/nextjs";
import { HeartPulse, X, Mic, Send, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function VapiWidget() {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  const { user, isLoaded } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.error("Vapi Error:", error);
      toast.error("Erreur de connexion vocale. Vérifiez votre micro.");
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) vapi.stop();
    else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        if (!assistantId) throw new Error("Assistant Vapi non configuré");
        await vapi.start(assistantId, VAPI_ASSISTANT_OVERRIDES);
      } catch (error: any) {
        console.error("Vapi start error:", error);
        toast.error("Échec de l'appel : " + (error.message || "Erreur inconnue"));
        setConnecting(false);
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col overflow-hidden pb-10 md:pb-20">
      {/* TITLE */}
      <div className="text-center mb-8 md:mb-12 animate-in fade-in duration-700">
        <h1 className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-tight">
          <span>Parlez à votre </span><br className="md:hidden" />
          <span className="text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.3)]">Assistant IA</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-lg mt-3 font-medium italic max-w-lg mx-auto leading-relaxed px-4">
          Orientation, prévention et conseils généraux 24/7.
        </p>
      </div>

      {/* VIDEO CALL AREA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
        {/* AI ASSISTANT CARD */}
        <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 rounded-[2rem] overflow-hidden relative shadow-2xl group">
          <div className="aspect-square sm:aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div className={`absolute inset-0 ${isSpeaking ? "opacity-30" : "opacity-0"} transition-opacity duration-500`}>
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20 gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isSpeaking ? [20, 60, 30, 80, 20] : 4 }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* AI LOGO */}
            <div className="relative size-24 md:size-32 mb-4 group-hover:scale-110 transition-transform duration-700">
              <div className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-xl ${isSpeaking ? "animate-pulse" : ""}`} />
              <div className="relative w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/5 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50"></div>
                <HeartPulse className="w-10 h-10 md:w-14 md:h-14 text-primary relative z-10" />
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight">{APP_NAME} IA</h2>
            <p className="text-[10px] md:text-sm text-primary font-bold uppercase tracking-widest mt-1">Assistante santé</p>

            {/* STATUS INDICATOR */}
            <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5 ${isSpeaking ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-primary animate-pulse" : callActive ? "bg-emerald-500" : "bg-slate-700"}`} />
              <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tight">
                {isSpeaking ? "En cours..." : callActive ? "En écoute..." : callEnded ? "Appel terminé" : "En attente"}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 rounded-[2rem] overflow-hidden relative shadow-2xl">
          <div className="aspect-square sm:aspect-video flex flex-col items-center justify-center p-6 relative">
            <div className="relative size-24 md:size-32 mb-4 ring-4 ring-white/5 rounded-full overflow-hidden shadow-2xl">
              <Image
                src={user?.imageUrl!}
                alt="User"
                width={128}
                height={128}
                className="size-full object-cover"
              />
            </div>

            <h2 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight truncate max-w-full px-4">
              {user ? user.firstName : "Vous"}
            </h2>
            
            <div className="mt-4 flex items-center gap-2 px-4 py-1 rounded-full bg-black/40 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tight">Prêt</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MESSAGE CONTAINER */}
      <AnimatePresence>
        {messages.length > 0 && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={messageContainerRef}
            className="w-full bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-5 md:p-8 mb-8 h-48 md:h-64 overflow-y-auto transition-all duration-500 scroll-smooth custom-scrollbar shadow-inner"
            >
            <div className="space-y-5">
                {messages.map((msg, index) => (
                <div key={index} className="message-item animate-in slide-in-from-bottom-2 duration-300">
                    <div className={`font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-1.5 ${msg.role === 'assistant' ? 'text-primary' : 'text-slate-500'}`}>
                    {msg.role === "assistant" ? `${APP_NAME} IA` : "Vous"}:
                    </div>
                    <p className={`text-xs md:text-base leading-relaxed ${msg.role === 'assistant' ? 'text-slate-200 italic font-medium' : 'text-white font-bold'}`}>
                        {msg.content}
                    </p>
                </div>
                ))}

                {callEnded && (
                <div className="message-item p-4 bg-white/5 rounded-2xl border border-white/5 animate-in zoom-in duration-300">
                    <div className="font-black text-[10px] text-primary mb-1 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="size-3" /> Système
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Session archivée. Merci d&apos;avoir utilisé {APP_NAME} IA.</p>
                </div>
                )}
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* CALL CONTROLS */}
      <div className="w-full flex justify-center gap-4">
        <Button
          size="lg"
          className={`h-14 md:h-16 w-48 md:w-56 text-base md:text-xl font-black italic rounded-[1.5rem] md:rounded-[2rem] shadow-2xl transition-all duration-300 ${
            callActive
              ? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
              : callEnded
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-primary hover:bg-primary/90 shadow-primary/20"
          } text-white relative`}
          onClick={toggleCall}
          disabled={connecting || (callEnded && messages.length > 0)}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 opacity-75"></span>
          )}

          <div className="flex items-center gap-3">
              {callActive ? <X className="size-5 md:size-6" /> : <Mic className="size-5 md:size-6" />}
              <span>
                {callActive
                ? "RACCHROCHER"
                : connecting
                ? "CONNEXION..."
                : callEnded
                ? "FIN SESSION"
                : "DÉMARRER"}
              </span>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default VapiWidget;
