// src/hooks/useGetUserProfile.jsx
import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8001/api/v1/user/${userId}/profile`, 
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user)); // Payload sérialisable
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserProfile();
  }, [userId, dispatch]);

  return null;
};

export default useGetUserProfile;