
import { Wallet, Truck, CalendarCheck, ShieldCheck, PiggyBank, Zap } from 'lucide-react';
import Link from 'next/link';

const BenefitsSection = () => {
  return (
    <div className="bg-[#161d14]  rounded-xl text-white py-16 relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute right-10 top-1/3 w-[300px] h-[300px] bg-[#507f1b] blur-[120px] rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute left-20 top-1/3 w-[300px] h-[300px] bg-green-600 blur-[120px] rounded-full opacity-30 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 relative z-10">
        {/* Left Text */}
        <div>
          <h2 className="text-xl md:text-3xl  font-bold md:leading-[40px] leading-[30px] mb-6">
            Smart shopping for 
            government workers 
            made simple
          </h2>
          <p className="text-[15px] mb-8">
            Get the essentials you need now and pay seamlessly through automatic salary deductions.
            No interest, no hidden fees.
          </p>
          <Link href="/employee-login" className="bg-white hover:bg-slate-100 text-black px-6 py-3 rounded-full font-semibold shadow-lg transition">
            Start Shopping Today
          </Link>
        </div>

        {/* Benefit Boxes */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <Wallet className="text-green-800" />
            </div>
            <span className="text-white font-semibold">
              Salary-linked purchases with automatic deductions
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <Truck className="text-orange-800" />
            </div>
            <span className="text-white font-semibold">
              Reliable doorstep delivery of quality foodstuffs
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <CalendarCheck className="text-green-800" />
            </div>
            <span className="text-white font-semibold">
              Order anytime - pay automatically on payday
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <ShieldCheck className="text-orange-800" />
            </div>
            <span className="text-white font-semibold">
              Government-approved secure transactions
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <PiggyBank className="text-green-800" />
            </div>
            <span className="text-white font-semibold">
              Budget-friendly alternative to loans
            </span>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="bg-white p-3 rounded-md">
              <Zap className="text-orange-800" />
            </div>
            <span className="text-white font-semibold">
              Quick approval process - no credit checks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BenefitsSection;