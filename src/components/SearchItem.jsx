import { DownOutlined } from "@ant-design/icons";

export const SearchItem = ({ name }) => {
  return (
    <div className="p-4 gap-6 relative border border-gray-800 flex justify-between items-center">
      <span>{name}</span>
      <DownOutlined />
    </div>
  );
};
