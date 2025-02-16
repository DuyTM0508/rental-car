import { LocationFilledIcon, SeatIcon } from "@/icons";
import { Button, Divider, Tag, Rate } from "antd";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/number.utils";
export const CarCard = ({ dataCar }) => {
  return (
    <Link href={`/cars/${dataCar?._id}`}>
      <div className="border rounded-md border-solid border-neutral-300 p-4 cursor-pointer shadow-md">
        <div className="relative aspect-video">
          <Image
            src={dataCar?.thumb}
            alt="car"
            width={300}
            height={220}
            className="rounded-lg object-cover"
          />
        </div>

        <div className="mt-4">
          <h5 className="text-xl line-clamp-1 mt-2 font-bold mb-2">
            {dataCar?.model?.name} {dataCar?.yearManufacture}
          </h5>
          <div className="flex items-baseline">
            <Rate
              allowHalf
              disabled
              defaultValue={dataCar?.totalRatings}
              className="text-base"
            />
            <span className="text-gray-400 ml-2 text-sm">
              ({dataCar?.totalRatings} sao)
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Tag className="rounded-full text-xs" color="green">
              {dataCar?.transmissions}
            </Tag>
            <div className="text-green-500 font-black text-xs">
              {formatCurrency(dataCar?.cost)}/ngày
            </div>
          </div>
          <Divider className="mb-2" />
          <div className="flex justify-center items-center">
            <Button
              className="p-4 flex items-center justify-center font-medium text-base"
              type="primary"
            >
              Chọn thuê
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
