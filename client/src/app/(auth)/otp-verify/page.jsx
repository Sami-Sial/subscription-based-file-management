"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import OtpVerify from "./OtpVerify";
import { getCurrentUser } from "@/lib/auth";

const Page = () => {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  // status: "loading" | "loggedIn" | "notLoggedIn"

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setStatus("loggedIn");
          // redirect based on role
          if (user.role === "admin") {
            router.replace("/admin/dashboard");
          } else if (user.role === "user") {
            router.replace("/user/dashboard");
          }
        } else {
          setStatus("notLoggedIn");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setStatus("notLoggedIn");
      }
    };

    checkUser();
  }, [router]);

  if (status === "loading") return <Loader />;

  // Only render Register if user is confirmed not logged in
  if (status === "notLoggedIn") return <OtpVerify />;

  // If logged in, don't render anything (redirect is happening)
  return null;
};

export default Page;
