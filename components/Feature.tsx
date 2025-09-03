import { FaRegHeart, FaShieldAlt } from 'react-icons/fa';
import {  FaArrowTrendUp} from 'react-icons/fa6';
import { FiShield } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
const features = [
  {
    icon: <FaRegHeart className="text-5xl text-green-800" />,
    title: 'Enhanced Food Security',
    description: 'Direct access to essential food items without upfront payments',
  },
  {
    icon: <FaArrowTrendUp className="text-5xl text-green-800" />,
    title: 'Local Economic Growth',
    description: 'Stimulates agricultural sector and local businesses',
  },
  {
    icon: <FiShield className="text-5xl text-green-800" />,
    title: 'Interest-Fee Repayments',
    description: 'Convenient salary deductions with no interest charges',
  },
  {
    icon: <LuUsers className="text-4xl text-green-800" />,
    title: 'Worker Welfare',
    description: 'Improves civil servant morale and productivity',
  },
];

const Features = () => {
  return (
    <section className="py-8 font-header bg-green-50  px-4 mt-20 mb-6  md:px-16">
      <h2 className="text-xl md:text-3xl font-bold text-center pt-10 mt-4 mb-16 text-black">
        Transformative Benefits for Enugu State
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col w-[300px] h-full  bg-green-50 p-3  rounded-md">
            <div className='flex flex-col space-y-4 bg-white p-6 h-full rounded-lg shadow-md'>
              <div className="shrink-0 flex justify-start">{feature.icon}</div>
              <h3 className="text-[16px] font-bold font-header text-gray-900 text-start">
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium text-sm mt-auto">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;