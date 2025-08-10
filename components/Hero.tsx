import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import Stats from "./Stats";

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-header">
      {/* Text Section */}
      <div className="pt-20 px-6 mb-2 text-center mx-auto">
        <h1
          className="text-2xl md:text-3xl md:w-[700.859px] w-full md:h-[
132px] text-center font-bold mx-auto mb-6 leading-tight"
        >
          Let&apos;s Help You Order Your Food Items Seamlessly
        </h1>
        <p className="text-[14px] md:w-[800.688px] w-full md:h-[27px] text-gray-600  text-center mx-auto md:mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet delectus
          fugit perferendis. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Voluptas maxime cumque, sint minima id quibusdam expedita
          impedit delectus culpa aut, nisi maiores itaque rem obcaecati
          voluptatem perspiciatis voluptate rerum tenetur?
        </p>

        <Button
          asChild
          className="bg-green-700 rounded-full shadow-sm  hover:bg-green-600 text-white text-[14px] px-8 py-[1.7rem] md:w-[300.102px] h-[
38.3906px] md:mt-20 my-6 w-full"
        >
          <Link href="/employee-login">Get Started</Link>
        </Button>
      </div>

      {/* Image Grid Section */}
      <div className="container px-4 mt-24 mx-auto relative">
        <div className="grid grid-cols-3 gap-4 h-[500px] md:h-[600px]">
          {/* Left Image (Smallest) */}
          <div className="relative h-full">
            <div className="absolute -top-2 -left-8 md:block hidden w-[300px] h-[300px] md:w-[250px] md:h-[300px] z-10">
              <Image
                src="/hero-7.jpg"
                alt="Food image 1"
                fill
                className="object-cover rounded-lg shadow-lg "
                quality={90}
              />
            </div>
          </div>

          {/* Center Image (Largest) */}
          <div className="md:relative w-full h-full">
            <div className="md:absolute md:top-12 md:left-[46%] md:transform md:-translate-x-1/2 w-[100%] h-[400px] md:w-[700px] md:h-[400px] z-20">
              <Image
                src="/hero-1.jpg"
                alt="Food image 2"
                fill
                className="object-cover rounded-lg shadow-xl "
                quality={90}
                priority
              />
            </div>
          </div>

          {/* Right Image (Medium) */}
          <div className="relative h-full">
            <div className="absolute -top-16 md:block hidden -right-8 w-[220px] h-[320px] md:w-[280px] md:h-[380px] z-10">
              <Image
                src="/hero-9.jpg"
                alt="Food image 3"
                fill
                className="object-cover rounded-lg shadow-lg "
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
