import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { API_BASE } from "@/constants/api";

export default function ApiTestScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  async function load() {
    setErr("");
    try {
      // ✅ 建议你后端提供一个 /health 或 /ping
      // 如果你没有，我下面第 2.3 给你完整后端代码
      const res = await fetch(`${API_BASE}/health`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 18, fontWeight: "700" }}>API Test</Text>
      <Text>API_BASE: {API_BASE}</Text>

      {loading ? <ActivityIndicator /> : null}

      {err ? (
        <Text style={{ color: "red" }}>
          Error: {err}
          {"\n"}
          请确认：手机和电脑同 WiFi、Windows 防火墙放行 8000、后端运行中
        </Text>
      ) : null}

      {data ? (
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>Response:</Text>
          <Text selectable>{JSON.stringify(data, null, 2)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
