import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Screen } from "../types/collections/screen";

// Custom hook for managing screens
export const useScreens = (client: SupabaseClient) => {
  const [screens, setScreens] = useState<Screen[]>([]);

  // Fetch screens when the component mounts
  useEffect(() => {
    const fetchScreens = async () => {
      const { data, error } = await client.from("screens").select("*");
      if (error) {
        console.error("Error fetching screens:", error);
      } else {
        setScreens((data as Screen[]) || []);
      }
    };

    fetchScreens();
  }, [client]);

  // Subscribe to real-time changes
  useEffect(() => {
    const subscription = client
      .channel("public:screens")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "screens" },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              const newScreen = payload.new as Screen;
              setScreens((prevScreens) => [...prevScreens, newScreen]);
              break;
            case "UPDATE":
              const updatedScreen = payload.new as Screen;
              setScreens((prevScreens) =>
                prevScreens.map((screen) =>
                  screen.id === updatedScreen.id ? updatedScreen : screen
                )
              );
              break;
            case "DELETE":
              const { id } = payload.old as Screen;
              setScreens((prevScreens) =>
                prevScreens.filter((screen) => screen.id !== id)
              );
              break;
            default:
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return [screens, setScreens] as const;
};
