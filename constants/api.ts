// constants/api.ts
import { Platform } from "react-native";

// ✅ 电脑本机开发：127.0.0.1 只对电脑自己有效
// ✅ 真机 iPhone：必须用你电脑局域网 IP
const LAN_IP = "192.168.0.96";
const PORT = 8000;

// iOS/Android 真机都用 LAN IP
export const API_BASE = `http://${LAN_IP}:${PORT}`;

// 你也可以之后部署云端再改成：
// export const API_BASE = "https://api.weidun.com";
