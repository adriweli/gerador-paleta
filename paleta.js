function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex([r, g, b]) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function mixColors(hex1, hex2, ratio = 0.5) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const rgb = [
    Math.round(rgb1[0] * (1 - ratio) + rgb2[0] * ratio),
    Math.round(rgb1[1] * (1 - ratio) + rgb2[1] * ratio),
    Math.round(rgb1[2] * (1 - ratio) + rgb2[2] * ratio)
  ];
  return rgbToHex(rgb);
}

function desenhar() {
  const c1 = document.getElementById('color1').value;
  const c2 = document.getElementById('color2').value;
  const c3 = document.getElementById('color3').value;

  // Secundárias e terciárias para o arco cromático
  const s1 = mixColors(c1, c2);
  const s2 = mixColors(c2, c3);
  const s3 = mixColors(c3, c1);
  const t1 = mixColors(c1, s1);
  const t2 = mixColors(s1, c2);
  const t3 = mixColors(c2, s2);
  const t4 = mixColors(s2, c3);
  const t5 = mixColors(c3, s3);
  const t6 = mixColors(s3, c1);

  // Ordem cromática (começando por c1, sentido horário)
  const cromatico = [
    c1, t1, s1, t2, c2, t3, s2, t4, c3, t5, s3, t6
  ];

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Parâmetros dos raios
  const rTri = 180;     // Raio do triângulo central (até o arco)
  const r3 = 180;       // Raio interno do arco externo
  const r4 = 220;       // Raio externo do arco externo
  const rSec = r3;      // Ponta dos triângulos secundários toca o arco interno

  // Alinhamento: cada vértice do triângulo aponta para o centro do segmento correspondente do arco
  const nSegments = 12;
  const anglePerSegment = 2 * Math.PI / nSegments;
  const offset = -Math.PI / 2 + anglePerSegment / 2; // Centraliza o vértice no meio do segmento

  // Cálculo dos vértices do triângulo central (equilátero, alinhado)
  const triAngles = [
    0,
    2 * Math.PI / 3,
    4 * Math.PI / 3
  ].map(a => a + offset);

  const triPoints = triAngles.map(a => [
    cx + rTri * Math.cos(a),
    cy + rTri * Math.sin(a)
  ]);

  // Centroide do triângulo
  const centroid = [
    (triPoints[0][0] + triPoints[1][0] + triPoints[2][0]) / 3,
    (triPoints[0][1] + triPoints[1][1] + triPoints[2][1]) / 3
  ];

  // Pontos médios dos lados
  const midPoints = [
    [(triPoints[0][0] + triPoints[1][0]) / 2, (triPoints[0][1] + triPoints[1][1]) / 2],
    [(triPoints[1][0] + triPoints[2][0]) / 2, (triPoints[1][1] + triPoints[2][1]) / 2],
    [(triPoints[2][0] + triPoints[0][0]) / 2, (triPoints[2][1] + triPoints[0][1]) / 2]
  ];

  // 1. Triângulo central dividido em 3 quadriláteros (cada cor primária)
  const cores = [c1, c2, c3];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(...triPoints[i]);
    ctx.lineTo(...midPoints[i]);
    ctx.lineTo(...centroid);
    ctx.lineTo(...midPoints[(i + 2) % 3]);
    ctx.closePath();
    ctx.fillStyle = cores[i];
    ctx.fill();
    // Sem contorno
  }

  // 2. Triângulos das cores secundárias (laranja, roxo, cinza)
  // Cada triângulo tem base em um lado do triângulo central e ponta para o centro do segmento secundário correspondente no arco INTERNO
  const secCores = [s1, s2, s3];
  for (let i = 0; i < 3; i++) {
    // Ângulo do centro do segmento secundário no arco
    // Segmentos secundários estão nos índices 2, 6, 10 do array cromatico
    const secIndex = 2 + i * 4;
    const secAngle = (secIndex + 0.5) * anglePerSegment + offset - anglePerSegment / 2;
    const secPonta = [
      cx + rSec * Math.cos(secAngle),
      cy + rSec * Math.sin(secAngle)
    ];
    // Base do triângulo: lado do triângulo central
    const baseA = triPoints[i];
    const baseB = triPoints[(i + 1) % 3];
    ctx.beginPath();
    ctx.moveTo(...baseA);
    ctx.lineTo(...baseB);
    ctx.lineTo(...secPonta);
    ctx.closePath();
    ctx.fillStyle = secCores[i];
    ctx.fill();
    // Sem contorno
  }

  // 3. Arco externo segmentado (círculo cromático)
  for (let i = 0; i < 12; i++) {
    const start = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const end = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r3, start, end, false);
    ctx.arc(cx, cy, r4, end, start, true);
    ctx.closePath();
    ctx.fillStyle = cromatico[i];
    ctx.fill();
    // Sem contorno
  }
}

// Exportação de paleta para vários formatos
function exportarPaleta() {
  const c1 = document.getElementById('color1').value;
  const c2 = document.getElementById('color2').value;
  const c3 = document.getElementById('color3').value;

  // Secundárias e terciárias
  const s1 = mixColors(c1, c2);
  const s2 = mixColors(c2, c3);
  const s3 = mixColors(c3, c1);
  const t1 = mixColors(c1, s1);
  const t2 = mixColors(s1, c2);
  const t3 = mixColors(c2, s2);
  const t4 = mixColors(s2, c3);
  const t5 = mixColors(c3, s3);
  const t6 = mixColors(s3, c1);

  // Paleta final
  const palette = [
    c1, t1, s1, t2, c2, t3, s2, t4, c3, t5, s3, t6
  ];

  const format = document.getElementById('exportFormat').value;
  let blob, filename;

  if (format === "procreate") {
    // Procreate: arquivo .swatches (JSON simples)
    const data = JSON.stringify({colors: palette});
    blob = new Blob([data], {type: "application/json"});
    filename = "paleta-procreate.swatches";
  } else if (format === "sketchbook") {
    // Sketchbook: arquivo .skcolors (JSON simples)
    const data = JSON.stringify({colors: palette});
    blob = new Blob([data], {type: "application/json"});
    filename = "paleta-sketchbook.skcolors";
  } else if (format === "illustrator") {
    // Illustrator: arquivo .ase (texto simples para importação manual)
    let ase = "ASEF";
    palette.forEach(hex => ase += "\n" + hex);
    blob = new Blob([ase], {type: "text/plain"});
    filename = "paleta-illustrator.ase";
  } else if (format === "photoshop") {
    // Photoshop: arquivo .aco (texto simples para importação manual)
    let aco = "ACO";
    palette.forEach(hex => aco += "\n" + hex);
    blob = new Blob([aco], {type: "text/plain"});
    filename = "paleta-photoshop.aco";
  }

  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Desenha ao carregar a página
window.onload = desenhar;
