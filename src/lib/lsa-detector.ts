export interface Point {
  x: number;
  y: number;
  z: number;
}

export const detectLetter = (landmarksArray: Point[][]): string | null => {
  if (!landmarksArray || landmarksArray.length === 0) return null;

  const getDist = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);

  const getDist2D = (p1: Point, p2: Point) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  const analyzeHand = (landmarks: Point[]) => {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[1]; // using thumb joint or base for distance

    const indexBase = landmarks[5];
    const indexTip = landmarks[8];

    const middleBase = landmarks[9];
    const middleTip = landmarks[12];

    const ringBase = landmarks[13];
    const ringTip = landmarks[16];

    const pinkyBase = landmarks[17];
    const pinkyTip = landmarks[20];

    const handScale = getDist(wrist, indexBase) || 1;

    // Heights (positive = finger up, negative = finger down)
    const indexHeight = (indexBase.y - indexTip.y) / handScale;
    const middleHeight = (middleBase.y - middleTip.y) / handScale;
    const ringHeight = (ringBase.y - ringTip.y) / handScale;
    const pinkyHeight = (pinkyBase.y - pinkyTip.y) / handScale;

    // Lengths 3D (how stretched a finger is)
    const indexLength3D = getDist(indexTip, indexBase) / handScale;
    const middleLength3D = getDist(middleTip, middleBase) / handScale;
    const ringLength3D = getDist(ringTip, ringBase) / handScale;
    const pinkyLength3D = getDist(pinkyTip, pinkyBase) / handScale;

    // Length 2D
    const indexLength2D = getDist2D(indexTip, indexBase) / handScale;

    // State functions
    const isUp = (len: number, height: number) => len > 0.75 && height > 0.2;
    const isDown = (len: number, height: number) => len > 0.75 && height < -0.15;
    const isFwd = (len: number, height: number) => len > 0.75 && height >= -0.15 && height <= 0.2;
    const isCurled = (len: number) => len <= 0.75;

    const isIndexUp = isUp(indexLength3D, indexHeight);
    const isMiddleUp = isUp(middleLength3D, middleHeight);
    const isRingUp = isUp(ringLength3D, ringHeight);
    const isPinkyUp = isUp(pinkyLength3D, pinkyHeight);

    const isIndexDown = isDown(indexLength3D, indexHeight);
    const isMiddleDown = isDown(middleLength3D, middleHeight);
    const isRingDown = isDown(ringLength3D, ringHeight);
    const isPinkyDown = isDown(pinkyLength3D, pinkyHeight);

    const isIndexFwd = isFwd(indexLength3D, indexHeight);
    const isMiddleFwd = isFwd(middleLength3D, middleHeight);
    const isRingFwd = isFwd(ringLength3D, ringHeight);
    const isPinkyFwd = isFwd(pinkyLength3D, pinkyHeight);

    const isIndexCurled = isCurled(indexLength3D);
    const isMiddleCurled = isCurled(middleLength3D);
    const isRingCurled = isCurled(ringLength3D);
    const isPinkyCurled = isCurled(pinkyLength3D);

    // Index pointing forward towards camera
    const isIndexPointingForward = indexLength3D > 0.5 && indexLength2D < 0.4 && (indexTip.z - indexBase.z) < -0.05;

    // Distances
    const thumbIndexDist = getDist(thumbTip, indexTip) / handScale;
    const thumbMiddleDist = getDist(thumbTip, middleTip) / handScale;
    const thumbPinkyDist = getDist(thumbTip, pinkyTip) / handScale;
    const thumbIndexBaseDist = getDist(thumbTip, indexBase) / handScale;
    const thumbPinkyBaseDist = getDist(thumbTip, pinkyBase) / handScale;
    const indexMiddleDist = getDist(indexTip, middleTip) / handScale;
    
    // For tighter curls like E
    const isTightCurl = indexLength3D < 0.5 && middleLength3D < 0.5;

    const areCrossed = (indexTip.x - middleTip.x) * (indexBase.x - middleBase.x) < 0;

    return {
      wrist, thumbTip, indexBase, indexTip, middleBase, middleTip, ringTip, pinkyTip, pinkyBase,
      handScale, 
      indexLength3D, middleLength3D, ringLength3D, pinkyLength3D,
      isIndexUp, isMiddleUp, isRingUp, isPinkyUp,
      isIndexDown, isMiddleDown, isRingDown, isPinkyDown,
      isIndexFwd, isMiddleFwd, isRingFwd, isPinkyFwd,
      isIndexCurled, isMiddleCurled, isRingCurled, isPinkyCurled,
      isIndexPointingForward, isTightCurl,
      thumbIndexDist, thumbMiddleDist, thumbPinkyDist, thumbIndexBaseDist, thumbPinkyBaseDist, indexMiddleDist,
      areCrossed
    };
  };

  const hand1 = analyzeHand(landmarksArray[0]);

  // ─── DOS MANOS ───────────────────────────────────────────────────────────
  if (landmarksArray.length >= 2) {
    const hand2 = analyzeHand(landmarksArray[1]);

    // W: Dos manos haciendo los "cuernos" (Índice y meñique arriba)
    const isHorns = (h: ReturnType<typeof analyzeHand>) =>
      h.isIndexUp && h.isPinkyUp && !h.isMiddleUp && !h.isRingUp;
    if (isHorns(hand1) && isHorns(hand2)) return "W";

    // X: Dos manos cruzadas (índices cruzados)
    const isIndexOnly = (h: ReturnType<typeof analyzeHand>) => 
      (h.isIndexUp || h.isIndexFwd) && !h.isMiddleUp && !h.isMiddleFwd && !h.isRingUp && !h.isRingFwd && !h.isPinkyUp && !h.isPinkyFwd;
    if (isIndexOnly(hand1) && isIndexOnly(hand2)) {
      return "X";
    }

    // Q: Una hace la O y la otra hace de "cola" (tocando abajo)
    const isO = (h: ReturnType<typeof analyzeHand>) =>
      h.thumbIndexDist < 0.35 && h.isMiddleUp && h.isRingUp && h.isPinkyUp;
    const isTail = (h: ReturnType<typeof analyzeHand>) => h.isIndexUp || h.isIndexDown;
    if ((isO(hand1) && isTail(hand2)) || (isO(hand2) && isTail(hand1))) return "Q";

    // Ñ: Una hace la N (índice y medio abajo juntos) y la otra la "corta" (plana horizontal)
    const isN = (h: ReturnType<typeof analyzeHand>) =>
      h.isIndexDown && h.isMiddleDown && !h.isRingDown && !h.isPinkyDown && h.indexMiddleDist < 0.4;
    const isFlatHoriz = (h: ReturnType<typeof analyzeHand>) =>
      h.indexLength3D > 0.5 && h.middleLength3D > 0.5 && (h.isIndexFwd || h.isIndexUp); 
    if ((isN(hand1) && isFlatHoriz(hand2)) || (isN(hand2) && isFlatHoriz(hand1))) return "Ñ";
  }

  // ─── UNA MANO ────────────────────────────────────────────────────────────

  // Helper function: All fingers are extended (Up or Fwd)
  const allUpOrFwd = (h: ReturnType<typeof analyzeHand>) => (h.isIndexUp || h.isIndexFwd) && (h.isMiddleUp || h.isMiddleFwd) && (h.isRingUp || h.isRingFwd) && (h.isPinkyUp || h.isPinkyFwd);
  
  // F, B, J: Flat hands (all 4 fingers extended)
  if (allUpOrFwd(hand1)) {
    // F: Thumb spreading out
    if (hand1.thumbIndexBaseDist > 0.55 && hand1.thumbIndexDist > 0.5) return "F";
    // J: Hand slightly tilted, thumb extremely tucked inside (less than 0.45 distance to index base and pinky)
    if (hand1.thumbIndexBaseDist < 0.45 && hand1.thumbPinkyDist < 0.55) return "J";
    // B: Thumb tucked but not extreme
    if (hand1.thumbIndexBaseDist <= 0.55) return "B";
  }

  // O: Thumb touches index forming circle, others UP
  if (hand1.isMiddleUp && hand1.isRingUp && hand1.isPinkyUp) {
    if (hand1.thumbIndexDist < 0.35) return "O";
  }

  // D: Duck beak. Index UP. Thumb touches middle/ring. Middle/Ring/Pinky are curled or fwd.
  if (hand1.isIndexUp && !hand1.isMiddleUp && !hand1.isRingUp && !hand1.isPinkyUp) {
    // En D, los dedos forman un pico, por lo que no están apretados contra la palma como en la I.
    if (hand1.thumbMiddleDist < 0.35 && hand1.middleLength3D > 0.45) return "D";
  }

  // N, M, P: Pointing down
  if (hand1.isIndexDown && hand1.isMiddleDown) {
    if (hand1.isRingDown) return "M"; // 3 down
    if (hand1.indexMiddleDist > 0.35) return "P"; // 2 separated
    return "N"; // 2 together
  }

  // U
  if (hand1.isIndexUp && hand1.isPinkyUp && !hand1.isMiddleUp && !hand1.isRingUp) return "U";

  // V, K, R: Index and Middle UP/Fwd
  if ((hand1.isIndexUp || hand1.isIndexFwd) && (hand1.isMiddleUp || hand1.isMiddleFwd) && !hand1.isRingUp && !hand1.isPinkyUp) {
    if (hand1.areCrossed) return "R";
    if (hand1.isIndexFwd) return "K"; // Pointing forward
    return "V"; // Pointing up
  }

  // Y: Pinky UP, Thumb sticking out, rest curled
  if (hand1.isPinkyUp && !hand1.isIndexUp && !hand1.isMiddleUp && !hand1.isRingUp) {
    if (hand1.thumbIndexBaseDist > 0.6) return "Y";
  }

  // H: Index & Middle horizontal (Fwd), rest curled
  if (hand1.isIndexFwd && hand1.isMiddleFwd && !hand1.isRingUp && !hand1.isPinkyUp) {
    return "H";
  }

  // L, T, I, Z, C, E, A, G, S (Most fingers curled or fwd-curled)
  if (!hand1.isMiddleUp && !hand1.isRingUp && !hand1.isPinkyUp) {

    // Index is UP
    if (hand1.isIndexUp) {
      // L: Thumb is completely out. Use distance to pinky base or index base.
      if (hand1.thumbPinkyBaseDist > 0.8 || hand1.thumbIndexBaseDist > 0.45) return "L"; // Thumb out
      if (hand1.thumbIndexBaseDist < 0.35 && hand1.thumbIndexDist > 0.4) return "T"; // Thumb tucked under index
      return "I"; // Z is the same statically
    }

    // Index is Fwd or Curled (C, E, A, G, S)
    if (hand1.isIndexCurled || hand1.isIndexFwd) {
      // S: Fist pointing forward
      if (hand1.isIndexPointingForward) return "S";

      // G: Pinching, thumb touching index
      if (hand1.thumbIndexDist < 0.4 && !hand1.isTightCurl) return "G";

      // E vs C vs A
      if ((hand1.isIndexCurled || hand1.isIndexFwd) && (hand1.isMiddleCurled || hand1.isMiddleFwd)) {
        // KEY DISTINCTION:
        // E = garra cerrada: el pulgar TOCA las puntas de los otros dedos (thumbMiddleDist pequeño)
        // C = arco abierto:  el pulgar está LEJOS de las puntas (thumbMiddleDist grande)
        
        // A: Pulgar apoyado firmemente al lado del índice (no llega a las puntas)
        if (hand1.thumbIndexBaseDist < 0.4 && hand1.thumbMiddleDist > 0.4) return "A";
        
        // E: Pulgar cerca de las puntas de los dedos (gancho cerrado)
        if (hand1.thumbMiddleDist < 0.45) return "E";
        
        // C: Pulgar lejos de las puntas → mano abierta en arco
        return "C";
      }
    }
  }

  return null;
};
