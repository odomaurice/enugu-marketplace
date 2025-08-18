import { stats } from "../constants/index";

const Stats = () => (
  <section className={`flex md:justify-center justify-start  py-2 items-center   md:items-center mt-2 md:flex-row flex-col   px-2 w-full flex-wrap  sm:mb-6 `}>
    {stats.map((stat) => (
      <div key={stat.id} className={`flex-1 flex md:justify-center  items-center md:flex-row  `} >
        <h4 className="font-header font-bold xs:text-[20px] sm:text-4xl text-[30.89px]  leading-[43.16px] text-gray-900">
          {stat.value}
        </h4>
        <p className="font-header xs:text-[20.45px] text-[15.45px] font-semibold xs:leading-[26.58px] leading-[21.58px] text-orange-800 uppercase ml-3">
          {stat.title}
        </p>
      </div>
    ))}
  </section>
);

export default Stats;