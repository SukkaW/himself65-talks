"use server";
import {
  VectorStoreIndex,
  SimpleChatEngine,
  ChatMemoryBuffer,
  ChatMessage,
} from "llamaindex";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { vectorStore } from "../lib/sql";
import { ReactNode } from "react";
import { runAsyncFnWithoutBlocking } from "../lib/utils";
import { Skeleton } from "../components/ui/skeleton";
import { BotMessage } from "../components/message";
import { FilterOperator } from "llamaindex/vector-store/types";

const index = await VectorStoreIndex.fromVectorStore(vectorStore);
const initialAIState = {
  messages: [],
} as {
  messages: ChatMessage[];
};

type UIMessage = {
  id: number;
  display: ReactNode;
};

const initialUIState = {
  messages: [],
} as {
  messages: UIMessage[];
};

export const AI = createAI({
  actions: {
    submitSimple: async (message: string): Promise<UIMessage> => {
      "use server";
      const aiState = getMutableAIState<typeof AI>();
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "user",
            content: message,
          },
        ],
      });

      const simpleChatEngine = new SimpleChatEngine({
        memory: new ChatMemoryBuffer({
          chatHistory: [],
        }),
      });

      const ui = createStreamableUI(
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>,
      );

      runAsyncFnWithoutBlocking(async () => {
        ui.update("");
        const response = await simpleChatEngine.chat({
          message,
          stream: true,
        });
        let content = "";

        for await (const { delta } of response) {
          content += delta;
          ui.append(delta);
        }

        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              role: "assistant",
              content,
            },
          ],
        });

        ui.done();
      });

      return {
        id: Date.now(),
        display: <BotMessage>{ui.value}</BotMessage>,
      };
    },
    submitIndex: async (message: string, noteId: string) => {
      "use server";
      const aiState = getMutableAIState<typeof AI>();
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "user",
            content: message,
          },
        ],
      });

      const queryEngine = index.asQueryEngine({
        preFilters: {
          filters: [
            {
              key: "metadata",
              value: `noteId=${noteId}`,
              operator: FilterOperator.CONTAINS,
            },
          ],
        },
      });
      const response = await queryEngine.query({
        query,
        stream: true,
      });

      // todo
    },
  },
  initialUIState,
  initialAIState,
});
