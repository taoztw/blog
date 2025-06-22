"user server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";

import { ValidationError } from "../http-errors";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

async function action<T>({ params, schema, authorize }: ActionOptions<T>) {
  if (params && schema) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(error.flatten().fieldErrors as Record<string, string[]>);
      } else {
        return new Error("Schema validate error");
      }
    }
  }

  let session: Session | null = null;
  if (authorize) {
    session = await auth();

    if (!session) {
      return new Error("Unauthorized");
    }
  }

  // await dbConnect();

  return { params, session };
}

export default action;
