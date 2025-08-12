import { Fragment, memo, useContext } from 'react'

import { Trade } from '@brownfi/sdk'
import { ChevronRight } from 'react-feather'
import { Flex } from 'rebass'
import { ThemeContext } from 'styled-components'

import { useActiveWeb3React } from 'hooks'

import { getTokenSymbol } from 'utils'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { TYPE } from 'theme'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const theme = useContext(ThemeContext)
  const { chainId } = useActiveWeb3React()
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          <Fragment key={i}>
            <Flex alignItems="end">
              <TYPE.black fontSize={14} color={theme.white} ml="0.125rem" mr="0.125rem">
                {getTokenSymbol(currency, chainId)}
              </TYPE.black>
            </Flex>
            {isLastItem ? null : <ChevronRight size={12} color={theme.white} />}
          </Fragment>
        )
      })}
    </Flex>
  )
})
