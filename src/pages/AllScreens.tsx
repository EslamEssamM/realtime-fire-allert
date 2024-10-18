import { useNavigate } from "react-router-dom";
import { useScreensContext } from "../contexts/ScreensContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";

const ScreenSelectionPage = () => {
  const { screens } = useScreensContext();
  const navigate = useNavigate();

  const handleScreenSelect = (screenId: number) => {
    navigate(`/screen/${screenId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-white shadow-xl rounded-3xl overflow-hidden border-4 border-blue-200">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
              Select a Screen
            </h1>
            {screens.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {screens.map((screen) => (
                  <motion.div
                    key={screen.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-32 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 border-2 border-blue-300 text-blue-800 rounded-xl transition-all duration-200 ease-in-out"
                      onClick={() => handleScreenSelect(screen.id)}
                    >
                      <Monitor className="h-8 w-8" />
                      <span className="text-lg font-semibold">
                        {screen.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getDirectionIcon(screen.direction)}
                        <span className="capitalize">{screen.direction}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xl text-blue-800 text-center py-8">
                No screens available for selection.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ScreenSelectionPage;
