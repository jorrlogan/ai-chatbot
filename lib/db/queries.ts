import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, not } from 'drizzle-orm';
import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  invitation,
  org,
  connection,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { db } from './database';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
// token is the token from the invite url
export async function getInvitationByToken(token: string, email: string) {
  try {
    const [result] = await db
      .select()
      .from(invitation)
      .where(and(eq(invitation.token, token), eq(invitation.email, email)))
      .limit(1);
    return result;
  } catch (error) {
    console.error('Failed to get invitation by token from database');
    throw error;
  }
}

export async function getConnectionByOrgId({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(connection)
      .where(eq(connection.orgId, id))
      .limit(1);
    return result;
  } catch (error) {
    console.error('Failed to get connection by id from database');
    throw error;
  }
}

export async function upsertConnection({
  id,
  connectionType,
  baseUrl,
  apiKey,
  apiSecret,
}: {
  id: string;
  connectionType: string;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}) {
  try {
    const [existingConnection] = await db
      .select()
      .from(connection)
      .where(eq(connection.id, id))
      .limit(1);

    if (existingConnection) {
      return await db
        .update(connection)
        .set({ connectionType, apiKey, apiSecret })
        .where(eq(connection.id, id));
    } else {
      return await db.insert(connection).values({
        id,
        connectionType,
        baseUrl,
        apiKey,
        apiSecret,
        orgId: id,
      });
    }
  } catch (error) {
    console.error('Failed to upsert connection in database');
    throw error;
  }
}

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function getOrgById({ id }: { id: string }) {
  try {
    const [result] = await db.select().from(org).where(eq(org.id, id)).limit(1);
    return result;
  } catch (error) {
    console.error('Failed to get organization from database');
    throw error;
  }
}

export async function updateOrg({ id, name }: { id: string; name: string }) {
  try {
    return await db.update(org).set({ name }).where(eq(org.id, id));
  } catch (error) {
    console.error('Failed to update organization in database');
    throw error;
  }
}

export async function getOrgMembers({
  orgId,
  userId,
}: { orgId: string; userId: string }) {
  try {
    // First check if user is admin and belongs to the org
    const [requestingUser] = await db
      .select()
      .from(user)
      .where(
        and(eq(user.id, userId), eq(user.role, 'admin'), eq(user.orgId, orgId)),
      )
      .limit(1);

    if (!requestingUser) {
      throw new Error(
        'Unauthorized - User must be an admin of this organization',
      );
    }

    return await db.select().from(user).where(eq(user.orgId, orgId));
  } catch (error) {
    console.error('Failed to get organization members from database');
    throw error;
  }
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  orgId: string,
) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({
      email,
      password: hash,
      firstName,
      lastName,
      orgId,
      role: 'member',
    });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function deleteUser(orgId: string, userId: string) {
  try {
    return await db
      .delete(user)
      .where(
        and(
          eq(user.orgId, orgId),
          eq(user.id, userId),
          not(eq(user.role, 'admin')),
        ),
      );
  } catch (error) {
    console.error('Failed to remove user from database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: { id: string; userId: string; title: string }) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getUserById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return result;
  } catch (error) {
    console.error('Failed to get user by id from database');
    throw error;
  }
}

export async function getOrgFromUser({ id }: { id: string }) {
  try {
    const [result] = await db
      .select({
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      })
      .from(user)
      .innerJoin(org, eq(user.orgId, org.id))
      .where(eq(user.id, id))
      .limit(1);

    return result;
  } catch (error) {
    console.error('Failed to get org from user:', error);
    throw error;
  }
}

export async function getOrganizationByUserId({ id }: { id: string }) {
  try {
    const [result] = await db.select().from(org).where(eq(org.id, id)).limit(1);
    return result;
  } catch (error) {
    console.error('Failed to get organization by user id from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: { id: string; timestamp: Date }) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: { suggestions: Array<Suggestion> }) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: { documentId: string }) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: { chatId: string; timestamp: Date }) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
