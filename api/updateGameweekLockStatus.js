// Use ES module import instead of CommonJS require
import { supabaseService } from "./supabaseService.js";

export default async function handler(req, res) {
    try {
        console.log("Running scheduled job: Updating gameweek deadlines...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Running in Vercel:", !!process.env.VERCEL);
        
        // Force Node.js environment detection
        global.window = undefined;
        
        // Now we can use the service
        await updateGameweeksLockStatus();

        res.status(200).json({ message: "Gameweek deadlines updated successfully" });
    } catch (error) {
        console.error("Error updating gameweek deadlines:", error);
        res.status(500).json({ error: "Failed to update gameweek deadlines" });
    }
}

/**
 * Gets gameweeks whose deadlines are in the past and locks them
 * @returns {Promise<{data: Array, error: Object}>}
 */
async function updateGameweeksLockStatus() {
    console.log("Checking gameweeks that need to be locked...");
    try {
      const { data: gameweeks, error } = await supabaseService
        .from('gameweeks')
        .select('*')
        .lte('deadline', new Date().toISOString())
        .eq('is_locked', false);
  
      if (error) {
        console.error("❌ Error fetching gameweeks:", error);
        return;
      }
  
      if (!gameweeks.length) {
        console.log("✅ No gameweeks need updating.");
        return;
      }
  
      const updates = gameweeks.map((gw) =>
        supabaseService
          .from('gameweeks')
          .update({ is_locked: true })
          .eq('id', gw.id)
          .then(response => {
            if (response.error) throw response.error;
          })
      );
  
      await Promise.all(updates);
      console.log(`✅ Successfully locked ${gameweeks.length} gameweeks.`);
      
    } catch (error) {
      console.error('Error locking gameweeks:', error);
      return { data: null, error };
    }
  }  