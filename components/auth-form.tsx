import Form from "next/form";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  token,
}: {
  action: NonNullable<string | ((formData: FormData) => void | Promise<void>) | undefined>;
  children: React.ReactNode;
  defaultEmail?: string;
  token?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {token && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-zinc-600 font-normal dark:text-zinc-400">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              className="bg-muted text-md md:text-sm"
              type="text"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-zinc-600 font-normal dark:text-zinc-400">
              Last Name
            </Label>
            <Input id="lastName" name="lastName" className="bg-muted text-md md:text-sm" type="text" required />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          autoComplete="email"
          required
          autoFocus={!token}
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
          Password
        </Label>

        <Input id="password" name="password" className="bg-muted text-md md:text-sm" type="password" required />
      </div>

      {token && <Input type="hidden" name="token" value={token} />}

      {children}
    </Form>
  );
}
