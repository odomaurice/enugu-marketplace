"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImplementationRoadmap() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Implementation Roadmap & Success Framework
      </h1>
      <p className="text-lg text-muted-foreground mb-8 text-center">
        Phased approach ensuring sustainable rollout and continuous optimization
      </p>

      <Tabs defaultValue="implementation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="implementation">
            Implement 
          </TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="implementation">
          {/* Implementation Phases content remains the same as before */}
          <div className="space-y-6">
            {/* Phase 1 */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl">
                  Phase 1: Pilot Program
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  3-6 months | Limited ministries/departments
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Test operational model with select state ministries</li>
                    <li>
                      Validate GIFM's integration and payroll deduction
                      processes
                    </li>
                    <li>
                      Establish initial supplier network through Marketing
                      Company
                    </li>
                    <li>Gather feedback and identify operational challenges</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Expected Deliverables
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Pilot program launch with 500-1000 workers</li>
                    <li>Basic food item categories available</li>
                    <li>Initial performance metrics and feedback reports</li>
                    <li>Technical integration documentation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-2xl">
                  Phase 2: Gradual Expansion
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  6-12 months | Additional ministries and departments
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Scale operations based on pilot learnings</li>
                    <li>Expand food product categories and supplier base</li>
                    <li>
                      Refine credit assessment and risk management processes
                    </li>
                    <li>
                      Implement enhanced monitoring and evaluation systems
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Expected Deliverables
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Expansion to 5,000-10,000 workers</li>
                    <li>Comprehensive food catalog with local produce</li>
                    <li>Advanced reporting and analytics dashboard</li>
                    <li>Worker financial literacy program launch</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-2xl">
                  Phase 3: Full-Scale Implementation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Complete rollout to all eligible state workers</li>
                    <li>Optimize supply chain and distribution networks</li>
                    <li>Achieve target economic impact on local agriculture</li>
                    <li>Establish long-term sustainability framework</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Expected Deliverables
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Full scheme availability to all state workers</li>
                    <li>Mature supplier ecosystem and distribution network</li>
                    <li>Comprehensive impact assessment report</li>
                    <li>Framework for other states to replicate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="success">
          {/* Success Factors content remains the same as before */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-2xl">
                  Critical Success Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">
                        Stakeholder Engagement
                      </h3>
                      <p className="text-muted-foreground">
                        Active participation from all government entities and
                        clear communication with workers
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">
                        Technical Infrastructure
                      </h3>
                      <p className="text-muted-foreground">
                        Robust GIFMIS integration and automated compliance
                        monitoring systems
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">
                        Performance Monitoring
                      </h3>
                      <p className="text-muted-foreground">
                        Continuous tracking of KPIs and regular scheme
                        optimization
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">
                        Legal Compliance
                      </h3>
                      <p className="text-muted-foreground">
                        Strict adherence to Nigerian Labour Act and transparent
                        consent processes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-2xl">
                  Critical Success Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      Executive Support
                    </h3>
                    <p className="text-muted-foreground">
                      Strong commitment from Governor's Office and all relevant
                      ministries
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      Worker Buy-in
                    </h3>
                    <p className="text-muted-foreground">
                      Comprehensive communication and education about scheme
                      benefits
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      Supplier Network
                    </h3>
                    <p className="text-muted-foreground">
                      Reliable local producers and efficient distribution
                      channels
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          {/* Monitoring & KPIs content remains the same as before */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-indigo-50">
                <CardTitle className="text-2xl">
                  Key Performance Indicators (KPIs)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive metrics for continuous monitoring and
                  optimization
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left font-semibold">
                          Performance Metric
                        </th>
                        <th className="border p-3 text-left font-semibold">
                          Target
                        </th>
                        <th className="border p-3 text-left font-semibold">
                          Monitoring Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          Beneficiary Uptake
                        </td>
                        <td className="border p-3">
                          ≥ 70% of eligible workers
                        </td>
                        <td className="border p-3">Monthly</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          Repayment Rate
                        </td>
                        <td className="border p-3">≥ 95%</td>
                        <td className="border p-3">Monthly</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          Local Content Share
                        </td>
                        <td className="border p-3">≥ 80% of procured items</td>
                        <td className="border p-3">Quarterly</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          Worker Satisfaction
                        </td>
                        <td className="border p-3">≥ 4.5/5.0 rating</td>
                        <td className="border p-3">Quarterly</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          Economic Impact
                        </td>
                        <td className="border p-3">
                          NGN 500M+ annual local spending
                        </td>
                        <td className="border p-3">Annually</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">Default Rate</td>
                        <td className="border p-3">&lt; 5%</td>
                        <td className="border p-3">Monthly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-xl">Reporting Framework</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-blue-700">
                        Monthly Reports
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Beneficiary enrollment and loan disbursements</li>
                        <li>Repayment rates and delinquency tracking</li>
                        <li>Financial performance metrics</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-blue-700">
                        Quarterly Reviews
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Worker satisfaction surveys</li>
                        <li>Local economic impact assessment</li>
                        <li>Supplier performance evaluation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-xl">
                    Adjustment Mechanisms
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-700">
                        Operational Adjustments
                      </h3>
                      <p className="text-muted-foreground">
                        Regular review of loan limits, repayment terms, and
                        product categories based on performance data and worker
                        feedback.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-700">
                        Strategic Pivots
                      </h3>
                      <p className="text-muted-foreground">
                        Ability to modify scheme parameters, expand or contract
                        operations based on financial sustainability and impact
                        metrics.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-red-50">
                <CardTitle className="text-2xl">
                  Risk Mitigation Strategies
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Proactive measures to address potential challenges and ensure
                  program success
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-600">
                        Technical Risks
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Implement robust GIFMIS integration with fallback
                          mechanisms
                        </li>
                        <li>Regular system audits and performance testing</li>
                        <li>Data backup and disaster recovery protocols</li>
                        <li>
                          Dedicated technical support team for rapid issue
                          resolution
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-600">
                        Financial Risks
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Strict credit assessment protocols for all
                          participants
                        </li>
                        <li>Gradual scaling to manage financial exposure</li>
                        <li>Reserve fund for potential defaults</li>
                        <li>Regular financial health checks and audits</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-600">
                        Operational Risks
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Pilot program to identify and address operational
                          challenges
                        </li>
                        <li>Comprehensive training for all stakeholders</li>
                        <li>
                          Clear standard operating procedures and documentation
                        </li>
                        <li>
                          Alternative supplier network to prevent disruptions
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-600">
                        Compliance Risks
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Regular legal reviews to ensure adherence to Nigerian
                          Labour Act
                        </li>
                        <li>
                          Transparent consent processes for all participants
                        </li>
                        <li>Data protection and privacy safeguards</li>
                        <li>
                          Clear communication of terms and conditions to all
                          workers
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-xl">
                    Contingency Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-orange-600">
                        Low Participation Scenario
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Enhanced communication campaign highlighting benefits
                        </li>
                        <li>Incentives for early adopters</li>
                        <li>Simplified enrollment process</li>
                        <li>Focus groups to understand and address concerns</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-orange-600">
                        Supply Chain Disruptions
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>
                          Multiple supplier options for each product category
                        </li>
                        <li>Buffer stock for essential items</li>
                        <li>Local producer development program</li>
                        <li>Alternative distribution channels</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-teal-50">
                  <CardTitle className="text-xl">
                    Stakeholder Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-teal-600">
                        Government Engagement
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Regular progress reporting to all ministries</li>
                        <li>Designated liaison officers for each department</li>
                        <li>Executive steering committee for oversight</li>
                        <li>Clear escalation pathways for issue resolution</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-teal-600">
                        Worker Communication
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Multi-channel communication strategy</li>
                        <li>Regular feedback mechanisms and surveys</li>
                        <li>Transparent reporting of program performance</li>
                        <li>Dedicated helpdesk for queries and concerns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
