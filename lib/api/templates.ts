export interface EmailTemplate {
  name: string;
  display_name: string;
  description: string;
  variables: string[];
  path: string;
  content?: string;
}

export const templatesApi = {
  // Get available templates
  getTemplates: async (): Promise<EmailTemplate[]> => {
    // For now, return static list of templates from backend
    return [
      {
        name: "notification",
        display_name: "Notification générique",
        description: "Template pour les notifications génériques",
        variables: ["title", "message", "user.name"],
        path: "emails.notifications.generic",
      },
      {
        name: "welcome",
        display_name: "Bienvenue",
        description: "Email de bienvenue pour les nouveaux utilisateurs",
        variables: ["user.name"],
        path: "emails.notifications.welcome",
      },
      {
        name: "grade_published",
        display_name: "Note publiée",
        description: "Notification de publication de note",
        variables: ["user.name", "grade.subject", "grade.score", "grade.url"],
        path: "emails.notifications.grade-published",
      },
      {
        name: "enrollment_confirmed",
        display_name: "Inscription confirmée",
        description: "Confirmation d'inscription à un cours",
        variables: ["user.name", "course.name", "enrollment.url"],
        path: "emails.notifications.enrollment-confirmed",
      },
      {
        name: "document_ready",
        display_name: "Document disponible",
        description: "Notification de document disponible",
        variables: ["user.name", "document.name", "document.url"],
        path: "emails.notifications.document-ready",
      },
      {
        name: "password_reset",
        display_name: "Réinitialisation mot de passe",
        description: "Email de réinitialisation de mot de passe",
        variables: ["user.name", "reset.url", "reset.token"],
        path: "emails.notifications.password-reset",
      },
    ];
  },

  // Get template preview
  getTemplatePreview: async (
    templateName: string,
    variables: Record<string, unknown>
  ): Promise<{ html: string }> => {
    // This would call a backend endpoint to render the template
    // For now, return a mock preview
    return {
      html: `<div>Preview for ${templateName} with variables: ${JSON.stringify(variables)}</div>`,
    };
  },
};
