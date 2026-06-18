import { HelpCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'

// Placeholder until Jason provides the real Learn More URL.
export const ANNUALIZED_RETURN_LEARN_MORE_URL = '#'
const ANNUALIZED_RETURN_HINT =
  'Annualized return vs. UniV2 baseline. For reference only. Short-term estimates may differ from long-term results.'

/**
 * Generic (?) metric helper — an interactive tooltip with an optional clickable
 * "Learn More" link. Uses MouseoverTooltip (stays open when the cursor moves
 * into the tooltip) so the link is reachable, unlike the plain QuestionHelper
 * which closes on mouse-leave.
 */
export function InfoTooltip({ text, learnMoreUrl }: { text: string; learnMoreUrl?: string }) {
  return (
    <MouseoverTooltip
      text={
        <span style={{ display: 'block', maxWidth: 280, whiteSpace: 'normal', lineHeight: '18px' }}>
          {text}
          {learnMoreUrl && (
            <>
              <br />
              <br />
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#D8A072', textDecoration: 'underline' }}
              >
                Learn More
              </a>
            </>
          )}
        </span>
      }
    >
      <span
        style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4, color: '#978A80', cursor: 'help' }}
        // Stop the click from bubbling to the parent (sort button / legend toggle).
        onClick={(e) => e.stopPropagation()}
      >
        <HelpCircle size={14} />
      </span>
    </MouseoverTooltip>
  )
}

/** V3 "Annualized Return" metric helper (pool list + detail). */
export function AnnualizedReturnInfo() {
  return <InfoTooltip text={ANNUALIZED_RETURN_HINT} learnMoreUrl={ANNUALIZED_RETURN_LEARN_MORE_URL} />
}
