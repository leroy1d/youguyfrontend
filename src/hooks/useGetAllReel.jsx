// src/hooks/useGetAllReel.jsx
import { setReels } from "@/redux/reelSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllReel = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllReel = async () => {
      try {
        const res = await axios.get('http://localhost:8001/api/v1/reel/all', { 
          withCredentials: true 
        });
        if (res.data.success) {
          dispatch(setReels(res.data.reels));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllReel();
  }, [dispatch]);

  return null;
};

export default useGetAllReel;