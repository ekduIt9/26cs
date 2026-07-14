import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const tripStates = ["Đã xác nhận", "Đang đến điểm đón", "Đã đến", "Đang thực hiện", "Hoàn thành"] as const;

export default function App() {
  const [stateIndex, setStateIndex] = useState(0);
  const currentState = tripStates[stateIndex];
  const nextLabel = useMemo(() => {
    const labels = ["Bắt đầu đến điểm đón", "Xác nhận đã đến", "Bắt đầu chuyến", "Hoàn thành chuyến", "Đã hoàn thành"];
    return labels[stateIndex];
  }, [stateIndex]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.kicker}>ỨNG DỤNG TÀI XẾ</Text><Text style={styles.greeting}>Chào anh Long</Text></View>
          <View style={styles.avatar}><Text style={styles.avatarText}>HL</Text></View>
        </View>

        <View style={styles.gpsBanner}>
          <View style={styles.gpsDot}/>
          <View style={styles.gpsCopy}><Text style={styles.gpsTitle}>GPS đang ở chế độ mô phỏng</Text><Text style={styles.gpsText}>Sẽ kết nối vị trí nền ở lát cắt tiếp theo</Text></View>
          <Text style={styles.gpsTag}>DEMO</Text>
        </View>

        <Text style={styles.sectionLabel}>CHUYẾN TIẾP THEO</Text>
        <View style={styles.tripCard}>
          <View style={styles.tripTop}>
            <View style={styles.dateTile}><Text style={styles.dateNumber}>18</Text><Text style={styles.dateMonth}>THÁNG 7</Text></View>
            <View style={styles.tripTitle}><Text style={styles.tripCode}>BK-2401 · 06:30</Text><Text style={styles.tripName}>TP. Hồ Chí Minh → Vũng Tàu</Text><Text style={styles.tripMeta}>12 hành khách · Ford Transit</Text></View>
          </View>

          <View style={styles.routeBox}>
            <View style={styles.routeRail}><View style={styles.originDot}/><View style={styles.routeLine}/><View style={styles.destinationDot}/></View>
            <View style={styles.routeCopy}>
              <View><Text style={styles.pointLabel}>ĐIỂM ĐÓN</Text><Text style={styles.pointName}>124 Võ Thị Sáu, Quận 3</Text><Text style={styles.pointNote}>06:30 · Có mặt trước 15 phút</Text></View>
              <View><Text style={styles.pointLabel}>ĐIỂM ĐẾN</Text><Text style={styles.pointName}>The Grand Hồ Tràm, Vũng Tàu</Text><Text style={styles.pointNote}>Dự kiến 09:00</Text></View>
            </View>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}><Text style={styles.customerAvatarText}>NA</Text></View>
            <View style={styles.customerCopy}><Text style={styles.pointLabel}>KHÁCH HÀNG</Text><Text style={styles.customerName}>Nguyễn An</Text><Text style={styles.pointNote}>8 hành khách · 2 vali lớn</Text></View>
            <Pressable style={styles.callButton}><Text style={styles.callText}>Gọi khách</Text></Pressable>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TIẾN ĐỘ CHUYẾN</Text>
        <View style={styles.progressCard}>
          {tripStates.map((state, index) => {
            const completed = index < stateIndex;
            const active = index === stateIndex;
            return (
              <View key={state} style={styles.progressRow}>
                <View style={styles.progressRail}>
                  <View style={[styles.progressDot, completed && styles.progressDotDone, active && styles.progressDotActive]}><Text style={styles.progressCheck}>{completed ? "✓" : index + 1}</Text></View>
                  {index < tripStates.length - 1 && <View style={[styles.progressLine, completed && styles.progressLineDone]}/>} 
                </View>
                <View style={styles.progressCopy}><Text style={[styles.progressTitle, active && styles.progressTitleActive]}>{state}</Text><Text style={styles.progressNote}>{active ? "Trạng thái hiện tại" : completed ? "Đã cập nhật" : "Chưa bắt đầu"}</Text></View>
              </View>
            );
          })}
        </View>

        <Pressable disabled={stateIndex === tripStates.length - 1} onPress={() => setStateIndex((current) => Math.min(current + 1, tripStates.length - 1))} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, stateIndex === tripStates.length - 1 && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>{nextLabel}</Text><Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>
        <Text style={styles.footerNote}>Trạng thái hiện tại: {currentState}. Thao tác đang lưu cục bộ trong bản demo.</Text>
      </ScrollView>
    </View>
  );
}

