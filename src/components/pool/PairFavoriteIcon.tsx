import { Pair } from '@brownfi/sdk'
import { Heart } from 'react-feather'
import { useLocalStorage } from 'usehooks-ts'

type Props = {
  pair: Pair
}

type PairSave = {
  isFavorite?: boolean
}

export const usePairStorage = ({ pair }: Props) => {
  return useLocalStorage<PairSave>(`PAIR-${pair.liquidityToken.address}`, {
    isFavorite: false,
  })
}

export const PairFavorite = ({ pair }: Props) => {
  const [{ isFavorite, ...rest }, setPairStorage] = usePairStorage({ pair })

  return (
    <div className="cursor-pointer" onClick={() => setPairStorage({ ...rest, isFavorite: !isFavorite })}>
      {isFavorite ? (
        <Heart size="20" style={{ fill: '#27E3AB', color: '#27E3AB' }} />
      ) : (
        <Heart size="20" style={{ color: '#239d7a' }} />
      )}
    </div>
  )
}
