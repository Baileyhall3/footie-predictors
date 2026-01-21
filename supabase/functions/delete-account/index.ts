import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // 1️⃣ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 2️⃣ Require auth
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: corsHeaders }
      )
    }

    // 3️⃣ Create Supabase client with user context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // 4️⃣ Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      )
    }

    // 5️⃣ Delete user data first
    await supabase.from("users").delete().eq("id", user.id)

    // TODO: delete memberships, predictions, notifications, etc.

    // 6️⃣ Delete auth user (requires service role)
    await supabase.auth.admin.deleteUser(user.id)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    )
  }
})
