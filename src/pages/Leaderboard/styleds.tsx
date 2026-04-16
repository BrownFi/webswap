import styled from 'styled-components'

export const Table = styled.table`
  width: 100%;
  thead {
    color: #978A80;
    font-family: Inter, sans-serif;
    font-weight: 500;
    font-size: 14px;
    tr {
      border-bottom: 1px solid #2F2823;
      td {
        padding: 12px 8px;
      }
    }
  }
  tbody {
    color: #FBFBFD;
    font-family: Inter, sans-serif;
    font-weight: 500;
    font-size: 16px;
    tr {
      border-bottom: 1px solid #2F2823;
      td {
        padding: 12px 8px;
        letter-spacing: 0.5px;
        height: 56px;
      }
      &:hover {
        background: rgba(47, 40, 35, 0.5);
      }
    }
  }
`
