import styled from 'styled-components'

export const Table = styled.table`
  width: 100%;
  thead {
    color: #949494;
    font-weight: 700;
    tr {
      border-bottom: 1px solid #464444;
      td {
        padding: 8px;
      }
    }
  }
  tbody {
    color: white;
    font-weight: 500;
    tr {
      border-bottom: 1px solid #464444;
      td {
        padding: 8px;
        letter-spacing: 1px;
        height: 56px;
      }
    }
  }
`
