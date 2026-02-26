import { workflow } from "../graph";
import { PostgresSaver } from "./checkpointer";

const checkpointer = new PostgresSaver();

export const runner = workflow.compile({ checkpointer });
