import sortByListPriority from './listSort'
import { DEFAULT_LIST_OF_LISTS } from 'constants/lists'

describe('sortByListPriority', () => {
  it('returns 0 for equal priority', () => {
    expect(sortByListPriority('unknown-a', 'unknown-b')).toBe(0)
  })

  it('returns 0 for same URL', () => {
    expect(sortByListPriority('same-url', 'same-url')).toBe(0)
  })

  it('handles URLs not in default list', () => {
    const result = sortByListPriority('not-in-list-a', 'not-in-list-b')
    expect(result).toBe(0)
  })

  if (DEFAULT_LIST_OF_LISTS.length >= 2) {
    it('gives higher priority to earlier list entries', () => {
      const first = DEFAULT_LIST_OF_LISTS[0]
      const second = DEFAULT_LIST_OF_LISTS[1]
      // first has lower index = higher priority, so should return 1 (reverse order)
      expect(sortByListPriority(first, second)).toBe(1)
      expect(sortByListPriority(second, first)).toBe(-1)
    })
  }

  if (DEFAULT_LIST_OF_LISTS.length >= 1) {
    it('prioritizes default list URLs over unknown', () => {
      const known = DEFAULT_LIST_OF_LISTS[0]
      // known has real index, unknown has MAX_SAFE_INTEGER
      // known < unknown = returns 1 (reverse order)
      expect(sortByListPriority(known, 'unknown')).toBe(1)
      expect(sortByListPriority('unknown', known)).toBe(-1)
    })
  }
})
