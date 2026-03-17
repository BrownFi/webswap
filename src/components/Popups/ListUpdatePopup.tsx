import { TokenList } from 'types/tokenList'
import { TYPE } from 'theme'
import listVersionLabel from 'utils/listVersionLabel'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

/**
 * Popup shown when a remote token list is updated.
 * Currently unused — all token lists are loaded from local JSON.
 */
export default function ListUpdatePopup({
  oldList,
  newList,
}: {
  popKey: string
  listUrl: string
  oldList: TokenList
  newList: TokenList
  auto: boolean
}) {
  return (
    <AutoRow>
      <AutoColumn style={{ flex: '1' }} gap="8px">
        <TYPE.body fontWeight={500}>
          The token list &quot;{oldList.name}&quot; has been updated to{' '}
          <strong>{listVersionLabel(newList.version)}</strong>.
        </TYPE.body>
      </AutoColumn>
    </AutoRow>
  )
}
