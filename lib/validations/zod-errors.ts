import { z } from "zod";

export type FieldErrors = Record<string, string>;

export const zodErrorToFieldErrors = (error: z.ZodError): FieldErrors => {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
};
