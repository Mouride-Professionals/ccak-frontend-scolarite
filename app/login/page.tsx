import LoginRedirect from "./login-redirect";
import { normalizeRedirectUrl } from "@/lib/url-validator";

type LoginPageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

const defaultCallbackUrl = "/dashboard";

const normalizeCallbackUrl = (value?: string | string[]) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return normalizeRedirectUrl(rawValue ?? "", defaultCallbackUrl);
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const callbackUrl = normalizeCallbackUrl(resolvedSearchParams?.callbackUrl);
  return <LoginRedirect callbackUrl={callbackUrl} />;
}
