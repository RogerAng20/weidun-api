export const API_BASE = "https://YOUR-DOMAIN.com"; 
// 临时本地测试用： "http://192.168.0.96:8000"

export type DeviceRow = {
  id: number;
  name: string;
  type: "inverter" | "logger" | "meter";
  model: string;
  sn: string;
  site: "A" | "B" | "C" | "ALL";
  status: "online" | "offline" | "unknown";
  pac_kw: number;
  eday_kwh: number;
  updated_at: string;
};

export async function apiListDevices(site: string, type: string) {
  const url = `${API_BASE}/devices?site=${encodeURIComponent(site)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url);
  const j = await res.json();
  if (!j.ok) throw new Error("API error");
  return j.data as DeviceRow[];
}

export async function apiPatchDevice(id: number, patch: Partial<DeviceRow>) {
  const res = await fetch(`${API_BASE}/devices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const j = await res.json();
  if (!j.ok) throw new Error("API error");
  return true;
}
