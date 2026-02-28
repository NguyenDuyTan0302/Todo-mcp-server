#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "todos.json");

// Load todos from file
function loadTodos() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

// Save todos to file
function saveTodos(todos) {
  writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// Create MCP server
const server = new Server(
  { name: "todo-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "add_todo",
      description: "Thêm một công việc mới vào danh sách",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Tên công việc" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Độ ưu tiên (low/medium/high)",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "list_todos",
      description: "Xem danh sách tất cả công việc",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            enum: ["all", "pending", "done"],
            description: "Lọc theo trạng thái",
          },
        },
      },
    },
    {
      name: "complete_todo",
      description: "Đánh dấu công việc đã hoàn thành",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "ID của công việc" },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_todo",
      description: "Xóa một công việc khỏi danh sách",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "ID của công việc cần xóa" },
        },
        required: ["id"],
      },
    },
    {
      name: "clear_completed",
      description: "Xóa tất cả công việc đã hoàn thành",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let todos = loadTodos();

  switch (name) {
    case "add_todo": {
      const newTodo = {
        id: Date.now(),
        title: args.title,
        priority: args.priority || "medium",
        done: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(newTodo);
      saveTodos(todos);
      return {
        content: [
          {
            type: "text",
            text: `✅ Đã thêm: "${newTodo.title}" [${newTodo.priority}] (ID: ${newTodo.id})`,
          },
        ],
      };
    }

    case "list_todos": {
      const filter = args.filter || "all";
      let filtered = todos;
      if (filter === "pending") filtered = todos.filter((t) => !t.done);
      if (filter === "done") filtered = todos.filter((t) => t.done);

      if (filtered.length === 0) {
        return {
          content: [{ type: "text", text: "📭 Danh sách trống!" }],
        };
      }

      const list = filtered
        .map((t) => {
          const status = t.done ? "✅" : "⏳";
          const priority =
            t.priority === "high"
              ? "🔴"
              : t.priority === "medium"
              ? "🟡"
              : "🟢";
          return `${status} [${t.id}] ${priority} ${t.title}`;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `📋 Danh sách công việc (${filter}):\n${list}\n\nTổng: ${filtered.length} việc`,
          },
        ],
      };
    }

    case "complete_todo": {
      const todo = todos.find((t) => t.id === args.id);
      if (!todo) {
        return {
          content: [{ type: "text", text: `❌ Không tìm thấy ID: ${args.id}` }],
        };
      }
      todo.done = true;
      todo.completedAt = new Date().toISOString();
      saveTodos(todos);
      return {
        content: [
          { type: "text", text: `🎉 Hoàn thành: "${todo.title}"` },
        ],
      };
    }

    case "delete_todo": {
      const index = todos.findIndex((t) => t.id === args.id);
      if (index === -1) {
        return {
          content: [{ type: "text", text: `❌ Không tìm thấy ID: ${args.id}` }],
        };
      }
      const deleted = todos.splice(index, 1)[0];
      saveTodos(todos);
      return {
        content: [
          { type: "text", text: `🗑️ Đã xóa: "${deleted.title}"` },
        ],
      };
    }

    case "clear_completed": {
      const before = todos.length;
      todos = todos.filter((t) => !t.done);
      saveTodos(todos);
      const removed = before - todos.length;
      return {
        content: [
          { type: "text", text: `🧹 Đã xóa ${removed} công việc đã hoàn thành` },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `❌ Tool không tồn tại: ${name}` }],
      };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("🚀 Todo MCP Server đang chạy...");
