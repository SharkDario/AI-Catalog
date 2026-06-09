export const detectLetter = (landmarks: any[]) => {
  // landmarks es un array de 21 puntos [x,y,z]
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const ringBase = landmarks[13];
  const pinkyBase = landmarks[17];

  const isFingerUp = (tip: any[], base: any[]) => tip[1] < base[1];

  const indexUp = isFingerUp(indexTip, indexBase);
  const middleUp = isFingerUp(middleTip, middleBase);
  const ringUp = isFingerUp(ringTip, ringBase);
  const pinkyUp = isFingerUp(pinkyTip, pinkyBase);

  const getDistance = (p1: any[], p2: any[]) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

  const handScale = getDistance(wrist, indexBase) || 1; // Para normalizar distancias
  const indexMiddleDist = getDistance(indexTip, middleTip) / handScale;
  const thumbIndexDist = getDistance(thumbTip, indexTip) / handScale;
  const indexLength = getDistance(indexTip, indexBase) / handScale;
  const thumbExtension = Math.abs(thumbTip[0] - indexBase[0]) / handScale;
  const indexHeight = (indexBase[1] - indexTip[1]) / handScale; // Qué tan alto apunta el índice
  const indexWidth = Math.abs(indexTip[0] - indexBase[0]) / handScale; // Qué tan horizontal apunta
  const middleLength = getDistance(middleTip, middleBase) / handScale;
  const middleHeight = (middleBase[1] - middleTip[1]) / handScale; // Qué tan alto apunta el medio
  const ringLength = getDistance(ringTip, ringBase) / handScale;
  const pinkyLength = getDistance(pinkyTip, pinkyBase) / handScale;
  const ringHeight = (ringBase[1] - ringTip[1]) / handScale;
  const pinkyHeight = (pinkyBase[1] - pinkyTip[1]) / handScale;
  const pinkyWidth = Math.abs(pinkyTip[0] - pinkyBase[0]) / handScale;
  const areCrossed = (indexTip[0] - middleTip[0]) * (indexBase[0] - middleBase[0]) < 0;
  const backFingersCurl = (middleLength + ringLength + pinkyLength) / 3;
  const backFingersHeight = (middleHeight + ringHeight + pinkyHeight) / 3;
  const thumbWristDist = getDistance(thumbTip, wrist) / handScale;
  const thumbIndexBaseDist = getDistance(thumbTip, indexBase) / handScale;

  // ─── PRIORIDAD MÁS ALTA ────────────────────────────────────────────────
  // F y B: Mano abierta (todos los dedos estirados)
  if (indexLength > 0.5 && backFingersCurl > 0.5) {
    if (thumbIndexBaseDist > 0.5 && thumbIndexDist > 0.6) return "F"; // Pulgar abierto
    if (thumbIndexBaseDist < 0.6) return "B"; // Pulgar cerrado
  }

  // ─── MANO APUNTANDO HACIA ABAJO (M, N, P, Q) ─────────────────────────────
  // Si los dedos principales apuntan hacia el suelo simultáneamente (la base está más alta que la punta).
  // Se requiere que AMBOS (índice y medio) apunten abajo para evitar falsos positivos con dedos doblados.
  if (indexHeight < -0.1 && middleHeight < -0.1) {
    if (indexLength > 0.4 && middleLength > 0.4 && ringLength > 0.4) return "M"; // 3 dedos
    if (indexLength > 0.4 && middleLength > 0.4 && indexMiddleDist > 0.3) return "P"; // 2 dedos separados
    if (indexLength > 0.4 && middleLength > 0.4) return "N"; // 2 dedos juntos
    if (thumbTip[1] > indexBase[1] && thumbIndexDist < 0.8) return "Q"; // Pinza hacia abajo
  }

  // ─── LETRAS HORIZONTALES (G, H) ──────────────────────────────────────────
  if (indexLength > 0.4 && ringLength < 0.5 && pinkyLength < 0.5 && indexWidth > Math.abs(indexHeight) + 0.1) {
    // Si el pulgar apunta hacia ARRIBA (forma un ángulo de 90° con el índice)
    if (thumbTip[1] < indexBase[1] - 0.1) {
      return "H";
    }
    // Si el pulgar NO apunta hacia arriba (está paralelo al índice o escondido)
    if (middleLength < 0.5) {
      return "G";
    }
  }

  // S: Puño cerrado con pulgar al costado
  if (indexLength < 0.5 && middleLength < 0.5 && ringLength < 0.5 && thumbExtension > 0.4) {
    return "S";
  }

  // ─── DEDOS CRUZADOS (R) ──────────────────────────────────────────────────
  if (indexHeight > 0.3 && middleHeight > 0.3 && areCrossed && ringLength < 0.5) return "R";

  // ─── ÍNDICE ARRIBA + PULGAR ABIERTO (K, L, V) ────────────────────────────
  if (indexHeight > 0.3 && thumbIndexBaseDist > 0.45 && ringLength < 0.5 && pinkyLength < 0.5) {
    // Si el pulgar está MUY lateral (casi horizontal), es L
    if (thumbExtension > 0.55 && thumbTip[1] > indexTip[1]) return "L";

    // Si el pulgar apunta hacia ARRIBA (V o K)
    if (thumbTip[1] < indexBase[1]) {
      // En la K, el dedo medio apunta hacia adelante (a la cámara).
      // Al apuntar adelante, la distancia de su punta a la muñeca es mayor que si estuviera completamente cerrado.
      const middleWristDist = getDistance(middleTip, wrist) / handScale;
      if (middleWristDist > 0.85) return "K"; // Dedo medio semi-abierto hacia adelante
      
      return "V"; // Dedo medio completamente cerrado
    }
  }

  // W: 3 dedos arriba
  if (indexHeight > 0.3 && middleHeight > 0.3 && ringHeight > 0.3 && pinkyLength < 0.5) return "W";

  // U: Índice y meñique arriba (cuernos)
  if (indexHeight > 0.3 && pinkyHeight > 0.3 && middleLength < 0.5 && ringLength < 0.5) return "U";

  // ─── D y O (3 dedos traseros arriba) ─────────────────────────────────────
  if (backFingersHeight > 0.3 && indexMiddleDist > 0.4) {
    if (indexLength < 0.6 && thumbIndexDist < 0.6) return "O";
    if (indexLength >= 0.4) return "D";
  }

  // ─── J, CH, C, E ─────────────────────────────────────────────────────────
  // J: Mano plana horizontal
  if (indexLength > 0.5 && backFingersCurl > 0.5 && Math.abs(indexHeight) < 0.3 && indexWidth > 0.5) return "J";

  // CH: Pico de pato horizontal
  if (indexLength > 0.6 && middleLength > 0.6 && indexWidth > 0.4 && Math.abs(indexHeight) < 0.5) return "CH";
  
  // C y E: Arcos/Puños con pulgar
  if (indexLength > 0.3 && Math.abs(indexHeight) < 0.8 && thumbIndexDist >= 0.25) {
    if (backFingersCurl >= 0.4) return "C";
    if (backFingersCurl < 0.4) return "E";
  }

  // ─── SOLO ÍNDICE ARRIBA (I, T, X, Z) ─────────────────────────────────────
  if (indexLength > 0.4 && middleLength < 0.5 && ringLength < 0.5 && pinkyLength < 0.5) {
    // Z: En diagonal
    if (indexWidth > 0.35 && Math.abs(indexHeight) < 0.65) return "Z";

    // X: Doblado en gancho (corto en altura y ancho)
    if (indexLength < 0.6 && indexHeight < 0.5 && indexWidth < 0.4) return "X";
    
    // T vs I: En T, el pulgar está metido entre el índice y medio, por lo que su punta sube
    if (thumbTip[1] < indexBase[1] + 0.05) return "T"; // Pulgar visiblemente apoyado arriba
    return "I"; // Pulgar fuertemente escondido abajo
  }

  // ─── Y, A (Cero dedos traseros arriba) ───────────────────────────────────
  if (indexLength < 0.5 && middleLength < 0.5 && ringLength < 0.5) {
    // Y: Meñique y pulgar
    if (pinkyLength > 0.5 && thumbExtension > 0.5) return "Y";
    // A: Puño cerrado puro con pulgar recto
    if (pinkyLength < 0.5 && thumbTip[1] < indexBase[1]) return "A";
  }

  return null;
};
