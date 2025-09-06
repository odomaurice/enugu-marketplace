"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BenefitsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          Transformative Benefits for All Stakeholders
        </h1>
        <p className="text-xl text-muted-foreground">
          Multi-dimensional impact across worker welfare, economic development,
          and state growth
        </p>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <p className="font-semibold">Food Security</p>
            <p className="text-sm text-muted-foreground">
              Coverage for all participating workers
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
            <p className="font-semibold">Interest Rate</p>
            <p className="text-sm text-muted-foreground">
              No interest charges on loans
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">48hrs</div>
            <p className="font-semibold">Processing Time</p>
            <p className="text-sm text-muted-foreground">
              Fast loan approval process
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600 mb-2">80%</div>
            <p className="font-semibold">Local Content</p>
            <p className="text-sm text-muted-foreground">
              Focus on locally produced items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Worker Welfare Section */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">
              Worker Welfare Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  Immediate access to essential food items without upfront
                  payments
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Reduced financial stress related to food security</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Improved employee morale and job satisfaction</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  Reduced absenteeism due to food-related health issues
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Enhanced focus and productivity at work</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Stronger employee loyalty and retention</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Economic Development Section */}
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800">
              Economic Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Direct injection of capital into Enugu State's local economy
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Support for local farmers and food businesses</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Stimulation of agricultural sector through increased demand
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Creation of employment opportunities in the food value chain
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Consumer spending channeled to local producers across
                  sustainable economic growth
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>
                  Job creation throughout the agricultural value chain
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* State Development Section */}
        <Card className="bg-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-800">
              State Development Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>
                  Alignment with state agricultural development strategy
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>
                  Demonstration of government commitment to worker welfare
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Contribution to Internally Generated Revenue (IGR)</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Model for other states to replicate</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>
                  Sustainable transformation beyond immediate benefits
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Long-term Strategic Impact Section */}
        <Card className="bg-amber-50">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-800">
              Long-term Strategic Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-amber-700 mb-2">
                  Food System Strengthening
                </h3>
                <p className="text-muted-foreground">
                  Combined demand from state workers incentivizes local farmers
                  to increase production and improve quality standards, creating
                  a more resilient local food system.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-amber-700 mb-2">
                  Credit Culture Development
                </h3>
                <p className="text-muted-foreground">
                  Workers develop responsible credit habits and financial
                  discipline, contributing to broader financial inclusion
                  objectives and building a culture of financial responsibility.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-amber-700 mb-2">
                  Economic Multiplier Effect
                </h3>
                <p className="text-muted-foreground">
                  Money spent through the program circulates within the local
                  economy, creating secondary economic benefits and supporting
                  broader community development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
