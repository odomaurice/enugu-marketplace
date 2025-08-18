import { FaMobileAlt, FaMoneyBillWave, FaPiggyBank, FaShieldAlt, FaShoppingBasket, FaTruck } from 'react-icons/fa';


const features = [
  {
    icon: <FaShoppingBasket className="text-4xl text-blue-800" />,
    title: 'Pre-Salary Access to Essentials',
    description: 'Order foodstuffs and daily necessities before payday—no upfront payment required.',
  },
  {
    icon: <FaMoneyBillWave className="text-4xl text-green-800" />,
    title: 'Salary-Linked Deductions',
    description: 'Seamless repayment through automatic salary deductions. No hidden fees or interest.',
  },
  {
    icon: <FaMobileAlt className="text-4xl text-purple-800" />,
    title: 'Easy Mobile Ordering',
    description: 'Browse, order, and track deliveries from your phone—anytime, anywhere.',
  },
  {
    icon: <FaShieldAlt className="text-4xl text-orange-800" />,
    title: 'Government-Approved Security',
    description: 'Secure transactions with encrypted payroll integration. Your data is always protected.',
  },
  {
    icon: <FaTruck className="text-4xl text-red-800" />,
    title: 'Reliable Delivery',
    description: 'Timely doorstep delivery of fresh, quality foodstuffs to your home or office.',
  },
  {
    icon: <FaPiggyBank className="text-4xl text-yellow-800" />,
    title: 'Budget-Friendly',
    description: 'Avoid last-minute loans or high-interest purchases. Spend within your means.',
  },
];

const Features = () => {
  return (
    <section className="py-8 font-header px-4 my-20  md:px-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center   mt-4 mb-16 text-black">
        What We Offer...
      </h2>
      <div className="grid grid-cols-1   md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4 bg-green-50 p-4 rounded-md">
            <div className=''>
               <div className="shrink-0">{feature.icon}</div>
            </div>
           
            <div>
              <h3 className="text-[18px] font-bold font-header text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-700  leading-[25px] font-medium text-[14px]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features