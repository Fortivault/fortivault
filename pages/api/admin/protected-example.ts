import type { NextApiRequest, NextApiResponse } from "next"
import { getAuthAdmin } from "@/lib/getAuthAdmin"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await getAuthAdmin(req)
  if (auth.error || !auth.admin) return res.status(401).json({ error: auth.error || "Unauthorized" })

  return res.status(200).json({ success: true, admin: auth.admin })
}
