import { AuditCategory, AuditPhase } from '../types/audit.types';

export const AUDIT_CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  performance:   0.25,
  seo:           0.25,
  accessibility: 0.15,
  security:      0.15,
  content:       0.10,
  metadata:      0.05,
  links:         0.05,
};

export const AUDIT_PHASES: { phase: AuditPhase; label: string; labelEs: string; progress: number }[] = [
  { phase: 'initializing',  label: 'Initializing analysis',        labelEs: 'Inicializando análisis',           progress: 5  },
  { phase: 'fetching',      label: 'Loading page',                 labelEs: 'Cargando página',                  progress: 12 },
  { phase: 'performance',   label: 'Analyzing performance',        labelEs: 'Analizando rendimiento',           progress: 30 },
  { phase: 'seo',           label: 'Auditing SEO',                 labelEs: 'Auditando SEO',                    progress: 48 },
  { phase: 'content',       label: 'Analyzing content',            labelEs: 'Analizando contenido',             progress: 60 },
  { phase: 'metadata',      label: 'Checking metadata',            labelEs: 'Verificando metadatos',            progress: 68 },
  { phase: 'links',         label: 'Scanning links',               labelEs: 'Escaneando enlaces',               progress: 78 },
  { phase: 'accessibility', label: 'Checking accessibility',       labelEs: 'Verificando accesibilidad',        progress: 88 },
  { phase: 'security',      label: 'Auditing security',            labelEs: 'Auditando seguridad',              progress: 95 },
  { phase: 'scoring',       label: 'Calculating scores',           labelEs: 'Calculando puntuaciones',          progress: 99 },
  { phase: 'completed',     label: 'Analysis complete',            labelEs: 'Análisis completo',                progress: 100 },
];

export const SCORE_LABELS = {
  excellent: { min: 90, max: 100, label: 'Excellent', color: '#22c55e' },
  good:      { min: 70, max: 89,  label: 'Good',      color: '#84cc16' },
  fair:      { min: 50, max: 69,  label: 'Fair',      color: '#f59e0b' },
  poor:      { min: 0,  max: 49,  label: 'Poor',      color: '#ef4444' },
};

export const getScoreLabel = (score: number) => {
  if (score >= 90) return SCORE_LABELS.excellent;
  if (score >= 70) return SCORE_LABELS.good;
  if (score >= 50) return SCORE_LABELS.fair;
  return SCORE_LABELS.poor;
};
