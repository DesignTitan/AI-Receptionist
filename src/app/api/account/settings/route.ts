import { NextResponse } from "next/server";
import { checkOrigin, owner } from "@/lib/platform/server";
import { serviceClient } from "@/lib/supabase";

export async function PATCH(request: Request) {
  try { checkOrigin(request); } catch { return NextResponse.json({error:"Invalid request."},{status:403}); }
  const user = await owner();
  if (!user) return NextResponse.json({error:"Please sign in again."},{status:401});
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g," ") : "";
    if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) return NextResponse.json({error:"Enter your name using 1–80 characters."},{status:400});
    const db = serviceClient();
    const {data:c,error} = await db.from("customers").select("id,config").eq("owner_id",user.id).maybeSingle();
    if(error || !c) return NextResponse.json({error:"Your account could not be loaded."},{status:400});
    // Compare the existing configuration so a simultaneous business edit is never overwritten.
    const saved = await db.from("customers").update({config:{...c.config,contactName:name}})
      .eq("id",c.id).eq("owner_id",user.id).eq("config",JSON.stringify(c.config)).select("id").maybeSingle();
    if(saved.error || !saved.data) return NextResponse.json({error:"Your account changed while saving. Refresh and try again."},{status:409});
    return NextResponse.json({name});
  } catch { return NextResponse.json({error:"We couldn’t save your profile. Please try again."},{status:400}); }
}
