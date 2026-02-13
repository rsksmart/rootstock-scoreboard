import { ITeam } from "@/interface/ITeam";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../common/Button";
import CopyContent from "./CopyContent";
import { getImageFromURI } from "@/utils/getImageFromUri";
import { DUMMY_TOKEN_IMAGE } from "@/constants";

interface ITeamComp extends ITeam {
  i: number;
  team: ITeam;
  setDialog: Dispatch<SetStateAction<boolean>>;
  setTeam: Dispatch<SetStateAction<ITeam | undefined>>;
  isVotingActive: boolean;
}

export const TeamRowComp: React.FC<ITeamComp> = ({
  i,
  uri,
  memeTokenAddress,
  leaderAddress,
  teamName,
  symbol,
  score,
  team,
  setDialog,
  setTeam,
  isVotingActive
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!uri) {
        setImageUrl(null);
        return;
      }
      try {
        const image = await getImageFromURI(uri);

        setImageUrl(image || null);
      } catch (error) {
        console.error("Error fetching POAP image:", error);
        setImageUrl(null);
      }
    };
    fetchImage();
  }, [uri]);

  return (
    <>
      <tr
        key={i}
        className="text-center h-14 pt-3 border-spacing-3 border-b border-zinc-800 hover:bg-zinc-900"
      >
        <td>
          <div className="flex justify-center">
            <img
              src={`${imageUrl || DUMMY_TOKEN_IMAGE}`}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          </div>
        </td>
        <td>{teamName}</td>
        <td>{symbol}</td>
        <td>
          <CopyContent address={leaderAddress} />
        </td>
        <td>
          <CopyContent address={memeTokenAddress} />
        </td>
        <td>
          <span
            className={`${
              i === 0 && score ? "text-custom-lime font-semibold" : ""
            }`}
          >
            {score}
          </span>
        </td>
        <td>
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setDialog(true);
                setTeam(team);
              }}
              disabled={!isVotingActive}
              className={!isVotingActive ? "opacity-50 cursor-not-allowed grayscale" : ""}
              width={80}
            >
              {isVotingActive ? "Vote" : "Closed"}
            </Button>
          </div>
        </td>
      </tr>
    </>
  );
};
