import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import brian from "../img/brian.jpg";
import gal from "../img/gal.jpg";
import christina from "../img/christina.jpg";
import zora from "../img/zora.png";
import spinamp from "../img/spinamp.jpg";
import polygon from "../img/polygon.png";
import dig from "../img/dig.jpg";
import tapes from "../img/tapes.jpg";

function Home() {
  const navigate = useNavigate();
  return (
    <StyledHomeContainer>
      <Rex>🦖🎵 Rex 🎵🦖</Rex>
      <div>A whole new way to find music you love on the blockchain.</div>
      <div>
        Get new music recommendations based on what owners and curators are
        collecting.
      </div>
      <StartButton onClick={() => navigate("/trackList")}>
        start digging
      </StartButton>
      <img alt="dig" src={dig} />
      <Team>
        <h1>Meet The Team</h1>
        <Photos>
          <PhotoWithCaption>
            <Photo alt={"Brian C"} src={brian} />
            <Name>Brian C</Name>
            <SubName>aka</SubName>
            <SubName>Corporation Plaza</SubName>
          </PhotoWithCaption>
          <PhotoWithCaption>
            <Photo alt={"Christina"} src={christina} />
            <Name>Christina K</Name>
            <SubName>Engineering</SubName>
          </PhotoWithCaption>
          <PhotoWithCaption>
            <Photo alt={"Gal S"} src={gal} />
            <Name>Gal S</Name>
            <SubName>Engineering</SubName>
          </PhotoWithCaption>
        </Photos>
      </Team>
      <img alt="tapes" src={tapes} />
      <Support>
        <h1>Built for the Metabolism hackathon</h1>
        <h2>with support from</h2>
        <Supporters>
          <a href="https://zora.co/">
            <Supporter alt="zora" src={zora} />
          </a>
          <a href="https://polygon.technology/">
            <Supporter alt="polygon" src={polygon} />
          </a>
          <a href="https://spinamp.xyz/">
            <Supporter alt="spinamp" src={spinamp} />
          </a>
        </Supporters>
      </Support>
    </StyledHomeContainer>
  );
}

const Rex = styled.h1`
  font-size: 8em;
  margin-bottom: 0px;
`;

const Supporter = styled.img`
  margin-bottom: 5em;
  max-width: 300px;
  max-height: 95px;
  width: auto;
  height: auto;
`;

const Supporters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2em;
  align-items: center;
  flex-direction: row;
  margin-bottom: 5em;
`;

const Support = styled.div`
  margin-bottom: 5em;
`;

const Name = styled.div`
  font-size: 2em;
`;

const SubName = styled.div`
  font-size: 1em;
  color: rgb(50, 50, 50);
`;

const Photo = styled.img`
  border-radius: 45%;
  width: 10vw;
`;

const Photos = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4em;
`;
const PhotoWithCaption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Team = styled.div`
  margin-bottom: 5em;
`;

const StartButton = styled.div`
  font-size: 5em;
  margin: 0.5em;
  cursor: pointer;
`;

const StyledHomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: permanent-marker, sans-serif;
  font-weight: 400;
  font-style: normal;
`;

export default Home;
