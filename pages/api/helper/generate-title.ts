import type { NextApiResponse } from "next";
import { GenerateTitleDto, GenerateTitleDtoSchema } from "@/src/dto/helper.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { generateTitle } from "@/src/llm/helper";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const titleData = req.validated as GenerateTitleDto;
  const title = await generateTitle(titleData.text);

  return res.status(200).json({
    message: "Title generated successfully",
    code: 0,
    data: title,
  });
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(GenerateTitleDtoSchema, "body")
)(handler);
