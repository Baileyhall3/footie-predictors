import { supabaseService } from "./supabaseService.js";

export default async function handler(req, res) {
  try {
    console.log("Running scheduled job: Deleting expired notifications...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Running in Vercel:", !!process.env.VERCEL);

    // Delete expired notifications
    const { data, error } = await deleteExpiredNotifications();

    if (error) {
      console.error("❌ Error deleting expired notifications:", error);
      return res.status(500).json({ error: "Failed to delete expired notifications" });
    }

    res.status(200).json({
      message: `Deleted ${data?.length || 0} expired notifications successfully`,
      deleted: data,
    });
  } catch (error) {
    console.error("Error running expired notifications job:", error);
    res.status(500).json({ error: "Server error deleting expired notifications" });
  }
}

/**
 * Deletes notifications where expires_at <= now
 * @returns {Promise<{data: Array, error: Object}>}
 */
async function deleteExpiredNotifications() {
  console.log("Checking expired notifications...");
  try {
    const now = new Date().toISOString();

    // Delete and return deleted rows
    const { data, error } = await supabaseService
      .from("notifications")
      .delete()
      .lte("expires_at", now)
      .select("*"); // return deleted rows for logging

    if (error) {
      console.error("❌ Supabase delete error:", error);
      return { data: null, error };
    }

    if (!data.length) {
      console.log("✅ No expired notifications found.");
      return { data: [], error: null };
    }

    console.log(`✅ Deleted ${data.length} expired notifications.`);
    return { data, error: null };
  } catch (err) {
    console.error("Error deleting expired notifications:", err);
    return { data: null, error: err };
  }
}