const colors = { ink: "#17241b", green: "#1f6b45", pale: "#edf3ea", line: "#dce4d9", muted: "#778078", cream: "#f4f6f0", amber: "#e2a741" };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { paddingTop: 54, paddingBottom: 42, paddingHorizontal: 18, backgroundColor: colors.cream, minHeight: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  kicker: { color: colors.green, fontSize: 9, letterSpacing: 1.5, fontWeight: "800" },
  greeting: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "700", marginTop: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#dce8db" }, avatarText: { color: colors.green, fontSize: 12, fontWeight: "800" },
  gpsBanner: { flexDirection: "row", alignItems: "center", padding: 13, borderRadius: 14, backgroundColor: "#fff8e8", borderWidth: 1, borderColor: "#ecd9ad", marginBottom: 26 },
  gpsDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.amber, marginRight: 10 }, gpsCopy: { flex: 1 }, gpsTitle: { color: "#6f501c", fontSize: 11, fontWeight: "700" }, gpsText: { color: "#9a7b44", fontSize: 9, marginTop: 3 }, gpsTag: { color: "#8a641f", fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  sectionLabel: { color: colors.green, fontSize: 9, fontWeight: "900", letterSpacing: 1.4, marginBottom: 10 },
  tripCard: { backgroundColor: "white", borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 25 },
  tripTop: { flexDirection: "row", alignItems: "center" }, dateTile: { width: 58, height: 62, borderRadius: 13, backgroundColor: colors.pale, alignItems: "center", justifyContent: "center", marginRight: 13 }, dateNumber: { color: colors.green, fontSize: 26, fontWeight: "700" }, dateMonth: { color: colors.green, fontSize: 7, fontWeight: "900", marginTop: 1 }, tripTitle: { flex: 1 }, tripCode: { color: colors.green, fontSize: 8, fontWeight: "900", letterSpacing: .6 }, tripName: { color: colors.ink, fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 5 }, tripMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  routeBox: { flexDirection: "row", marginTop: 19, paddingVertical: 17, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#edf0eb" }, routeRail: { width: 20, alignItems: "center", paddingVertical: 4 }, originDot: { width: 9, height: 9, borderWidth: 2, borderColor: colors.green, borderRadius: 5, backgroundColor: "white" }, routeLine: { width: 1, flex: 1, minHeight: 43, borderLeftWidth: 1, borderStyle: "dashed", borderColor: "#aab7aa" }, destinationDot: { width: 9, height: 9, borderRadius: 2, backgroundColor: colors.green }, routeCopy: { flex: 1, gap: 17 }, pointLabel: { color: "#8c948c", fontSize: 7, fontWeight: "900", letterSpacing: .8 }, pointName: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 4 }, pointNote: { color: colors.muted, fontSize: 8, marginTop: 3 },
  customerRow: { flexDirection: "row", alignItems: "center", paddingTop: 16 }, customerAvatar: { width: 39, height: 39, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#e7eee5", marginRight: 10 }, customerAvatarText: { color: colors.green, fontSize: 10, fontWeight: "800" }, customerCopy: { flex: 1 }, customerName: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 3 }, callButton: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: colors.line }, callText: { color: colors.green, fontSize: 9, fontWeight: "800" },
  progressCard: { padding: 18, borderRadius: 20, backgroundColor: "white", borderWidth: 1, borderColor: colors.line, marginBottom: 16 }, progressRow: { flexDirection: "row", minHeight: 55 }, progressRail: { width: 31, alignItems: "center" }, progressDot: { width: 23, height: 23, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#cfd8cd", backgroundColor: "white" }, progressDotDone: { backgroundColor: colors.green, borderColor: colors.green }, progressDotActive: { borderWidth: 5, borderColor: "#cce0cf", backgroundColor: colors.green }, progressCheck: { color: colors.muted, fontSize: 8, fontWeight: "800" }, progressLine: { width: 1, flex: 1, backgroundColor: "#dfe6dd" }, progressLineDone: { backgroundColor: colors.green }, progressCopy: { flex: 1, paddingLeft: 8, paddingTop: 3 }, progressTitle: { color: "#929992", fontSize: 10, fontWeight: "700" }, progressTitleActive: { color: colors.ink }, progressNote: { color: "#a3aaa3", fontSize: 8, marginTop: 3 },
  primaryButton: { height: 53, borderRadius: 13, backgroundColor: colors.green, flexDirection: "row", alignItems: "center", justifyContent: "center" }, primaryButtonPressed: { opacity: .86 }, primaryButtonDisabled: { backgroundColor: "#91a398" }, primaryButtonText: { color: "white", fontSize: 12, fontWeight: "800" }, primaryButtonArrow: { color: "white", fontSize: 20, marginLeft: 12 }, footerNote: { color: colors.muted, fontSize: 8, lineHeight: 13, textAlign: "center", marginTop: 10, paddingHorizontal: 20 },
});
