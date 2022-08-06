import React, { useEffect, useRef, useState } from "react";
import { usePaginatedTracksQuery } from "@spinamp/spinamp-hooks";
import { useNavigate, useParams } from "react-router-dom";
import Track from "../components/lib/Track";
import styled from "styled-components";
import { Box } from "@mui/material";
import useDraggableScroll from "use-draggable-scroll";

function PlatformTracks() {
    const params = useParams();
    const { tracks, isLoading, isError } = usePaginatedTracksQuery(50, {
        filter: {
            platformId: { in: [params?.platformId ?? ""] }
        }
    });
    const navigate = useNavigate();
    const ref =
        useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const { onMouseDown } = useDraggableScroll(ref, { direction: "vertical" });

    const [selectedIndex, setSelectedIndex] = useState(0);
    let [offsetTop, setOffsetTop] = useState(0);

    const handleScroll = (e: any) => {
        let midPoint = e.target.offsetHeight / 2;
        setSelectedIndex(Math.floor((midPoint + e.target.scrollTop) / 50) - 1);
    };

    useEffect(() => {
        ref.current?.addEventListener("scroll", handleScroll, {
            passive: true
        });

        setOffsetTop(ref.current?.getBoundingClientRect().top);

        return () => {
            ref.current?.removeEventListener("scroll", handleScroll);
        };
    }, [isLoading]);

    if (isLoading) {
        return <p>Loading</p>;
    }

    if (isError) {
        return (
            <div>
                <p>Ups! Something went wrong</p>
            </div>
        );
    }
    offsetTop = offsetTop || 0;

    return (
        <div>
            <TrackListContainer
                ref={ref}
                onMouseDown={onMouseDown}
                style={{ height: `calc(100vh - ${offsetTop}px)` }}
            >
                {tracks.map((track, index) => (
                    <Track
                        expanded={selectedIndex === index}
                        onClick={() => navigate(`/trackDetails/${track.id}`)}
                        key={track.id}
                        track={track}
                    />
                ))}
                <Box sx={{ height: "150px" }} />
            </TrackListContainer>
        </div>
    );
}
const TrackListContainer = styled.div`
    overflow-y: scroll;
    overflow-x: hidden;
    background: black;
    height: 300px;
`;

export default PlatformTracks;
