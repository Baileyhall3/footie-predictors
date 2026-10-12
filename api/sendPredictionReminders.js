// Use ES module import instead of CommonJS require
import { supabaseService } from "./supabaseService.js";

export default async function handler(req, res) {
    try {
        console.log("Running scheduled job: Send Predictions Reminders...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Running in Vercel:", !!process.env.VERCEL);
        
        // Force Node.js environment detection
        global.window = undefined;
        
        // Now we can use the service
        await sendPredictionsReminders();

        res.status(200).json({ message: "Predictions reminders sent successfully" });
    } catch (error) {
        console.error("Error sending predictions reminders:", error);
        res.status(500).json({ error: "Failed to send predictions reminders" });
    }
}

async function sendPredictionsReminders() {
    try {
      const { data: reminders, error } = await supabaseService.rpc('send_predictions_reminders')
  
      if (error) {
        console.error("❌ Error sending predictions reminders:", error);
        return;
      }
  
      if (!reminders) {
        console.log("✅ No predictions reminders to send.");
        return;
      }

      console.log(`✅ Successfully sent ${reminders} predictions reminders.`);
      
    } catch (error) {
      console.error('Error sending predictions reminders:', error);
      return { data: null, error };
    }
  }  