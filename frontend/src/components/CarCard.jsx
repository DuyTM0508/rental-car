import { LocationFilledIcon, SeatIcon } from "@/icons"
import { Button, Tag, Rate } from "antd"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/utils/number.utils"

export const CarCard = ({ dataCar }) => {
  return (
    <Link href={`/cars/${dataCar?._id}`} className="block">
      <div className="bg-white border rounded-xl border-solid border-neutral-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={dataCar?.thumb || "/placeholder.svg"}
            alt={`${dataCar?.model?.name || "Car"}`}
            width={400}
            height={250}
            className="rounded-t-xl object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Tag className="rounded-full text-xs font-medium border-none bg-green-100 text-green-800 px-3 py-1">
              {dataCar?.transmissions}
            </Tag>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5">
          {/* Car Title */}
          <h5 className="text-xl line-clamp-1 font-bold text-gray-900 mb-2">
            {dataCar?.model?.name} {dataCar?.yearManufacture}
          </h5>

          {/* Rating */}
          <div className="flex items-center">
            <Rate allowHalf disabled defaultValue={dataCar?.totalRatings} className="text-sm text-amber-400" />
            <span className="text-gray-500 ml-2 text-sm">({dataCar?.totalRatings} sao)</span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-3 mt-3 text-gray-600">
            <div className="flex items-center gap-1 text-sm">
              <SeatIcon className="text-green-600" />
              <span>4 chỗ</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <LocationFilledIcon className="text-green-600" />
              <span>Hà Nội</span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 bg-gray-50 -mx-5 px-5 py-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Giá thuê</span>
                <div className="text-green-600 font-bold text-lg">
                  {formatCurrency(dataCar?.cost)}
                  <span className="text-gray-500 text-xs font-normal ml-1">/ngày</span>
                </div>
              </div>

              <Button
                className="h-10 px-5 flex items-center justify-center font-medium rounded-full border-none shadow-sm hover:shadow-md transition-all duration-300"
                type="primary"
              >
                Thuê
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

