import FulfillmentOfficerLoginForm from '@/components/FulfillmentOfficerLoginForm';

export const metadata = {
  title: 'Fulfillment Officer Login - Food Bank System',
  description: 'Login for fulfillment officers to manage orders and distributions',
};

export default function AgentLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        
        <FulfillmentOfficerLoginForm />
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Enugu . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}