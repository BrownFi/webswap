interface PositionCallResult<T> {
  result?: T
  error?: unknown
}

export function pairSuccessfulPositionResults<T, TTokenId>(
  results: readonly PositionCallResult<T>[] | undefined,
  tokenIds: readonly TTokenId[],
) {
  return (results ?? []).flatMap((call, index) =>
    call.error || call.result === undefined ? [] : [{ result: call.result, tokenId: tokenIds[index] }],
  )
}
