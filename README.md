# 📝 Todo MCP Server

MCP Server quản lý công việc (Todo List) tích hợp với Claude Code.

## Cài đặt

```bash
npm install
```

## Thêm vào Claude Code

```bash
# Windows (PowerShell)
claude mcp add --transport stdio todo -- cmd /c node "D:\path\to\todo-mcp-server\index.js"

# macOS/Linux
claude mcp add --transport stdio todo -- node /path/to/todo-mcp-server/index.js
```

## Các lệnh có thể dùng với Claude

- **Thêm việc:** "Thêm todo: Học MCP server với độ ưu tiên cao"
- **Xem danh sách:** "Xem tất cả todo của tôi"
- **Hoàn thành:** "Đánh dấu todo ID 123 là xong"
- **Xóa:** "Xóa todo ID 123"
- **Dọn dẹp:** "Xóa tất cả todo đã hoàn thành"

## Tools

| Tool | Mô tả |
|------|-------|
| `add_todo` | Thêm công việc mới |
| `list_todos` | Xem danh sách (all/pending/done) |
| `complete_todo` | Đánh dấu hoàn thành |
| `delete_todo` | Xóa công việc |
| `clear_completed` | Xóa tất cả đã xong |

## Lý do chọn Todo MCP Server

- **Đơn giản, dễ hiểu** — ai cũng biết todo list là gì
- **Thực tế** — có thể dùng hàng ngày để quản lý công việc
- **Dễ demo** — có thể thêm/xem/xóa ngay lập tức trong terminal
- **Lưu dữ liệu** — ghi vào file JSON, không mất khi tắt máy
