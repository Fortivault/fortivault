import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = createClient(cookies())
    
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get notifications for the user
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(cookies())
    const body = await request.json()
    
    // Verify authentication and authorization
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create notification
    const { error } = await supabase.from("notifications").insert({
      user_id: body.user_id,
      title: body.title,
      message: body.message,
      type: body.type,
      target_id: body.target_id,
      target_type: body.target_type,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating notification:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient(cookies())
    const body = await request.json()
    
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update notification (mark as read)
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", body.notification_id)
      .eq("user_id", session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(cookies())
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")
    
    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!notificationId) {
      return new NextResponse("Notification ID required", { status: 400 })
    }

    // Delete notification
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}