import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  text: string;
}

interface RoleCardProps {
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  features: FeatureItem[];
  ctaText: string;
  ctaHref: string;
  ctaBg: string;
  ctaHoverBg: string;
}

const RoleCard = ({
  title,
  icon,
  iconBg,
  iconColor,
  features,
  ctaText,
  ctaHref,
  ctaBg,
  ctaHoverBg
}: RoleCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`${iconBg} rounded-full p-3`}>
            <i className={`${icon} text-2xl ${iconColor}`}></i>
          </div>
          <h3 className="ml-4 text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <i className="ri-check-line text-green-500 mt-1 mr-2"></i>
              <span className="text-gray-600">{feature.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button className={`bg-${ctaBg} hover:bg-${ctaHoverBg}`} asChild>
            <Link href={ctaHref}>
              {ctaText}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
