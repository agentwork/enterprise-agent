import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
} from "@langchain/langgraph-checkpoint";
import { db } from "@/lib/db";
import { checkpoints, checkpointWrites } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export class PostgresSaver extends BaseCheckpointSaver {
  constructor() {
    super();
  }

  // ... (getTuple implementation remains same) ...

  async getTuple(config: {
    configurable?: { thread_id?: string; checkpoint_id?: string };
  }): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) {
      return undefined;
    }

    if (checkpointId) {
      const [row] = await db
        .select()
        .from(checkpoints)
        .where(
          and(
            eq(checkpoints.threadId, threadId),
            eq(checkpoints.checkpointId, checkpointId)
          )
        );
      if (row) {
        return {
          config,
          checkpoint: row.checkpoint as Checkpoint,
          metadata: row.metadata as CheckpointMetadata,
          parentConfig: row.parentCheckpointId
            ? {
                configurable: {
                  thread_id: threadId,
                  checkpoint_id: row.parentCheckpointId,
                },
              }
            : undefined,
        };
      }
    } else {
      const [row] = await db
        .select()
        .from(checkpoints)
        .where(eq(checkpoints.threadId, threadId))
        .orderBy(desc(checkpoints.createdAt))
        .limit(1);
      if (row) {
        return {
          config: {
            configurable: {
              thread_id: threadId,
              checkpoint_id: row.checkpointId,
            },
          },
          checkpoint: row.checkpoint as Checkpoint,
          metadata: row.metadata as CheckpointMetadata,
          parentConfig: row.parentCheckpointId
            ? {
                configurable: {
                  thread_id: threadId,
                  checkpoint_id: row.parentCheckpointId,
                },
              }
            : undefined,
        };
      }
    }
    return undefined;
  }

  async *list(
    config: { configurable?: { thread_id?: string } },
    options?: { before?: { configurable?: { checkpoint_id?: string } }; limit?: number }
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) {
      return;
    }

    const query = db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.threadId, threadId))
      .orderBy(desc(checkpoints.createdAt));
      
    // Applying limit needs to be done on the query builder correctly
    // Since type mismatch is tricky with conditional chain, we can fetch all or slice.
    // Drizzle's limit() returns a new query object.
    
    let rows;
    if (options?.limit) {
       rows = await query.limit(options.limit);
    } else {
       rows = await query;
    }

    for (const row of rows) {
      yield {
        config: {
          configurable: {
            thread_id: threadId,
            checkpoint_id: row.checkpointId,
          },
        },
        checkpoint: row.checkpoint as Checkpoint,
        metadata: row.metadata as CheckpointMetadata,
        parentConfig: row.parentCheckpointId
          ? {
              configurable: {
                thread_id: threadId,
                checkpoint_id: row.parentCheckpointId,
              },
            }
          : undefined,
      };
    }
  }

  async put(
    config: { configurable?: { thread_id?: string; checkpoint_id?: string } },
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    // newVersions?: Record<string, string | number>
  ): Promise<{ configurable: { thread_id: string; checkpoint_id: string } }> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = checkpoint.id;
    
    if (!threadId) {
      throw new Error("Thread ID is required");
    }

    await db
      .insert(checkpoints)
      .values({
        threadId,
        checkpointId,
        parentCheckpointId: config.configurable?.checkpoint_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checkpoint: checkpoint as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
      })
      .onConflictDoUpdate({
        target: [checkpoints.threadId, checkpoints.checkpointId],
        set: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          checkpoint: checkpoint as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: metadata as any,
        },
      });

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_id: checkpointId,
      },
    };
  }

  async putWrites(
    config: { configurable?: { thread_id?: string; checkpoint_id?: string } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writes: [string, any][],
    taskId: string
  ): Promise<void> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId || !checkpointId) {
      throw new Error("Thread ID and Checkpoint ID are required");
    }

    if (!writes || writes.length === 0) return;

    await db.transaction(async (tx) => {
        for (let i = 0; i < writes.length; i++) {
            const [channel, value] = writes[i];
            await tx.insert(checkpointWrites).values({
                threadId,
                checkpointId,
                taskId,
                idx: i,
                channel,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value: value as any,
            }).onConflictDoUpdate({
                target: [checkpointWrites.threadId, checkpointWrites.checkpointId, checkpointWrites.taskId, checkpointWrites.idx],
                set: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value: value as any,
                    channel
                }
            });
        }
    });
  }

  async deleteThread(threadId: string): Promise<void> {
      if (!threadId) return;
      await db.delete(checkpoints).where(eq(checkpoints.threadId, threadId));
      await db.delete(checkpointWrites).where(eq(checkpointWrites.threadId, threadId));
  }
}
