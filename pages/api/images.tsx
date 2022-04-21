const multer = require("multer");
import type { NextApiResponse } from "next";
import { Express } from "express";
import { Multer } from "multer";
import Jimp from "jimp";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "50mb",
    externalResolver: true,
  },
};
interface ImageInfo {
  destination: string;
  encoding: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  path: string;
  size: number;
}

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ): void => {
    cb(null, "public");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ): void => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).array("file", 2);

export default async function readImage(
  req: { method: string; body: Object; files: Array<ImageInfo> },
  res: NextApiResponse
) {
  upload(req, res, async () => {
    let images = req.files;
    let path;
    let jimps: Array<Promise<Jimp>> = [];
    for (let i = 0; i < images.length; i++) {
      jimps.push(Jimp.read(images[i].path));
    }
    await Promise.all(jimps)
      .then((): Promise<Jimp[]> => {
        return Promise.all(jimps);
      })
      .then((data) => {
        if (data[1]) {
          data[1].resize(800, 900);
        }
        path = `public/combine${images[0].filename}`;
        return data[0].composite(data[1], 600, 800), data[0].write(path);
      });
    res.status(200).send({ path, req: req.files });
    res.end();
  });
}
