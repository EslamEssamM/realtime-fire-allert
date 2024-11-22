// ScreenPage.tsx
import  { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import client from "../client";
import { Screen } from "../types/collections/screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePersistentAudio } from "../hooks/usePersistentAudio";
import alertSound from "../assets/fire-alarm.mp3";

const ScreenPage = () => {
  const { id } = useParams<{ id: string }>();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(true);

  // Use the custom audio hook
  const audio = usePersistentAudio(alertSound);

  // Store the previous screen data to compare changes
  const prevScreenRef = useRef<Screen | null>(null);

  // Fetch function to retrieve the latest screen data
  const fetchScreenData = async () => {
    const { data, error } = await client
      .from("screens")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching screen:", error);
    } else {
      setScreen(data as Screen);
      prevScreenRef.current = data as Screen;
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScreenData();

    // Setup the subscription to listen for updates
    const subscription = client
      .channel("public:screens")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "screens",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updatedScreen = payload.new as Screen;

          // Compare previous and new screen data
          if (
            JSON.stringify(prevScreenRef.current) !==
            JSON.stringify(updatedScreen)
          ) {
            setScreen(updatedScreen);
            prevScreenRef.current = updatedScreen;
          }
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  // Manage audio playback based on state
  useEffect(() => {
    if (screen?.fire_alert && !isMuted && !isAutoplayBlocked) {
      audio?.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else {
      audio?.pause();
      audio.currentTime = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen?.fire_alert, isMuted, isAutoplayBlocked]);

  const handleUserInteraction = () => {
    setIsAutoplayBlocked(false);
    if (screen?.fire_alert && !isMuted) {
      audio?.play();
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted && screen?.fire_alert && !isAutoplayBlocked) {
      audio?.play();
    } else {
      audio?.pause();
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "left":
        return <ArrowLeft className="h-24 w-24" />;
      case "right":
        return <ArrowRight className="h-24 w-24" />;
      case "front":
        return <ArrowUp className="h-24 w-24" />;
      case "back":
        return <ArrowDown className="h-24 w-24" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!screen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">Screen not found.</p>
      </div>
    );
  }

  return (
    <>
      {isAutoplayBlocked && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleUserInteraction}
        >
          <div className="bg-white p-8 rounded-lg text-center shadow-lg">
            <p className="text-xl font-semibold mb-4">Click to allow sound</p>
            <Button onClick={handleUserInteraction}>Allow Sound</Button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen flex items-center justify-center p-8 ${
          screen.fire_alert
            ? "bg-red-100 animate-pulse"
            : "bg-gradient-to-br from-blue-100 to-green-100"
        }`}
      >
        <Card
          className={`w-full max-w-2xl ${
            screen.fire_alert
              ? "bg-red-50 border-red-500 shadow-red-500/50"
              : "bg-white border-blue-200"
          } shadow-2xl rounded-3xl overflow-hidden border-4`}
        >
          <CardHeader
            className={`${
              screen.fire_alert
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-gradient-to-r from-blue-500 to-green-500"
            } p-6`}
          >
            <CardTitle className="text-4xl font-bold text-white text-center flex items-center justify-center">
              {screen.fire_alert && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="mr-4"
                >
                  <AlertTriangle className="h-10 w-10" />
                </motion.div>
              )}
              {screen.name}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={`p-8 ${
              screen.fire_alert ? "text-red-800" : "text-blue-800"
            }`}
          >
            <div className="flex flex-col items-center space-y-8">
              {screen.fire_alert ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-center justify-center w-32 h-32 rounded-full ${
                      screen.fire_alert ? "bg-red-200" : "bg-blue-200"
                    }`}
                  >
                    {getDirectionIcon(screen.direction)}
                  </motion.div>
                  <p className="text-2xl font-semibold capitalize">
                    Direction: {screen.direction}
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <h2 className="text-3xl font-bold mb-4">Message</h2>
                    <p
                      className={`${
                        screen.fire_alert ? "text-4xl" : "text-xl"
                      }`}
                    >
                      {screen.message}
                    </p>
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-3xl font-bold text-red-600 mt-8"
                  >
                    FIRE ALERT ACTIVE
                  </motion.div>
                </>
              ) : (
                <p className="text-4xl font-bold">مرحبا بكم</p>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className={`mt-4 ${
                  screen.fire_alert
                    ? "border-red-500 text-red-500"
                    : "border-blue-500 text-blue-500"
                }`}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default ScreenPage;
