import Image from "next/image";
import React from "react";

const PodcastCard = ({
  imgURL,
  title,
  description,
  podcastId,
}: {
  imgURL: string;
  title: string;
  description: string;
  podcastId: number;
}) => {
  return (
    <div className="cursor-pointer">
      <figure className="flex flex-col gap-2">
        <Image
        src={imgURL}
        alt={title}
        width={174}
        height={174}
        className="rounded-lg"
        />
      </figure>
    </div>
  );
};

export default PodcastCard;
