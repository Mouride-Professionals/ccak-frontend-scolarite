import { api } from "@/lib/api-client";
import { unwrapData } from "@/lib/api/api-response";

export interface EmailTemplate {
  name: string;
  display_name: string;
  description: string;
  variables: string[];
  path: string;
  content?: string;
}

export const templatesApi = {
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get("/templates/email");
    return unwrapData<EmailTemplate[]>(response);
  },

  getTemplatePreview: async (
    templateName: string,
    variables: Record<string, unknown>
  ): Promise<{ html: string }> => {
    const response = await api.post("/templates/email/preview", {
      template_name: templateName,
      variables,
    });
    return unwrapData<{ html: string }>(response);
  },
};
