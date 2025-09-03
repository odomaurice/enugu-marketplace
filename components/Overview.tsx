import Image from 'next/image';

const LeadershipProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Strategic Leadership</h1>
          <div className="w-24 h-1 bg-green-300 mx-auto"></div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
          
            <div className="md:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-green-400 to-blue-500">
              <div className="text-center">
                <div className="w-60 h-60 mx-auto rounded-md overflow-hidden relative mb-4">
                  <Image 
                    src="/Engr.jpeg" 
                    alt="Michael Ogbuekwe" 
                    fill
                    // style={{objectFit: 'cover'}}
                    className=" object-cover"
                  />
                </div>
                <p className="text-sm text-gray-100">Leadership Portrait</p>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-8 md:w-3/5">
              <div className="flex flex-col h-full justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Michael Ogbuekwe
                </h2>
                
                <div className="mb-6">
                  <p className="text-lg text-gray-700 font-medium">
                    Special Adviser to the Governor of Enugu State
                  </p>
                  <p className="text-lg text-gray-700 font-medium">
                    MD/CEO, Enugu State Marketing Company
                  </p>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-8 border-l-4 border-green-500 pl-4 py-2">
                  Leading the strategic development of innovative solutions that enhance worker welfare 
                  while driving sustainable economic growth in Enugu State's agricultural sector.
                </p>
                
                <div className="flex space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Enugu, Nigeria</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    <span>Government</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipProfile;