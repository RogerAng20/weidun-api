import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Modal, TextInput, StyleSheet } from "react-native";
import { useApp } from "../src/store/AppStore";
import { apiListDevices, apiPatchDevice, DeviceRow } from "../src/api/client";

type DeviceType = "inverter" | "logger" | "meter";

const DEV_TABS: { key: DeviceType; label: string }[] = [
  { key: "inverter", label: "Inverter" },
  { key: "logger", label: "Data logger" },
  { key: "meter", label: "Meter" },
];

export default function DeviceScreen() {
  const { site } = useApp();
  const [tab, setTab] = useState<DeviceType>("inverter");
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [editing, setEditing] = useState<DeviceRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, tab]);

  async function refresh() {
    try {
      setLoading(true);
      const data = await apiListDevices(site, tab);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Device Overview</Text>
      <Text style={styles.subtitle}>Cloud mode · {loading ? "Loading..." : "Ready"}</Text>

      <View style={styles.tabs}>
        {DEV_TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>Model: {item.model || "--"} · SN: {item.sn || "--"}</Text>
              <Text style={styles.cardMeta}>Site: {item.site} · Status: {item.status}</Text>
              <Text style={styles.cardMeta}>PAC: {item.pac_kw} kW · Eday: {item.eday_kwh} kWh</Text>
              <Text style={styles.cardMeta}>Updated: {item.updated_at}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => setEditing(item)}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { marginTop: 8 }]} onPress={refresh}>
                <Text style={styles.actionText}>Refresh</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <EditModal
        row={editing}
        onClose={() => setEditing(null)}
        onSaved={async (patch) => {
          if (!editing) return;
          await apiPatchDevice(editing.id, patch);
          setEditing(null);
          refresh();
        }}
      />
    </View>
  );
}

function EditModal({
  row,
  onClose,
  onSaved,
}: {
  row: DeviceRow | null;
  onClose: () => void;
  onSaved: (patch: Partial<DeviceRow>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [sn, setSn] = useState("");
  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown");

  useEffect(() => {
    if (!row) return;
    setName(row.name);
    setModel(row.model ?? "");
    setSn(row.sn ?? "");
    setStatus(row.status ?? "unknown");
  }, [row]);

  return (
    <Modal visible={!!row} transparent animationType="fade">
      <View style={styles.modalMask}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit Device</Text>

          <L label="Name">
            <TextInput value={name} onChangeText={setName} style={styles.input} />
          </L>
          <L label="Model">
            <TextInput value={model} onChangeText={setModel} style={styles.input} />
          </L>
          <L label="SN">
            <TextInput value={sn} onChangeText={setSn} style={styles.input} />
          </L>
          <L label="Status (online/offline/unknown)">
            <TextInput value={status} onChangeText={(v) => setStatus(v as any)} style={styles.input} />
          </L>

          <View style={styles.modalActions}>
            <Pressable style={[styles.modalBtn, styles.modalBtnGhost]} onPress={onClose}>
              <Text style={styles.modalBtnTextGhost}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalBtn, styles.modalBtnPrimary]}
              onPress={() => {
                onSaved({ name, model, sn, status });
              }}
            >
              <Text style={styles.modalBtnTextPrimary}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 6, color: "#666" },

  tabs: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 12 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "#cbd5e1" },
  tabBtnActive: { backgroundColor: "#e0edff", borderColor: "#6aa0ff" },
  tabText: { color: "#111" },
  tabTextActive: { fontWeight: "700" },

  card: { flexDirection: "row", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardMeta: { marginTop: 4, color: "#555" },

  actions: { width: 90, alignItems: "stretch", marginLeft: 10 },
  actionBtn: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  actionText: { fontWeight: "600" },

  modalMask: { flex: 1, backgroundColor: "rgba(0,0,0,.35)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800" },

  label: { color: "#333", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  modalBtnGhost: { borderWidth: 1, borderColor: "#cbd5e1" },
  modalBtnPrimary: { backgroundColor: "#2563eb" },
  modalBtnTextGhost: { fontWeight: "700" },
  modalBtnTextPrimary: { color: "#fff", fontWeight: "800" },
});
