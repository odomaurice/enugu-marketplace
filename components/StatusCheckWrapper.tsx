'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ConsentUpload from './ConsentUpload';
  import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StatusCheckWrapper({ children }: { children: React.ReactNode }) {
  const { data: clientSession, status: sessionStatus } = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/employee-dashboard';
  const [showconsentModal, setShowconsentModal] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);


useEffect(() => {
  fetch("/api/auth/session")
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Session fetch failed: ${res.status}`);
      }

      // NextAuth may return 204 No Content if no session
      if (res.status === 204) {
        return null;
      }

      try {
        return await res.json();
      } catch {
        return null;
      }
    })
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
      if (user.is_consent_submitted === false && user.role === 'user') {
        setShowconsentModal(true);
      }

      // if(user.status === "PENDING") {
      //   toast.info("Your account is still pending. Please be patient while your account is approved.");

      // }
      setHasCheckedStatus(true);
    }
  }, [sessionStatus, user, hasCheckedStatus, returnUrl]);



  const handleUploadSuccess = async () => {
    // Refresh session to get updated status
    await getSession();
    setShowconsentModal(false);
  };

  const handleCloseModal = () => {
    setShowconsentModal(false);
    // Optional: You might want to sign out the user here if they cancel
    // signOut({ redirect: false });
  };

  return (
    <>
      {children}
      {user?.token && (
        <ConsentUpload
          isOpen={showconsentModal}
          onClose={handleCloseModal}
          onUploadSuccess={handleUploadSuccess}
          token={user.token}
          returnUrl={returnUrl}
        />
      )}
    </>
  );
}