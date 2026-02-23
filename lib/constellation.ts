import type { Memo, Sky, SkyLink, SkyStar, SkyZone } from "@/lib/types";

const TOKEN_PATTERN = /[a-z0-9]+|[一-龠々〆〤ぁ-んァ-ヴー]{2,}/giu;
const STOP_WORDS = new Set(["について", "こと", "ため", "する", "した", "いる", "ある", "です", "ます", "から", "まで"]);

type Vec2 = { x: number; y: number };
type LinkRow = SkyLink & { score: number };

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

function positionNodesInZone(memos: Memo[], zone: SkyZone, links: LinkRow[]): SkyStar[] {
  const center: Vec2 = { x: zone.x, y: zone.y };
  const zoneRadius = getZoneRadius(zone) * 0.88;

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
    const desired = zoneRadius * (0.9 - link.score * 0.62);
    desiredByPair.set(`${link.from}::${link.to}`, clamp(desired, zoneRadius * 0.22, zoneRadius * 0.9));
    desiredByPair.set(`${link.to}::${link.from}`, clamp(desired, zoneRadius * 0.22, zoneRadius * 0.9));
  });

  for (let step = 0; step < 100; step += 1) {
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

        const repulsion = 0.012 / (dist * dist);
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
      const target = desiredByPair.get(`${link.from}::${link.to}`) ?? zoneRadius * 0.62;
      const spring = (dist - target) * (0.032 + link.score * 0.015);
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

      vel.x += (center.x - pos.x) * 0.01;
      vel.y += (center.y - pos.y) * 0.01;

      vel.x *= 0.82;
      vel.y *= 0.82;

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
      size: clamp(5 + d * 0.9 + (memo.pinned ? 1 : 0), 5, 9),
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
            from: `star-${pair[0]}`,
            to: `star-${pair[1]}`,
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
        from: `star-${from}`,
        to: `star-${to}`,
        score: 0.06,
      });
    }
  }

  return Array.from(links.values());
}

export function buildConstellationSky(memos: Memo[], baseSky: Sky): Sky {
  const zones = baseSky.zones.map((zone) => ({
    ...zone,
    count: memos.filter((memo) => memo.category === zone.category).length,
  }));

  const stars: SkyStar[] = [];
  const links: LinkRow[] = [];

  zones.forEach((zone) => {
    const zoneMemos = memos.filter((memo) => memo.category === zone.category);
    if (zoneMemos.length === 0) return;

    const zoneLinks = buildCategoryLinks(zoneMemos);
    const zoneStars = positionNodesInZone(zoneMemos, zone, zoneLinks);

    stars.push(...zoneStars);
    links.push(...zoneLinks);
  });

  return {
    ...baseSky,
    zones,
    stars,
    links,
  };
}
