import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import brian from "../img/brian.jpg";
import gal from "../img/gal.jpg";
import christina from "../img/christina.jpg";
import zora from "../img/zora.png";
import spinamp from "../img/spinamp.png";
import polygon from "../img/polygon.png";
import dino from "../img/dino.png";
import dig from "../img/dig.jpg";
import tapes from "../img/tapes.jpg";
import ethglobal from "../img/ethglobal.png";
import { phone, tablet } from "../constants/mediaSize";

function Home() {
  const navigate = useNavigate();
  return (
    <StyledHomeContainer>
      <Rex>
        <Dino src={dino} />
        Rex <DinoReverse src={dino} />
      </Rex>

      <ProjectInfo>
        A whole new way to find music you love on the blockchain.
      </ProjectInfo>
      <ProjectInfo>
        Get new music recommendations based on what owners and curators are
        collecting.
      </ProjectInfo>
      <StartButton onClick={() => navigate("/trackList")}>
        start digging
      </StartButton>
      <BigImg alt="dig" src={dig} />
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
      <BigImg alt="tapes" src={tapes} />
      <Support>
        <SupportH1>Built for the Metabolism hackathon</SupportH1>
        <Supporters>
          <a href="https://ethglobal.com/">
            <Supporter alt="ethglobal" src={ethglobal} />
          </a>
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

const Rex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8em;
  margin-bottom: 20px;
  @media (max-width: ${tablet}) {
    font-size: 4em;
  }
  @media (max-width: ${phone}) {
    font-size: 2.5em;
  }
`;

const Dino = styled.img`
  height: 1em;
  margin-right: 0.5em;
`;

const DinoReverse = styled.img`
  height: 1em;
  transform: scaleX(-1);
  margin-left: 0.5em;
`;

const ProjectInfo = styled.div`
  text-align: center;
  font-size: 2em;

  @media (max-width: ${tablet}) {
    font-size: 1em;
  }
  @media (max-width: ${phone}) {
    font-size: 0.8em;
    width: 80%;
  }
`;

const BigImg = styled.img`
  max-width: 100vw;
`;

const Supporter = styled.img`
  margin-bottom: 5em;
  max-width: 300px;
  max-height: 95px;
  width: auto;
  height: auto;
`;

const SupportH1 = styled.h1`
  @media (max-width: ${tablet}) {
    font-size: 1em;
  }
  @media (max-width: ${phone}) {
    font-size: 1.5em;
  }
`;

const Supporters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2em;
  align-items: center;
  flex-direction: row;
  margin-bottom: 5em;
  @media (max-width: ${tablet}) {
    font-size: 1em;
  }
  @media (max-width: ${phone}) {
    flex-direction: column;
    gap: 0;
    margin-bottom: 0;
  }
`;

const Support = styled.div`
  margin-bottom: 5em;
`;

const Name = styled.div`
  font-size: 2em;
  @media (max-width: ${tablet}) {
    font-size: 1em;
  }
  @media (max-width: ${phone}) {
    font-size: 1em;
  }
`;

const SubName = styled.div`
  font-size: 1em;
  color: rgb(50, 50, 50);
  @media (max-width: ${tablet}) {
    font-size: 1em;
  }
  @media (max-width: ${phone}) {
    font-size: 0.8em;
  }
`;

const Photo = styled.img`
  border-radius: 45%;
  width: 10vw;

  @media (max-width: ${tablet}) {
    width: 20vw;
  }
`;

const Photos = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4em;
  @media (max-width: ${tablet}) {
    gap: 2em;
  }
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

export default Home;
