import type { Memo, MemoCategory, Sky, SkyLink, SkyStar, SkyZone } from "@/lib/types";

const TOKEN_PATTERN = /[a-z0-9]+|[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]{2,}/giu;
const STOP_WORDS = new Set(["about", "this", "that", "with", "from", "into", "todo", "memo"]);

type Vec2 = { x: number; y: number };
type LinkRow = { id: string; from: string; to: string; score: number };
type ZoneLayoutNode = {
  id: string;
  category: MemoCategory;
  count: number;
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  radius: number;
};

const ZONE_GAP = 1.8;
const ZONE_MIN_SCALE = 0.44;
const ZONE_BOUNDS = {
  minX: 5,
  maxX: 95,
  minY: 13.8,
  maxY: 90.6,
};

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tokenize(text: string): string[] {
  const tokens = text.toLowerCase().match(TOKEN_PATTERN) ?? [];
  return tokens.filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const aSet = new Set(a);
  const bSet = new Set(b);
  let intersection = 0;
  for (const item of aSet) {
    if (bSet.has(item)) intersection += 1;
  }
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function memoSimilarity(a: Memo, b: Memo): number {
  const tags = overlapScore(a.tags, b.tags);
  const textTokensA = tokenize(`${a.title} ${a.summary}`);
  const textTokensB = tokenize(`${b.title} ${b.summary}`);
  const keywords = overlapScore(textTokensA, textTokensB);
  return clamp(tags * 0.65 + keywords * 0.35, 0, 1);
}

function getZoneRadius(zone: SkyZone): number {
  return zone.size / 2;
}

function getScaledZoneRadius(baseRadius: number, count: number): number {
  return baseRadius + count * 1.15;
}

function clampZoneNode(node: ZoneLayoutNode) {
  node.x = clamp(node.x, ZONE_BOUNDS.minX + node.radius, ZONE_BOUNDS.maxX - node.radius);
  node.y = clamp(node.y, ZONE_BOUNDS.minY + node.radius, ZONE_BOUNDS.maxY - node.radius);
}

function hasZoneOverlap(nodes: ZoneLayoutNode[]): boolean {
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const minDistance = a.radius + b.radius + ZONE_GAP;
      if (distance < minDistance) return true;
    }
  }
  return false;
}

function runZoneRelaxation(nodes: ZoneLayoutNode[]) {
  for (let step = 0; step < 260; step += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.max(0.0001, Math.hypot(dx, dy));
        const minDistance = a.radius + b.radius + ZONE_GAP;
        if (distance >= minDistance) continue;

        const overlap = minDistance - distance;
        const nx = dx / distance;
        const ny = dy / distance;
        const move = overlap * 0.5;

        a.x -= nx * move;
        a.y -= ny * move;
        b.x += nx * move;
        b.y += ny * move;
      }
    }

    nodes.forEach((node) => {
      node.x += (node.anchorX - node.x) * 0.024;
      node.y += (node.anchorY - node.y) * 0.024;
      clampZoneNode(node);
    });
  }
}

function resolveZoneLayout(baseZones: SkyZone[], countsByCategory: Map<MemoCategory, number>): SkyZone[] {
  const createNodes = (scale: number): ZoneLayoutNode[] =>
    baseZones.map((zone) => {
      const count = countsByCategory.get(zone.category) ?? 0;
      const baseRadius = getZoneRadius(zone);
      const scaledRadius = getScaledZoneRadius(baseRadius, count) * scale;

      return {
        id: zone.id,
        category: zone.category,
        count,
        anchorX: zone.x,
        anchorY: zone.y,
        x: zone.x,
        y: zone.y,
        radius: scaledRadius,
      };
    });

  let low = ZONE_MIN_SCALE;
  let high = 1;
  let best = createNodes(ZONE_MIN_SCALE);
  runZoneRelaxation(best);

  for (let i = 0; i < 16; i += 1) {
    const mid = (low + high) / 2;
    const candidate = createNodes(mid);
    runZoneRelaxation(candidate);

    if (hasZoneOverlap(candidate)) {
      high = mid;
      continue;
    }

    low = mid;
    best = candidate;
  }

  return best.map((node) => ({
    id: node.id,
    category: node.category,
    count: node.count,
    x: node.x,
    y: node.y,
    size: node.radius * 2,
  }));
}

