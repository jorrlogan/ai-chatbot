'use server';

import { db } from '@/lib/db/database';
import { user, org, connection, invitation } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { EmailInviteTemplate } from '@/components/email-invite-template';
import { randomBytes } from 'node:crypto';
import logger from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getOrg(orgId: string) {
  const [result] = await db
    .select()
    .from(org)
    .where(eq(org.id, orgId))
    .limit(1);
  return result ?? null;
}

export async function updateOrg(
  orgId: string,
  orgName: string,
  orgLogo: File | null,
) {
  const result = await db
    .update(org)
    .set({
      name: orgName,
    })
    .where(eq(org.id, orgId));
  return result;
}

export async function getConnection(orgId: string) {
  const [result] = await db
    .select()
    .from(connection)
    .where(eq(connection.orgId, orgId))
    .limit(1);
  return result ?? null;
}

export async function updateConnection(
  orgId: string,
  connectionType: string,
  baseUrl: string,
  apiKey: string,
  apiSecret: string,
) {
  try {
    const [existingConnection] = await db
      .select()
      .from(connection)
      .where(eq(connection.orgId, orgId))
      .limit(1);

    if (existingConnection) {
      return await db
        .update(connection)
        .set({ connectionType, baseUrl, apiKey, apiSecret })
        .where(eq(connection.orgId, orgId));
    } else {
      return await db.insert(connection).values({
        connectionType,
        baseUrl,
        apiKey,
        apiSecret,
        orgId,
      });
    }
  } catch (error) {
    console.error('Failed to upsert connection in database:', error);
    throw error;
  }
}

export async function getMembers(orgId: string) {
  const result = await db.select().from(user).where(eq(user.orgId, orgId));
  return result ?? [];
}

export async function removeUser(orgId: string, userId: string) {
  const [userToDelete] = await db
    .select()
    .from(user)
    .where(and(eq(user.orgId, orgId), eq(user.id, userId)))
    .limit(1);
  if (userToDelete) {
    await db.delete(invitation).where(eq(invitation.email, userToDelete.email));
  }
  const result = await db
    .delete(user)
    .where(and(eq(user.orgId, orgId), eq(user.id, userId)));
  return result;
}

export async function updateRole(
  userId: string,
  orgId: string,
  memberId: string,
  newRole: 'admin' | 'member' | 'staff',
) {
  // Get the current user's role
  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // Prevent changes if:
  // 1. Current user is not an admin
  // 2. User is trying to change their own role
  if (
    !currentUser?.role ||
    currentUser.role !== 'admin' ||
    userId === memberId
  ) {
    throw new Error('Unauthorized role modification');
  }

  // Update the role
  const result = await db
    .update(user)
    .set({ role: newRole })
    .where(and(eq(user.id, memberId), eq(user.orgId, orgId)));

  return result;
}

export async function sendInvitationEmail(orgId: string, email: string) {
  try {
    // Check if user already exists with this email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser) {
      return { error: 'User already exists with this email' };
    }

    logger.info(`Checking if invite already exists for ${email}`);
    const [existingInvite] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.email, email))
      .limit(1);

    if (existingInvite) {
      return { error: 'An invitation has already been sent to this email' };
    }

    const token = randomBytes(64).toString('hex');

    logger.info(`Inserting invite for ${email}`);
    await db.insert(invitation).values({
      email,
      orgId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      role: 'member',
      accepted: false,
    });

    logger.info(`Getting org for ${orgId}`);
    const [db_org] = await db
      .select()
      .from(org)
      .where(eq(org.id, orgId))
      .limit(1);

    logger.info(`Sending invitation email to ${email}`);
    const { data, error } = await resend.emails.send({
      from: `DashDocs <onboarding@${process.env.RESEND_DOMAIN}>`,
      to: [email],
      subject: '[DashDocs] You are invited to join an organization',
      react: EmailInviteTemplate({
        orgName: db_org?.name ?? '',
        registrationLink: `https://localhost:3000/register?token=${token}`,
      }),
    });

    if (error) {
      logger.info(`Error sending invitation email to ${email}: ${error.message}`);
      return { error: error.message };
    }

    logger.info(`Invitation email sent to ${email}`);

    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function getInvites(orgId: string) {
  logger.info(`Getting invites for org ${orgId}`);
  const result = await db.select().from(invitation).where(eq(invitation.orgId, orgId));
  logger.info(`Found ${result.length} invites for org ${orgId}`);
  return result ?? [];
}

export async function removeInvite(inviteId: string) {
  const result = await db.delete(invitation).where(eq(invitation.id, inviteId));
  return result;
}