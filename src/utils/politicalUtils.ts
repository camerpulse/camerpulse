export function normalizeRole(roleTitle?: string | null, level?: string | null): string {
  const src = (roleTitle || level || '').toLowerCase();
  
  if (src.includes('senator')) return 'Senator';
  if (src.includes('minister')) return 'Minister';
  if (src.includes('mayor')) return 'Mayor';
  if (src.includes('governor')) return 'Governor';
  if (src.includes('mp') || src.includes('member of parliament')) return 'MP';
  if (src.includes('president')) return 'President';
  if (src.includes('deputy')) return 'Deputy';
  if (src.includes('chief')) return 'Chief';
  if (src.includes('fon')) return 'Fon';
  
  return roleTitle || level || 'Politician';
}

export function getPartyAcronym(partyName: string): string {
  return partyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

export function calculatePartyStrength(memberCount: number): 'major' | 'medium' | 'minor' {
  if (memberCount >= 20) return 'major';
  if (memberCount >= 10) return 'medium';
  return 'minor';
}

export function getPerformanceColor(score?: number | null): string {
  if (!score) return 'text-muted-foreground';
  if (score >= 8) return 'text-success';
  if (score >= 6) return 'text-warning';
  return 'text-destructive';
}

export function getPerformanceBadgeVariant(score?: number | null): 'default' | 'secondary' | 'destructive' {
  if (!score) return 'secondary';
  if (score >= 8) return 'default';
  if (score >= 6) return 'secondary';
  return 'destructive';
}

export function formatPartyRole(role?: string | null): string {
  if (!role) return 'Member';
  
  switch (role.toLowerCase()) {
    case 'leader':
    case 'president':
      return 'Party Leader';
    case 'deputy':
    case 'vice_president':
      return 'Deputy Leader';
    case 'secretary':
      return 'Secretary General';
    case 'treasurer':
      return 'Treasurer';
    case 'chair':
    case 'chairman':
      return 'Chairman';
    default:
      return role;
  }
}

export function getRegionDisplayName(region?: string | null): string {
  if (!region) return 'Unknown Region';
  
  // Capitalize each word
  return region
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function sortByPerformance<T extends { performance_score?: number | null }>(
  items: T[], 
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = a.performance_score || 0;
    const scoreB = b.performance_score || 0;
    return order === 'desc' ? scoreB - scoreA : scoreA - scoreB;
  });
}

export function groupByRegion<T extends { region?: string | null }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const region = getRegionDisplayName(item.region);
    groups[region] = groups[region] || [];
    groups[region].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}