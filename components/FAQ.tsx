"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const handleChange = (value: string) => {
    setOpenItem(value === openItem ? undefined : value);
  };

  return (
    <section className="w-full font-header text-black md:my-24 my-12 px-3 py-12">
      <h3 className="md:text-[30px] text-2xl md:text-center text-start font-bold mt-16 mb-6">
        Frequently Asked Questions
      </h3>
      <Accordion
        type="single"
        collapsible
        className="w-full text-start md:px-12"
        value={openItem}
        onValueChange={handleChange}
      >
        <AccordionItem value="item-1" className="text-start">
          <AccordionTrigger className="text-start">
            How does the salary deduction work?
          </AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            Your purchases are automatically deducted from your next salary payment through our secure government payroll integration. The exact amount you spend will be subtracted after other statutory deductions, and you'll receive a detailed payslip showing the transaction.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="text-start">
          <AccordionTrigger className="text-start">
            What can I purchase with this service?
          </AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            You can order essential foodstuffs including rice, beans, garri, cooking oil, pasta, and other household staples. We also offer seasonal produce and protein options. All products meet government-approved quality standards.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-start">
            Is there a limit to how much I can spend?
          </AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            Yes, for your financial safety, your spending limit is calculated as:<br/><br/>
            1. Maximum of 30% of your net salary<br/>
            2. Not exceeding ₦50,000 per month (adjustable based on salary grade)<br/>
            3. Subject to your agency's specific guidelines<br/><br/>
            You can check your available balance in your account dashboard.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-start">How quickly will I receive my order?</AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            Delivery times vary by location:<br/><br/>
            • Abuja/Lagos: Within 24 hours<br/>
            • State capitals: 1-2 business days<br/>
            • Other locations: 2-3 business days<br/><br/>
            We provide real-time tracking once your order is processed. Emergency orders (for hospital workers etc.) can be expedited - contact our support line.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-start">
            What if there's an issue with my order?
          </AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            We guarantee:<br/><br/>
            1. Wrong/missing items: Immediate replacement or account credit<br/>
            2. Quality issues: Full refund processed within 3 working days<br/>
            3. Delivery problems: Escalation to our logistics team within 2 hours<br/><br/>
            Contact our 24/7 support at support@govfood.ng or call 0700-GOV-FOOD.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger className="text-start">Can I use this service if I'm a contract staff?</AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            Currently, this service is available to:<br/><br/>
            ✅ Permanent civil servants<br/>
            ✅ Government agency staff on IPPIS<br/>
            ✅ State government workers (in participating states)<br/><br/>
            Contract staff may be eligible if enrolled in the government's payroll system. Check with your HR department for eligibility.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger className="text-start">
            How do I update my delivery address or contact info?
          </AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            You can update your information in three ways:<br/><br/>
            1. Through your account dashboard on our website/app<br/>
            2. By emailing updates@foodscheme.gov.ng with your staff ID<br/>
            3. Visiting your ministry's welfare office (for bulk updates)<br/><br/>
            For security reasons, address changes require OTP verification sent to your registered phone number.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger className="text-start">What makes this service different from regular stores?</AccordionTrigger>
          <AccordionContent className=" text-[15px]">
            Our government-backed service offers unique advantages:<br/><br/>
            🛡️ <strong>Security</strong>: Verified through your official staff credentials<br/>
            💳 <strong>Payment Flexibility</strong>: No upfront costs - pay with your next salary<br/>
            🏛️ <strong>Official Rates</strong>: Prices locked at government-approved rates<br/>
            🚚 <strong>Priority Delivery</strong>: Dedicated logistics for civil servants<br/>
            📊 <strong>Spending Insights</strong>: Monthly reports to help with budgeting<br/>
            🏥 <strong>Emergency Access</strong>: Special provisions for health workers<br/><br/>
            Plus, all purchases count toward your welfare benefits record.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default FAQ;