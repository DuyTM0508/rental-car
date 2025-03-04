import React from "react";
import { Tag } from "antd";
import Image from "next/image";
import Link from "next/link";
import { StarFilledIcon } from "@/icons";

export const CarLikeCard = ({ info }) => {
  return (
    <div className=" flex flex-col border rounded-xl border-solid border-neutral-200 p-4 ">
      <div className="flex flex-row  ">
        <div className="flex flex-col relative aspect-video cursor-pointer">
          <Link href={`/cars/${info?._id}`}>
            <Image
              src={info?.thumb}
              alt="car"
              height={150}
              width={150}
              className="rounded-lg object-cover w-1/3"
            />
          </Link>
        </div>

        <div className="flex flex-col w-3/4 ml-5 justify-around ">
          <div>
            <Tag className="rounded-full ml-1  mt-0 m-0 " color="green">
              {info?.transmissions}
            </Tag>
            <h5 className="text-xl line-clamp-1 font-bold ml-2 m-0 ">
              {info?.model.name} {info?.yearManufacture}
            </h5>
          </div>
          <div className="flex  justify-between items-center">
            <div className="flex items-center gap-1">
              <StarFilledIcon className="text-yellow-300 " />
              <span className="text-neutral-500 text-base">
                {info?.totalRatings}
              </span>
            </div>
            <div className="flex gap-4 text-green-500 font-black">
              {info?.cost}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
