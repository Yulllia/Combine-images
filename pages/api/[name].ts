import fs from "fs";
import type { NextApiResponse } from "next";

export default async function handler(
  req: { method: string; query: { name: string } },
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const { name } = req.query;
    fs.unlinkSync(`public/${name}`);
    return res.status(200).end(`${name}`);
  } else {
    return res.status(500).json("error");
  }
}
