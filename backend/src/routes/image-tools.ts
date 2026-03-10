import { Router } from "express";

const router = Router();

router.post("/transform", async (req, res) => {
  const { url, type } = req.body;

  if (!url || !type) {
    return res.status(400).json({ message: "Invalid request" });
  }

  let transformed = url;

  switch (type) {
    case "crop":
      transformed = `${url}?tr=fo-auto`;
      break;
    case "bg-remove":
      transformed = `${url}?tr=bg-remove`;
      break;
    case "upscale":
      transformed = `${url}?tr=upscl-2`;
      break;
  }

  res.json({ url: transformed });
});

export default router;
