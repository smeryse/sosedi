import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get attachment info
  const { data: attachment, error } = await supabase
    .from("message_attachments")
    .select(`
      id,
      storage_path,
      mime_type,
      byte_size,
      message_id,
      messages!inner (
        conversation_id,
        sender_id
      )
    `)
    .eq("id", id)
    .single();

  if (error || !attachment) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Check if user has access to this conversation
  const { data: member } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", attachment.messages.conversation_id)
    .eq("profile_id", user.id)
    .single();

  if (!member) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Generate signed URL for download (valid for 1 hour)
  const { data: signedUrl, error: urlError } = await supabase.storage
    .from("message-attachments")
    .createSignedUrl(attachment.storage_path, 3600);

  if (urlError || !signedUrl) {
    return new NextResponse("Failed to generate download URL", { status: 500 });
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrl.signedUrl, 302);
}