import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, Download, FileText, ShieldCheck, Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS } from '../theme/colors';

type DocumentRecord = { title: string; subtitle: string; date: string; status: string; size: string; pages: number; tags: string[] };
type Props = { navigation: { goBack: () => void }; route: { params?: { doc?: DocumentRecord } } };

export const DocumentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const doc = route.params?.doc;
  if (!doc) {
    return <View style={styles.container}><ScreenHeader title="Документ" onBack={navigation.goBack} /><View style={styles.empty}><FileText size={42} color={COLORS.textMuted} /><Text style={styles.emptyTitle}>Документ не найден</Text></View></View>;
  }
  return (
    <View style={styles.container}>
      <ScreenHeader title="Документ" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.preview}><View style={styles.fileIcon}><FileText size={50} color={COLORS.text} /></View><Text style={styles.pageCount}>{doc.pages} стр.</Text></View>
        <Text style={styles.title}>{doc.title}</Text><Text style={styles.subtitle}>{doc.subtitle}</Text>
        <View style={styles.metaCard}><View style={styles.metaRow}><CalendarDays size={17} color={COLORS.textMuted} /><Text style={styles.metaLabel}>Добавлен</Text><Text style={styles.metaValue}>{doc.date}</Text></View><View style={styles.metaRow}><FileText size={17} color={COLORS.textMuted} /><Text style={styles.metaLabel}>Размер</Text><Text style={styles.metaValue}>{doc.size}</Text></View><View style={styles.metaRow}><ShieldCheck size={17} color={COLORS.textMuted} /><Text style={styles.metaLabel}>Статус</Text><Text style={styles.metaValue}>{doc.status}</Text></View></View>
        <View style={styles.tags}>{doc.tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View>
        <TouchableOpacity style={styles.download} onPress={() => Alert.alert('Скачивание началось', 'Документ будет сохранён в файлах устройства.')}><Download size={18} color={COLORS.text} /><Text style={styles.downloadText}>Скачать документ</Text></TouchableOpacity>
        <TouchableOpacity style={styles.delete} onPress={() => Alert.alert('Удалить документ?', 'Это действие нельзя отменить.', [{ text: 'Отмена', style: 'cancel' }, { text: 'Удалить', style: 'destructive', onPress: navigation.goBack }])}><Trash2 size={17} color={COLORS.danger} /><Text style={styles.deleteText}>Удалить</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  preview: { height: 240, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted, position: 'relative' },
  fileIcon: { width: 110, height: 130, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pageCount: { position: 'absolute', right: 14, bottom: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, fontSize: 11, fontWeight: '800', color: COLORS.text },
  title: { marginTop: 22, fontSize: 23, fontWeight: '900', lineHeight: 28, color: COLORS.text },
  subtitle: { marginTop: 6, fontSize: 13, lineHeight: 19, color: COLORS.textMuted },
  metaCard: { marginTop: 18, paddingHorizontal: 15, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  metaRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  metaLabel: { flex: 1, fontSize: 12, color: COLORS.textMuted },
  metaValue: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.accentSoft },
  tagText: { fontSize: 11, fontWeight: '800', color: COLORS.text },
  download: { minHeight: 52, marginTop: 22, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  downloadText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  delete: { minHeight: 48, marginTop: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.dangerSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteText: { fontSize: 14, fontWeight: '800', color: COLORS.danger },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '900', color: COLORS.text },
});
