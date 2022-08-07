import styled from "styled-components";
import { phone, tablet } from "../constants/mediaSize";
import { runBulkAnalysis } from "../ml";
import { Button } from "@mui/material";

function Admin() {
  return (
    <StyledHomeContainer>
      <Rex>🦖Admin </Rex>
      <Button onClick={runBulkAnalysis}>Run Bulk Analysis</Button>
    </StyledHomeContainer>
  );
}

const Rex = styled.h1`
  font-size: 8em;
  margin-bottom: 0px;
  @media (max-width: ${tablet}) {
    font-size: 4em;
  }
  @media (max-width: ${phone}) {
    font-size: 2.5em;
  }
`;

const StyledHomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

export default Admin;
