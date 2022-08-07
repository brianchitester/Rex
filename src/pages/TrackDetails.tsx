import React, { useState } from "react";
import { useTrackNftsOwnersQuery, useTrackQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import useWindowDimensions from "../hooks/useWindowDimensions";
import AllNfts from "../components/Recs";
import { useNFT as useZoraNFT } from "@zoralabs/nft-hooks";

function TrackDetails() {
    const [showMoreOwners, setShowMoreOwners] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    // this might be dumb, causing a lot of rerenders
    const { width, height } = useWindowDimensions();

    const trackId = `${params?.chain ?? ""}/${params?.token ?? ""}${
        params.id ? `/${params.id}` : ""
    }`;
    const { track, isLoading, isError } = useTrackQuery(trackId);
    const {
        owners,
        isLoading: isOwnerLoading,
        isError: isOwnerError
    } = useTrackNftsOwnersQuery(trackId ?? "");

    const { data: zoraData, error: zoraError } = useZoraNFT(
        params?.token,
        params.id
    );

    let zoraPrice = 0 as number | undefined;
    let zoraPriceSymbol = "" as string | undefined;
    if (zoraData?.markets?.length) {
        zoraPrice = zoraData.markets[0].amount?.amount.value;
        zoraPriceSymbol = zoraData.markets[0].amount?.symbol;
    }

    if (isLoading || isOwnerLoading) {
        return <p>Loading!</p>;
    }

    if (isError || isOwnerError) {
        return (
            <div>
                <p>Ups! Something went wrong</p>
            </div>
        );
    }

    const filteredOwners = owners.filter((owner) => !!owner);

    const imageSize = height < width ? height * 0.6 : width * 0.6;

    return (
        <StyledTrackDetailsContainer>
            <StyledTrackCover
                alt={track?.title}
                width={imageSize}
                height={imageSize}
                src={track?.lossyArtworkUrl}
            />
            <TrackTitle>{track?.title} </TrackTitle>
            <TrackArtist
                onClick={() => navigate(`/artist/${track?.artist.id}`)}
            >
                {track?.artist.name}
            </TrackArtist>
            <TrackDescription width={imageSize}>
                {track?.description?.replace(/<[^>]*>?/gm, "")}
            </TrackDescription>

            {track?.websiteUrl && track?.platformId && (
                <a href={track?.websiteUrl}>view on {track.platformId}</a>
            )}

            <TrackTitle>
                {zoraPrice ? (
                    <>
                        <TrackPrice>Zora Market Price: </TrackPrice>
                        <TrackPrice>{zoraPrice}</TrackPrice>{" "}
                        <TrackPriceSymbol>{zoraPriceSymbol}</TrackPriceSymbol>
                    </>
                ) : null}
            </TrackTitle>

            {filteredOwners.length > 0 ? (
                <Owners>
                    <h3>Owners</h3>
                    {!!showMoreOwners && (
                        <OwnerLink onClick={() => setShowMoreOwners(false)}>
                            ... Show less
                        </OwnerLink>
                    )}
                    {showMoreOwners ? (
                        filteredOwners.map((owner) => (
                            <OwnerLink
                                key={owner}
                                onClick={() => navigate(`/owner/${owner}`)}
                            >
                                {owner}
                            </OwnerLink>
                        ))
                    ) : (
                        <>
                            {filteredOwners.slice(0, 5).map((owner) => (
                                <OwnerLink
                                    key={owner}
                                    onClick={() => navigate(`/owner/${owner}`)}
                                >
                                    {owner}
                                </OwnerLink>
                            ))}
                            {filteredOwners.length > 5 && (
                                <OwnerLink
                                    onClick={() => setShowMoreOwners(true)}
                                >
                                    ... Show {filteredOwners.length - 4} more
                                </OwnerLink>
                            )}
                        </>
                    )}
                </Owners>
            ) : track?.platformId === "nina" ? (
                <Owners>{track.platformId} support coming soon!</Owners>
            ) : (
                <Owners>
                    No owners,{" "}
                    <BuyButton href={track?.websiteUrl}>
                        be the first!
                    </BuyButton>
                </Owners>
            )}
            {filteredOwners.length > 0 && <AllNfts owners={filteredOwners} />}
        </StyledTrackDetailsContainer>
    );
}

const StyledTrackDetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 200px;
    background-color: cornsilk;
`;

const StyledTrackCover = styled.img`
    padding: 20px;
`;

const BuyButton = styled.a`
    cursor: pointer;
`;

const TrackTitle = styled.h1`
    margin: 0px;
    font-family: permanent-marker, sans-serif;
    font-weight: 400;
    font-style: normal;
`;

const TrackArtist = styled.h2`
    margin: 0px;
    font-family: permanent-marker, sans-serif;
    font-weight: 400;
    font-style: normal;
    cursor: pointer;
`;

const TrackDescription = styled.div<{ width: number }>`
    margin: 1em;
    width: ${(props) => `${props.width}px;`};
    text-align: center;
`;

const Owners = styled.div`
    margin-top: 1em;
`;

const OwnerLink = styled.div`
    cursor: pointer;
    text-overflow: ellipsis;
    margin: 0.5em 0em;
`;

const TrackPrice = styled.span`
    margin-top: 1em;
    font-weight: 200;
    font-size: 0.5em;
    font-family: permanent-marker, sans-serif;
`;

const TrackPriceSymbol = styled.span`
    margin-top: 1em;
    font-weight: 200;
    font-size: 0.5em;
    font-family: permanent-marker, sans-serif;
`;

export default TrackDetails;
