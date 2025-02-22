"use server";

import { z } from "zod";

import { createUser, getUser, getInvitationByToken } from "@/lib/db/queries";

import { signIn } from "./auth";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (_: LoginActionState, formData: FormData): Promise<LoginActionState> => {
  try {
    const validatedData = loginFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "user_exists" | "invalid_data";
}


// TODO: add the data to the register form
export const register = async (_: RegisterActionState, formData: FormData): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      token: formData.get("token"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const invitation = await getInvitationByToken(validatedData.token);

    if (!invitation) {
      return { status: "invalid_data" };
    }

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    }
    await createUser(validatedData.firstName, validatedData.lastName, validatedData.email, validatedData.password, invitation.orgId);
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
