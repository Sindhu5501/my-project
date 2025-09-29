interface TestimonialCardProps {
  name: string;
  role: string;
  initials: string;
  avatar?: string;
  testimonal: string;
  rating: number;
  bgColor: string;
  textColor: string;
}

const TestimonialCard = ({
  name,
  role,
  initials,
  avatar,
  testimonal,
  rating,
  bgColor,
  textColor
}: TestimonialCardProps) => {
  const stars = Array(5).fill(0).map((_, index) => {
    if (index < Math.floor(rating)) {
      return <i key={index} className="ri-star-fill"></i>;
    } else if (index === Math.floor(rating) && rating % 1 !== 0) {
      return <i key={index} className="ri-star-half-fill"></i>;
    } else {
      return <i key={index} className="ri-star-line"></i>;
    }
  });

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} text-sm font-medium`}>
            {initials}
          </div>
        )}
        <div className="ml-3">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-gray-600">{testimonal}</p>
      <div className="mt-4 flex text-yellow-400">
        {stars}
      </div>
    </div>
  );
};

export default TestimonialCard;
