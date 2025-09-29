import { Link } from "wouter";

interface CategoryCardProps {
  name: string;
  count: number;
  icon: string;
  href?: string;
}

const CategoryCard = ({ name, count, icon, href = "#" }: CategoryCardProps) => {
  return (
    <div 
      onClick={() => window.location.href = href}
      className="flex flex-col items-center bg-gray-50 rounded-xl p-6 transition-all hover:bg-primary-50 hover:shadow-md cursor-pointer"
    >
      <div className="bg-primary-100 rounded-full p-3 mb-4">
        <i className={`${icon} text-2xl text-primary-600`}></i>
      </div>
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">{count} events</p>
    </div>
  );
};

export default CategoryCard;
