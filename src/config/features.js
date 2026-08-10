// Central feature visibility config — never use if(fitness_level==='advanced') in components.
// Components call: features(profile).muscle_map, features(profile).coach_insights, etc.

const FEATURE_MAP = {
  simple: {
    muscle_map:      false,
    coach_insights:  false,
    rpe_field:       false,
    deload_alert:    false,
    volume_chart:    false,
    streak_pressure: false,
    progress_tab:    true,
    history_tab:     true,
    quick_log:       true,
  },
  standard: {
    muscle_map:      true,
    coach_insights:  true,
    rpe_field:       false,
    deload_alert:    true,
    volume_chart:    true,
    streak_pressure: true,
    progress_tab:    true,
    history_tab:     true,
    quick_log:       false,
  },
  advanced: {
    muscle_map:      true,
    coach_insights:  true,
    rpe_field:       true,
    deload_alert:    true,
    volume_chart:    true,
    streak_pressure: true,
    progress_tab:    true,
    history_tab:     true,
    quick_log:       false,
  },
};

export function features(profile) {
  const mode = profile?.ui_mode ?? 'standard';
  return FEATURE_MAP[mode] ?? FEATURE_MAP.standard;
}

// Vocabulary adapter — plain language for simple mode, technical for advanced
export function vocab(profile) {
  const mode = profile?.ui_mode ?? 'standard';
  const isSimple   = mode === 'simple';
  const isAdvanced = mode === 'advanced';
  return {
    deload:        isSimple ? 'semana más tranquila'   : isAdvanced ? 'semana de descarga (60%)'    : 'semana de recarga',
    stagnant:      isSimple ? 'sin subir hace un tiempo' : isAdvanced ? 'estancamiento detectado'   : 'sin progreso reciente',
    volumeGap:     isSimple ? 'no trabajaste este grupo' : isAdvanced ? 'déficit de volumen'        : 'grupo sin trabajar',
    progressLoad:  isSimple ? 'intentá sumar un poco más' : isAdvanced ? 'aplicá sobrecarga progresiva (+2.5kg)' : 'subí un poco el peso',
    deloadCTA:     isSimple ? '¿Querés una semana más fácil?' : isAdvanced ? 'Señal de deload: activar semana de descarga' : 'Esta semana andá con menos carga',
  };
}
