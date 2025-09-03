import { stats } from "../constants/index";

const Stats = () => (
  <section className={`flex md:justify-center justify-start bg-white  py-6 items-center   md:items-center mt-2 md:flex-row flex-col   px-2 w-full flex-wrap  sm:mb-6 `}>
    {stats.map((stat) => (
      <div key={stat.id} className={`flex-1 flex md:justify-center  items-center flex-col  `} >
        <h4 className="font-header font-bold xs:text-[20px] md:text-[30px] text-[30.89px]  leading-[43.16px] text-gray-900">
          {stat.value}
        </h4>
        <p className="font-header  text-[15.45px] font-semibold md:text-[16px] leading-[21.58px] text-orange-800 uppercase ml-3">
          {stat.title}
        </p>
      </div>
    ))}
  </section>
);

export default Stats;