'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ComplianceUpload from './ComplianceUpload';
  import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function StatusCheckWrapper({ children }: { children: React.ReactNode }) {
  const { data: clientSession, status: sessionStatus } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/employee-dashboard';
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);


  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setServerUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Session error:", err);
        setIsLoading(false);
      });
  }, []);

  const user = clientSession?.user || serverUser;

  useEffect(() => {
    if (sessionStatus === 'authenticated' && user && !hasCheckedStatus) {
      // Check if user status is PENDING
      if (user.status === 'PENDING' && user.role === 'user') {
        setShowComplianceModal(true);
      }
      setHasCheckedStatus(true);
    }
  }, [sessionStatus, user, hasCheckedStatus, returnUrl]);



  const handleUploadSuccess = async () => {
    // Refresh session to get updated status
    await getSession();
    setShowComplianceModal(false);
  };

  const handleCloseModal = () => {
    setShowComplianceModal(false);
    // Optional: You might want to sign out the user here if they cancel
    // signOut({ redirect: false });
  };

  return (
    <>
      {children}
      {user?.token && (
        <ComplianceUpload
          isOpen={showComplianceModal}
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          token={user.token}
          returnUrl={returnUrl}
        />
      )}
    </>
  );
}