function enforceMinDistance(
  positions: Map<string, Vec2>,
  ids: string[],
  center: Vec2,
  zoneRadius: number,
  minDistance: number
) {
  for (let i = 0; i < ids.length; i += 1) {
    const idA = ids[i];
    const a = positions.get(idA);
    if (!a) continue;

    for (let j = i + 1; j < ids.length; j += 1) {
      const idB = ids[j];
      const b = positions.get(idB);
      if (!b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(0.0001, Math.hypot(dx, dy));
      if (dist >= minDistance) continue;

      const overlap = (minDistance - dist) * 0.5;
      const nx = dx / dist;
      const ny = dy / dist;

      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
    }
  }

  ids.forEach((id) => {
    const pos = positions.get(id);
    if (!pos) return;

    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const dist = Math.hypot(dx, dy);
    if (dist > zoneRadius) {
      const unitX = dx / dist;
      const unitY = dy / dist;
      pos.x = center.x + unitX * zoneRadius;
      pos.y = center.y + unitY * zoneRadius;
    }
  });
}

function positionNodesInZone(memos: Memo[], zone: SkyZone, links: LinkRow[]): SkyStar[] {
  const center: Vec2 = { x: zone.x, y: zone.y };
  const zoneRadius = getZoneRadius(zone) * 0.88;
  const minDistance = clamp(2.2 + memos.length * 0.08, 2.2, 4.4);

  const positions = new Map<string, Vec2>();
  const velocity = new Map<string, Vec2>();

  memos.forEach((memo, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, memos.length) + hash(`${memo.id}:a`) * 0.8;
    const radius = zoneRadius * (0.24 + hash(`${memo.id}:r`) * 0.6);
    positions.set(memo.id, {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
    velocity.set(memo.id, { x: 0, y: 0 });
  });

  const desiredByPair = new Map<string, number>();
  links.forEach((link) => {
    const desired = zoneRadius * (0.96 - link.score * 0.46);
    desiredByPair.set(`${link.from}::${link.to}`, clamp(desired, zoneRadius * 0.36, zoneRadius * 0.96));
    desiredByPair.set(`${link.to}::${link.from}`, clamp(desired, zoneRadius * 0.36, zoneRadius * 0.96));
  });

  for (let step = 0; step < 140; step += 1) {
    for (let i = 0; i < memos.length; i += 1) {
      const a = memos[i];
      const posA = positions.get(a.id)!;
      const velA = velocity.get(a.id)!;

      for (let j = i + 1; j < memos.length; j += 1) {
        const b = memos[j];
        const posB = positions.get(b.id)!;

        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.max(0.001, Math.hypot(dx, dy));

        const repulsion = 0.22 / (dist * dist);
        const rx = (dx / dist) * repulsion;
        const ry = (dy / dist) * repulsion;

        velA.x -= rx;
        velA.y -= ry;

        const velB = velocity.get(b.id)!;
        velB.x += rx;
        velB.y += ry;
      }
    }

    for (const link of links) {
      const posA = positions.get(link.from);
      const posB = positions.get(link.to);
      if (!posA || !posB) continue;

      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const dist = Math.max(0.001, Math.hypot(dx, dy));
      const target = desiredByPair.get(`${link.from}::${link.to}`) ?? zoneRadius * 0.78;
      const spring = (dist - target) * (0.013 + link.score * 0.012);
      const sx = (dx / dist) * spring;
      const sy = (dy / dist) * spring;

      const velA = velocity.get(link.from)!;
      const velB = velocity.get(link.to)!;
      velA.x += sx;
      velA.y += sy;
      velB.x -= sx;
      velB.y -= sy;
    }

    for (const memo of memos) {
      const pos = positions.get(memo.id)!;
      const vel = velocity.get(memo.id)!;

      vel.x += (center.x - pos.x) * 0.0018;
      vel.y += (center.y - pos.y) * 0.0018;

      vel.x *= 0.88;
      vel.y *= 0.88;

      pos.x += vel.x;
      pos.y += vel.y;

      const dx = pos.x - center.x;
      const dy = pos.y - center.y;
      const dist = Math.hypot(dx, dy);

      if (dist > zoneRadius) {
        const unitX = dx / dist;
        const unitY = dy / dist;
        pos.x = center.x + unitX * zoneRadius;
        pos.y = center.y + unitY * zoneRadius;
      }
    }

    if (step % 4 === 0) {
      enforceMinDistance(
        positions,
        memos.map((memo) => memo.id),
        center,
        zoneRadius,
        minDistance
      );
    }
  }

  const degree = new Map<string, number>();
  links.forEach((link) => {
    degree.set(link.from, (degree.get(link.from) ?? 0) + 1);
    degree.set(link.to, (degree.get(link.to) ?? 0) + 1);
  });

  return memos.map((memo) => {
    const pos = positions.get(memo.id)!;
    const d = degree.get(memo.id) ?? 0;

    return {
      id: `star-${memo.id}`,
      memoId: memo.id,
      category: memo.category,
      x: clamp(pos.x, 4, 96),
      y: clamp(pos.y, 8, 92),
      size: clamp(10 + d * 1.2 + (memo.pinned ? 1 : 0), 10, 14),
    };
  });
}

function buildCategoryLinks(memos: Memo[]): LinkRow[] {
  if (memos.length <= 1) return [];

  const scoreRows = memos.map((memo) => ({
    memo,
    neighbors: memos
      .filter((candidate) => candidate.id !== memo.id)
      .map((candidate) => ({ candidate, score: memoSimilarity(memo, candidate) }))
      .sort((a, b) => b.score - a.score),
  }));

  const links = new Map<string, LinkRow>();

  scoreRows.forEach((row) => {
    row.neighbors
      .filter((neighbor) => neighbor.score >= 0.08)
      .slice(0, 2)
      .forEach(({ candidate, score }) => {
        const pair = [row.memo.id, candidate.id].sort();
        const key = `${pair[0]}::${pair[1]}`;
        const current = links.get(key);
        if (!current || current.score < score) {
          links.set(key, {
            id: `link-${pair[0]}-${pair[1]}`,
            from: pair[0],
            to: pair[1],
            score,
          });
        }
      });
  });

  if (links.size === 0) {
    for (let i = 0; i < memos.length - 1; i += 1) {
      const from = memos[i].id;
      const to = memos[i + 1].id;
      links.set(`${from}::${to}`, {
        id: `link-${from}-${to}`,
        from,
        to,
        score: 0.06,
      });
    }
  }

  return Array.from(links.values());
}

function resolveZoneCategory(category: MemoCategory, available: Set<MemoCategory>): MemoCategory {
  if (available.has(category)) return category;

  const fallbackMap: Partial<Record<MemoCategory, MemoCategory>> = {
    ミーティング: "やること",
    日記: "メモ",
    調べもの: "学び",
    "買い物・ごはん": "やること",
    "約束・連絡": "やること",
  };

  const mapped = fallbackMap[category];
  if (mapped && available.has(mapped)) return mapped;
  if (available.has("メモ")) return "メモ";

  const ordered = Array.from(available);
  return ordered[0] ?? category;
}

export function buildConstellationSky(memos: Memo[], baseSky: Sky): Sky {
  const availableCategories = new Set(baseSky.zones.map((zone) => zone.category));
  const grouped = new Map<MemoCategory, Memo[]>();

  memos.forEach((memo) => {
    const zoneCategory = resolveZoneCategory(memo.category, availableCategories);
    grouped.set(zoneCategory, [...(grouped.get(zoneCategory) ?? []), memo]);
  });

  const countsByCategory = new Map<MemoCategory, number>(
    baseSky.zones.map((zone) => [zone.category, grouped.get(zone.category)?.length ?? 0])
  );
  const zones = resolveZoneLayout(baseSky.zones, countsByCategory);

  const stars: SkyStar[] = [];
  const links: SkyLink[] = [];

  zones.forEach((zone) => {
    const zoneMemos = grouped.get(zone.category) ?? [];
    if (zoneMemos.length === 0) return;

    const zoneLinks = buildCategoryLinks(zoneMemos);
    const zoneStars = positionNodesInZone(zoneMemos, zone, zoneLinks);

    stars.push(...zoneStars);
    links.push(
      ...zoneLinks.map((link) => ({
        id: link.id,
        from: `star-${link.from}`,
        to: `star-${link.to}`,
        score: link.score,
      }))
    );
  });

  return {
    ...baseSky,
    zones,
    stars,
    links,
  };
}
