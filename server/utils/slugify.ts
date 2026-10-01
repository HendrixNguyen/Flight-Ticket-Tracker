/**
 * Deterministic id fallback for records that lack a stable upstream id.
 *
 * A random id changes on every request, which makes Vue tear down and rebuild
 * cards (killing transitions and selection state) and would also poison the
 * response cache with entries that never match. Deriving the id from the
 * record's own fields keeps it stable across requests.
 */
export const slugify = (name?: string, address?: string, prefix = 'hotel'): string => {
  const base = `${name || ''}-${address || ''}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

  return base ? `${prefix}-${base}` : `${prefix}-unknown`;
};