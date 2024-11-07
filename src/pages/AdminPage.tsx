import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScreensContext } from "../contexts/ScreensContext";
import { makeRandomScreen } from "../utils";
import client from "../client";
import { Screen } from "../types/collections/screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  AlertOctagon,
  Edit2,
  Save,
  Monitor,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const navigate = useNavigate();
  const { screens } = useScreensContext();
  const [editScreenId, setEditScreenId] = useState<number | null>(null);
  const [editedScreen, setEditedScreen] = useState<Partial<Screen> | null>(
    null
  );
  const toggleArduino = async (on = true) => {
    // send a request to the Arduino to toggle the fire alert
    const relay = on ? "on" : "off";
    try {
      const response = await fetch(
        `http://192.168.1.108/trigger?relay=${relay}`,
        {
          method: "GET",
          mode: "cors", // This is the default value, but you can explicitly set it
          credentials: "include", // Include credentials if needed
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to toggle Arduino");
      }
    } catch (error) {
      console.error("Error toggling Arduino:", error);
    }
  };
  const createScreen = async () => {
    const newScreen = makeRandomScreen();
    const { error } = await client.from("screens").insert([newScreen]).select();
    if (error) {
      console.error("Error adding screen:", error);
      return;
    }
    // setScreens((prevScreens: Screen[]) => [...prevScreens, data[0]]);
  };

  const activateFireAlert = async () => {
    // check if there is already an active fire alert
    if (screens.every((screen) => screen.fire_alert)) return;
    const { error } = await client
      .from("screens")
      .update({ fire_alert: true })
      .eq("fire_alert", false);
    toggleArduino(true);
    if (error) {
      console.error("Error activating fire alert:", error);
    }
  };

  const deactivateFireAlert = async () => {
    if (!screens.every((screen) => screen.fire_alert)) return;
    const { error } = await client
      .from("screens")
      .update({ fire_alert: false })
      .eq("fire_alert", true);
    if (error) {
      console.error("Error deactivating fire alert:", error);
    }
    toggleArduino(false);
  };

  const handleEditClick = (screen: Screen) => {
    setEditScreenId(screen.id);
    setEditedScreen({ ...screen });
  };

  const handleSave = async () => {
    if (!editedScreen || !editScreenId) return;
    const { error } = await client
      .from("screens")
      .update(editedScreen)
      .eq("id", editScreenId)
      .select();
    if (error) {
      console.error("Error updating screen:", error);
      return;
    }
    // setScreens((prevScreens) =>
    //   prevScreens.map((screen) =>
    //     screen.id === editScreenId ? { ...screen, ...data[0] } : screen
    //   )
    // );
    setEditScreenId(null);
    setEditedScreen(null);
  };

  const handleInputChange = (field: keyof Screen, value: string | boolean) => {
    setEditedScreen((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "left":
        return <ArrowLeft className="h-5 w-5" />;
      case "right":
        return <ArrowRight className="h-5 w-5" />;
      case "front":
        return <ArrowUp className="h-5 w-5" />;
      case "back":
        return <ArrowDown className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Card className="bg-white/80 shadow-2xl rounded-3xl overflow-hidden border-4 border-primary-200">
          <CardHeader className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className=" hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back to Main</span>
              </Button>
              <CardTitle className="text-4xl font-extrabold text-center flex-grow">
                Admin Dashboard
              </CardTitle>
              <div className="w-10" />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={createScreen}
                  className="w-full h-20 text-xl font-bold bg-gradient-to-br from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 rounded-2xl shadow-lg"
                >
                  <Plus className="mr-2 h-8 w-8" /> Create Screen
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={activateFireAlert}
                  className="w-full h-20 text-xl font-bold bg-gradient-to-br from-accent-400 to-accent-600 hover:from-accent-500 hover:to-accent-700 rounded-2xl shadow-lg"
                >
                  <AlertTriangle className="mr-2 h-8 w-8" /> Activate Fire Alert
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={deactivateFireAlert}
                  className="w-full h-20 text-xl font-bold bg-gradient-to-br from-secondary-400 to-secondary-600 hover:from-secondary-500 hover:to-secondary-700  rounded-2xl shadow-lg"
                >
                  <AlertOctagon className="mr-2 h-8 w-8" /> Deactivate Fire
                  Alert
                </Button>
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-primary-800 text-center">
              Manage Screens
            </h2>
            <div className="grid  gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {screens.map((screen: Screen) => (
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-primary-200 hover:border-primary-400 transition-colors">
                      <CardHeader className="bg-gradient-to-br from-primary-400 to-secondary-400 p-4">
                        <CardTitle className="text-xl font-bold  flex items-center">
                          <Monitor className="mr-2 h-6 w-6" />
                          {editScreenId === screen.id ? (
                            <Input
                              type="text"
                              value={editedScreen?.name || ""}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="w-full bg-white/30 border-0  placeholder-white/70 rounded-lg"
                              placeholder="Screen Name"
                            />
                          ) : (
                            screen.name
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-primary-700 font-semibold flex items-center">
                            {getDirectionIcon(screen.direction)}
                            <span className="ml-2">Direction:</span>
                          </span>
                          {editScreenId === screen.id ? (
                            <Select
                              value={editedScreen?.direction || ""}
                              onValueChange={(value) =>
                                handleInputChange("direction", value)
                              }
                            >
                              <SelectTrigger className="w-32 bg-primary-100 border-primary-300 text-primary-700">
                                <SelectValue placeholder="Direction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="front">Front</SelectItem>
                                <SelectItem value="back">Back</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-primary-600 capitalize">
                              {screen.direction}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary-700 font-semibold flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Message:
                          </span>
                          {editScreenId === screen.id ? (
                            <Input
                              type="text"
                              value={editedScreen?.message || ""}
                              onChange={(e) =>
                                handleInputChange("message", e.target.value)
                              }
                              className="w-48 bg-primary-100 border-primary-300 text-primary-700 placeholder-primary-400 rounded-lg"
                              placeholder="Screen Message"
                            />
                          ) : (
                            <span className="text-primary-600">
                              {screen.message}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary-700 font-semibold flex items-center">
                            <Bell className="mr-2 h-5 w-5" />
                            Fire Alert:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              screen.fire_alert
                                ? "bg-accent-500 "
                                : "bg-green-500 "
                            }`}
                          >
                            {screen.fire_alert ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="pt-4">
                          {editScreenId === screen.id ? (
                            <Button
                              onClick={handleSave}
                              className="w-full bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500  rounded-full"
                            >
                              <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => handleEditClick(screen)}
                              className="w-full border-2 border-primary-300 text-primary-600 hover:bg-primary-100 rounded-full"
                            >
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Screen
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {screens.length === 0 && (
              <p className="text-primary-700 text-center py-8 text-xl">
                No screens available.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
